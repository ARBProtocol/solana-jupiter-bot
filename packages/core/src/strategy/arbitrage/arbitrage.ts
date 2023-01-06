import { Bot } from "../../bot";
import { loop } from "../../bot/";
import { getBestRoute } from "../../bot/getBestRoute";
import { swapRateLimiter } from "../../bot/limiters";
import { toDecimal, shiftAndPush } from "../../utils";

export const arbitrage = async (bot: Omit<Bot, "loadPlugin">) => {
	// get decimals
	const { decimals: tokenADecimals } =
		bot.store.getState().config.tokens.tokenA;
	const { decimals: tokenBDecimals } =
		bot.store.getState().config.tokens.tokenB;

	if (!tokenADecimals || !tokenBDecimals) {
		throw new Error("Token decimals not found");
	}

	const strategy = async () => {
		const routes = await bot.computeRoutes();

		const bestRoute = getBestRoute(bot.store, routes);
		if (!bestRoute) throw new Error("No best route found");

		// log difference between initial out amount and current out amount
		const initialOutAmount = bot.store.getState().bot.initialOutAmount.tokenB;
		const initialOutAmountAsNumber = bot.utils.JSBItoNumber(initialOutAmount);

		const currentInAmount = bestRoute.inAmount;
		const currentInAmountAsNumber = bot.utils.JSBItoNumber(currentInAmount);

		const currentInAmountWithDecimals = toDecimal(
			currentInAmountAsNumber,
			tokenADecimals
		);

		const currentOutAmount = bestRoute.outAmount;
		const currentOutAmountAsNumber = bot.utils.JSBItoNumber(currentOutAmount);
		// with decimals
		const currentOutAmountWithDecimals = toDecimal(
			currentOutAmountAsNumber,
			tokenBDecimals
		);

		const tradeAmountAsNumber = bot.utils.JSBItoNumber(
			bot.store.getState().config.strategy.tradeAmount.jsbi
		);
		const tradeAmountWithDecimals = toDecimal(
			tradeAmountAsNumber,
			tokenADecimals
		);

		const currentPrice = tradeAmountWithDecimals.div(
			currentOutAmountWithDecimals
		);
		// update price chart and current price
		bot.store.setState((state) => {
			state.chart.price.values = shiftAndPush(
				state.chart.price.values,
				currentPrice.toNumber()
			);

			state.bot.price.current.decimal = currentPrice;
		});

		const diffPercentAsNumber = currentOutAmountWithDecimals
			.minus(currentInAmountWithDecimals)
			.div(currentInAmountWithDecimals)
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

			// const slippageBps = bot.store.getState().config.strategy.rules?.slippage.bps;

			if (!isLimiterActive) {
				bot.store.setState((state) => {
					state.swaps.rateLimiter.value++;
				});
				bot.swap(bestRoute);
			}
		}
	};
	// loop
	loop(bot, strategy);
};
