import { Bot } from "../../bot";

export const setupInitialValues = async (bot: Omit<Bot, "loadPlugin">) => {
	const getState = bot.store.getState;

	const tokens = getState().bot.tokens;
	if (tokens === undefined || Object.keys(tokens).length !== 2)
		throw new Error("pingPong: tokens are not set or some tokens are missing");

	const currentInToken = getState().bot.currentInToken;
	if (!currentInToken) throw new Error("pingPong: currentInToken is not set");

	const currentOutToken = Object.values(tokens).find(
		(token) => token.address !== currentInToken.address
	);
	if (!currentOutToken) throw new Error("pingPong: currentOutToken is not set");

	const slippageBps = getState().config.strategy.rules?.slippage.bps || 0;

	const initTradeAmount = getState().config.strategy.tradeAmount.jsbi;
	const initTradeAmountAsDecimal = bot.utils.toDecimal(
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
	const bestRoute = bot.jupiter.getBestRoute(bot.store, routes);
	if (!bestRoute) throw new Error("No best route found");

	const initialOutAmount = {
		jsbi: bestRoute.outAmount,
		decimal: bot.utils.toDecimal(
			bot.utils.JSBItoNumber(bestRoute.outAmount),
			currentOutToken.decimals
		),
	};

	const currentPriceAsDecimal = initTradeAmountAsDecimal.div(
		initialOutAmount.decimal
	);

	// set initial out amounts
	bot.store.setState((state) => {
		state.bot.initialOutAmount[currentOutToken.address] = {
			jsbi: initialOutAmount.jsbi,
			decimal: initialOutAmount.decimal,
		};
		state.bot.prevOutAmount[currentOutToken.address] = {
			jsbi: initialOutAmount.jsbi,
			decimal: initialOutAmount.decimal,
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
		state.chart.price.values = bot.utils.shiftAndPush(
			state.chart.price.values,
			currentPriceAsDecimal.toNumber()
		);

		// set current out token
		state.bot.currentOutToken = currentOutToken;
	});
};
