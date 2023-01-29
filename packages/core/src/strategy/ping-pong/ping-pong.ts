import { Bot, loop } from "../../bot";
import { getBestRoute } from "../../bot/get-best-route";
import { swapRateLimiter } from "../../bot/limiters";
import { setupInitialValues } from "./setup-initial-values";

export const pingPong = async (bot: Omit<Bot, "loadPlugin">) => {
	const getState = bot.store.getState;

	// setup initial values
	setupInitialValues(bot);

	/** local variables */
	let isBuyBack = false;

	/** listeners */

	// switch tokens on swapSuccess status
	bot.onStatus("swapSuccess", ({ store }) => {
		console.log("switching tokens!");
		// switch tokens
		store.setState((state) => {
			const currentInToken = state.bot.currentInToken;
			const currentOutToken = state.bot.currentOutToken;
			state.bot.currentInToken = currentOutToken;
			state.bot.currentOutToken = currentInToken;
		});

		// toggle isBuyBack
		isBuyBack = !isBuyBack;
	});

	/**
	 * THE STRATEGY
	 *
	 * name: pingPong
	 * tokens: A, B (2)
	 *
	 * description:
	 * 1. TX 1: buy A with B
	 * 2. TX 2: sell B for A (buy back)
	 * 3. repeat
	 *
	 */
	const strategy = async () => {
		// set current tokens
		const currentInToken = getState().bot.currentInToken;
		if (!currentInToken) throw new Error("pingPong: InToken is not set");

		const currentOutToken = getState().bot.currentOutToken;
		if (!currentOutToken) throw new Error("pingPong: OutToken is not set");

		// get trade amount (inAmount)
		const tradeAmount = getState().bot.prevOutAmount[currentInToken.address];
		if (!tradeAmount) throw new Error("pingPong: tradeAmount is not set");

		// get prev out amount (outAmount) for current out token
		const prevOutAmount = getState().bot.prevOutAmount[currentOutToken.address];
		if (!prevOutAmount) throw new Error("pingPong: prevOutAmount is undefined");

		// get slippage
		const slippageBps = getState().config.strategy.rules?.slippage.bps || 0;

		/**
		 * JUPITER
		 * For now we are only using Jupiter's default computeRoutes
		 * We will add PRISM in the future
		 */

		// compute routes
		const routes = await bot.computeRoutes({
			inToken: currentInToken,
			outToken: currentOutToken,
			tradeAmount: tradeAmount.jsbi,
			slippageBps,
		});

		// get best route
		const bestRoute = getBestRoute(bot.store, routes);
		if (!bestRoute) throw new Error("No best route found");

		// current
		const currentOutAmount = {
			decimal: bot.utils.toDecimal(
				bot.utils.JSBItoNumber(bestRoute.outAmount),
				currentOutToken.decimals
			),
		};

		// calculate current price - always as initial inToken/outToken
		const price = tradeAmount.decimal.div(currentOutAmount.decimal);
		if (!price) throw new Error("pingPong: price is undefined");
		const currentPrice = isBuyBack ? bot.utils.toDecimal(1).div(price) : price;

		// calculate potential profit
		const potentialProfit = currentOutAmount.decimal
			.minus(prevOutAmount.decimal)
			.div(prevOutAmount.decimal)
			.times(100)
			.toNumber();

		bot.store.setState((state) => {
			// update price chart
			state.chart.price.values = bot.utils.shiftAndPush(
				state.chart.price.values,
				currentPrice.toNumber()
			);

			// update current price
			state.bot.price.current.decimal = currentPrice;

			// update potentialProfit chart
			state.chart.potentialProfit.values = bot.utils.shiftAndPush(
				state.chart.potentialProfit.values,
				potentialProfit
			);
		});

		// execute swap if potential profit is above threshold
		const threshold =
			getState().config.strategy.rules?.execute?.above?.potentialProfit;

		if (!threshold) throw new Error("pingPong: threshold is undefined");

		if (threshold && potentialProfit > threshold) {
			// check if swap rate limiter is active
			const isLimiterActive = await swapRateLimiter(bot.store);

			if (!isLimiterActive) {
				bot.store.setState((state) => {
					state.swaps.rateLimiter.value++;
				});

				// execute swap
				bot.swap({
					inToken: currentInToken,
					outToken: currentOutToken,
					route: bestRoute,
				});
			}
		}
	};

	// loop
	loop(bot, strategy);
};
