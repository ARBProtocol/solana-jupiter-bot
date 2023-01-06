import { Bot, loop } from "../../bot";
// import { getBestRoute } from "../../bot/getBestRoute";
// import { shiftAndPush, toDecimal } from "../../utils";

export const pingPong = async (bot: Omit<Bot, "loadPlugin">) => {
	const { decimals: tokenADecimals } =
		bot.store.getState().config.tokens.tokenA;
	const { decimals: tokenBDecimals } =
		bot.store.getState().config.tokens.tokenB;

	if (!tokenADecimals || !tokenBDecimals) {
		throw new Error("Token decimals not found");
	}

	const strategy = async () => {
		// TODO
		// const routes = await bot.computeRoutes();
		// const bestRoute = getBestRoute(bot.store, routes);
		// if (!bestRoute) throw new Error("No best route found");
		// // log difference between initial out amount and current out amount
		// const initialOutAmount = bot.store.getState().bot.initialOutAmount.tokenB;
		// const initialOutAmountAsNumber = bot.utils.JSBItoNumber(initialOutAmount);
		// const currentOutAmount = bestRoute.outAmount;
		// const currentOutAmountAsNumber = bot.utils.JSBItoNumber(currentOutAmount);
		// // with decimals
		// const currentOutAmountWithDecimals = toDecimal(
		// 	currentOutAmountAsNumber,
		// 	tokenBDecimals
		// );
		// const tradeAmountAsNumber = bot.utils.JSBItoNumber(
		// 	bot.store.getState().config.strategy.tradeAmount.jsbi
		// );
		// const tradeAmountWithDecimals = toDecimal(
		// 	tradeAmountAsNumber,
		// 	tokenADecimals
		// );
		// const currentPrice = tradeAmountWithDecimals.div(
		// 	currentOutAmountWithDecimals
		// );
		// // update price chart and current price
		// bot.store.setState((state) => {
		// 	state.chart.price.values = shiftAndPush(
		// 		state.chart.price.values,
		// 		currentPrice.toNumber()
		// 	);
		// 	state.bot.price.current.decimal = currentPrice;
		// });
		// // as numbers
		// // const diffAsNumber = bot.utils.JSBItoNumber(diff);
		// const diffPercentAsNumber =
		// 	(currentOutAmountAsNumber /
		// 		initialOutAmountAsNumber /
		// 		initialOutAmountAsNumber) *
		// 	100;
		// // update potentialProfit chart
		// bot.store.setState((state) => {
		// 	state.chart.potentialProfit.values = shiftAndPush(
		// 		state.chart.potentialProfit.values,
		// 		diffPercentAsNumber
		// 	);
		// });
	};

	// loop
	loop(bot, strategy);
};
