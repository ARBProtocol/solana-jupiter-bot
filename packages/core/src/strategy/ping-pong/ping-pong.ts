import { Bot, loop } from "../../bot";
import { getBestRoute } from "../../bot/get-best-route";
import { swapRateLimiter } from "../../bot/limiters";
import { shiftAndPush, toDecimal } from "../../utils";

export const pingPong = async (bot: Omit<Bot, "loadPlugin">) => {
	const { decimals: tokenADecimals } =
		bot.store.getState().config.tokens.tokenA;
	const { decimals: tokenBDecimals } =
		bot.store.getState().config.tokens.tokenB;

	if (!tokenADecimals || !tokenBDecimals) {
		throw new Error("Token decimals not found");
	}

	bot.store.setState((state) => {
		state.bot.currentOutToken = "tokenB";
	});

	const strategy = async () => {
		// TODO
		const currentOutToken = bot.store.getState().bot.currentOutToken;

		const routes = await bot.computeRoutes();
		const bestRoute = getBestRoute(bot.store, routes);
		if (!bestRoute) throw new Error("No best route found");
		// log difference between initial out amount and current out amount

		// prev
		const prevOutAmount =
			bot.store.getState().bot.prevOutAmount[currentOutToken];
		const prevOutAmountAsNumber = bot.utils.JSBItoNumber(prevOutAmount);
		const prevOutAmountWithDecimals = toDecimal(
			prevOutAmountAsNumber,
			currentOutToken === "tokenA" ? tokenADecimals : tokenBDecimals
		);

		// current
		const currentOutAmount = bestRoute.outAmount;
		const currentOutAmountAsNumber = bot.utils.JSBItoNumber(currentOutAmount);
		const currentOutAmountWithDecimals = toDecimal(
			currentOutAmountAsNumber,
			currentOutToken === "tokenA" ? tokenADecimals : tokenBDecimals
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

		// as numbers
		const diffPercentAsNumber = currentOutAmountWithDecimals
			.minus(prevOutAmountWithDecimals)
			.div(prevOutAmountWithDecimals)
			.times(100)
			.toNumber();

		console.log(
			"🚀 ~ file: ping-pong.ts:52 ~ strategy ~ tradeAmountWithDecimals",
			tradeAmountWithDecimals
		);
		console.log(
			"🚀 ~ file: ping-pong.ts:76 ~ strategy ~ currentOutAmountWithDecimals",
			currentOutAmountWithDecimals
		);
		console.log(
			"🚀 ~ file: ping-pong.ts:93 ~ strategy ~ prevOutAmountWithDecimals",
			prevOutAmountWithDecimals
		);

		console.log(
			"🚀 ~ file: ping-pong.ts:70 ~ strategy ~ diffPercentAsNumber",
			diffPercentAsNumber
		);

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
				const swapResult = bot.swap(bestRoute);

				console.log(
					"🚀 ~ file: ping-pong.ts:115 ~ strategy ~ swapResult",
					swapResult
				);
			}
		}
	};

	// loop
	loop(bot, strategy);
};
