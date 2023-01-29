import { Bot, loop } from "../../bot";
import { getBestRoute } from "../../bot/get-best-route";
import { swapRateLimiter } from "../../bot/limiters";
import { Store } from "../../store";
import { shiftAndPush, toDecimal } from "../../utils";

export const pingPong = async (bot: Omit<Bot, "loadPlugin">) => {
	const tokens = bot.store.getState().bot.tokens;

	if (tokens === undefined || Object.keys(tokens).length !== 2)
		throw new Error("pingPong: tokens are not set or some tokens are missing");

	const getState = bot.store.getState;

	/** get initial out amount */
	const currentInToken = bot.store.getState().bot.currentInToken;
	if (!currentInToken) throw new Error("pingPong: currentInToken is not set");

	const initialInToken = currentInToken;

	const currentOutToken = Object.values(tokens).find(
		(token) => token.address !== currentInToken.address
	);
	if (!currentOutToken) throw new Error("pingPong: currentOutToken is not set");

	const slippageBps = getState().config.strategy.rules?.slippage.bps || 0;

	const initTradeAmount = getState().config.strategy.tradeAmount.jsbi;
	const initTradeAmountAsDecimal = toDecimal(
		getState().config.strategy.tradeAmount.number,
		currentInToken.decimals
	);

	// compute routes
	const routes = await bot.computeRoutes({
		inToken: currentInToken,
		outToken: currentOutToken,
		tradeAmount: initTradeAmount,
		slippageBps,
	});
	const bestRoute = getBestRoute(bot.store, routes);
	if (!bestRoute) throw new Error("No best route found");

	const initialOutAmount = bestRoute.outAmount;
	console.log(
		"🚀 ~ file: ping-pong.ts:43 ~ pingPong ~ initialOutAmount",
		initialOutAmount
	);
	const initialOutAmountAsNumber = bot.utils.JSBItoNumber(initialOutAmount);
	console.log(
		"🚀 ~ file: ping-pong.ts:45 ~ pingPong ~ initialOutAmountAsNumber",
		initialOutAmountAsNumber
	);
	const initialOutAmountAsDecimal = toDecimal(
		initialOutAmountAsNumber,
		currentOutToken.decimals
	);

	const currentPriceAsDecimal = initTradeAmountAsDecimal.div(
		initialOutAmountAsDecimal
	);

	// listener: swap tokens on swapSuccess status
	const switchTokens = ({ store }: { store: Store }) => {
		console.log("switching tokens!");
		// switch tokens
		store.setState((state) => {
			const currentInToken = state.bot.currentInToken;
			const currentOutToken = state.bot.currentOutToken;
			state.bot.currentInToken = currentOutToken;
			state.bot.currentOutToken = currentInToken;
		});
	};
	bot.onStatus("swapSuccess", switchTokens);

	// set initial out amount
	bot.store.setState((state) => {
		// state.routes.currentRoute.output.amount.jsbi = initialOutAmount;
		// state.routes.currentRoute.output.amount.decimal = initialOutAmountAsDecimal;
		// state.routes.currentRoute.price.jsbi = currentPrice;
		// state.routes.currentRoute.price.decimal = currentPriceAsDecimal;
		state.bot.initialOutAmount[currentOutToken.address] = {
			jsbi: initialOutAmount,
			decimal: initialOutAmountAsDecimal,
		};
		state.bot.prevOutAmount[currentOutToken.address] = {
			jsbi: initialOutAmount,
			decimal: initialOutAmountAsDecimal,
		};

		state.bot.initialOutAmount[currentInToken.address] = {
			jsbi: initTradeAmount,
			decimal: initTradeAmountAsDecimal,
		};
		state.bot.prevOutAmount[currentInToken.address] = {
			jsbi: initTradeAmount,
			decimal: initTradeAmountAsDecimal,
		};

		// update price chart and current price
		state.bot.price.current.decimal = currentPriceAsDecimal;
		state.chart.price.values = shiftAndPush(
			state.chart.price.values,
			currentPriceAsDecimal.toNumber()
		);
	});

	// set current out token
	bot.store.setState((state) => {
		state.bot.currentOutToken = currentOutToken;
	});

	const strategy = async () => {
		// set current tokens
		const currentInToken = bot.store.getState().bot.currentInToken;
		if (!currentInToken) throw new Error("pingPong: InToken is not set");

		const currentOutToken = bot.store.getState().bot.currentOutToken;
		if (!currentOutToken) throw new Error("pingPong: OutToken is not set");

		// get trade amount
		const tradeAmount =
			getState().bot.prevOutAmount[currentInToken.address]?.jsbi;

		if (!tradeAmount) throw new Error("pingPong: tradeAmount is not set");

		const tradeAmountAsDecimal =
			getState().bot.prevOutAmount[currentInToken.address]?.decimal;
		console.log(
			"🚀 ~ file: ping-pong.ts:112 ~ strategy ~ tradeAmountAsDecimal",
			tradeAmountAsDecimal
		);

		// get slippage
		const slippageBps = getState().config.strategy.rules?.slippage.bps || 0;

		// compute routes
		const routes = await bot.computeRoutes({
			inToken: currentInToken,
			outToken: currentOutToken,
			tradeAmount,
			slippageBps,
		});

		const bestRoute = getBestRoute(bot.store, routes);
		if (!bestRoute) throw new Error("No best route found");
		// log difference between initial out amount and current out amount

		// prev
		const prevOutAmount = getState().bot.prevOutAmount[currentOutToken.address];
		if (!prevOutAmount) throw new Error("pingPong: prevOutAmount is undefined");
		const prevOutAmountAsNumber = bot.utils.JSBItoNumber(prevOutAmount.jsbi);
		const prevOutAmountAsDecimal = toDecimal(
			prevOutAmountAsNumber,
			currentOutToken.decimals
		);

		// current
		const currentOutAmount = bestRoute.outAmount;
		const currentOutAmountAsNumber = bot.utils.JSBItoNumber(currentOutAmount);
		const currentOutAmountAsDecimal = toDecimal(
			currentOutAmountAsNumber,
			currentOutToken.decimals
		);
		console.log(
			"🚀 ~ file: ping-pong.ts:144 ~ strategy ~ currentOutAmountAsDecimal",
			currentOutAmountAsDecimal
		);

		const isBuy = initialInToken === currentInToken;

		const price = tradeAmountAsDecimal?.div(currentOutAmountAsDecimal);
		console.log("🚀 ~ file: ping-pong.ts:173 ~ strategy ~ price", price);
		if (!price) throw new Error("pingPong: price is undefined");

		const currentPrice = isBuy ? price : toDecimal(1).div(price);

		console.log(
			"🚀 ~ file: ping-pong.ts:147 ~ strategy ~ currentPrice",
			currentPrice
		);
		// update price chart and current price
		bot.store.setState((state) => {
			state.chart.price.values = shiftAndPush(
				state.chart.price.values,
				currentPrice.toNumber()
			);
			state.bot.price.current.decimal = currentPrice;
		});

		// as numbers
		const diffPercentAsNumber = currentOutAmountAsDecimal
			.minus(prevOutAmountAsDecimal)
			.div(prevOutAmountAsDecimal)
			.times(100)
			.toNumber();

		// update potentialProfit chart
		bot.store.setState((state) => {
			state.chart.potentialProfit.values = shiftAndPush(
				state.chart.potentialProfit.values,
				diffPercentAsNumber
			);
		});

		// execute swap if potential profit is above threshold
		const executeAbovePotentialProfit =
			bot.store.getState().config.strategy.rules?.execute?.above
				?.potentialProfit;

		if (
			executeAbovePotentialProfit &&
			diffPercentAsNumber > executeAbovePotentialProfit
		) {
			const isLimiterActive = await swapRateLimiter(bot.store);

			if (!isLimiterActive) {
				bot.store.setState((state) => {
					state.swaps.rateLimiter.value++;
				});
				bot.swap({
					inToken: currentInToken,
					outToken: currentOutToken,
					route: bestRoute,
				});

				// if (isSwapSuccess) {
				// 	// switch tokens
				// 	bot.store.setState((state) => {
				// 		state.bot.currentInToken = currentOutToken;
				// 		state.bot.currentOutToken = currentInToken;
				// 	});
				// }
			}
		}
	};

	// loop
	loop(bot, strategy);
};
