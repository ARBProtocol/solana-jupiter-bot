const { toDecimal } = require("../../utils");

const transactionHelpers = {
	canStartTrade: (base) => {
		const cache = base.data.cache;
		const config = base.data.cache.config;
		const currentCycle = base.data.currentCycle;

		const outputToken = base.helpers.trade.tokenToBuy(base).value;
		const tokenA = base.data.tokens.tokenA.value;

		// Condition breakdown
		const hotkeysPressed = cache.hotkeys.e || cache.hotkeys.r;
		const profitMarginOk = currentCycle.simulatedProfit >= config.minPercProfit;
		const isSameToken = outputToken.symbol == tokenA.symbol;
		const isSwapBack = cache?.swapBack == true && isSameToken;

		const tradeConditionsMet = hotkeysPressed || profitMarginOk || isSwapBack;

		return !cache.swappingRightNow && tradeConditionsMet;
	},

	buildTradeEntry: (base) => {
		const currentCycle = base.data.currentCycle;
		const route = base.data.currentCycle.route;
		const actions = base.helpers;

		let date = currentCycle.date.toLocaleString();
		let buy = base.data.cache.sideBuy;
		let inputToken = actions.trade.tokenToSell(base).value.symbol;
		let outputToken = actions.trade.tokenToBuy(base).value.symbol;
		let expectedProfit = currentCycle.simulatedProfit;
		let inAmount = toDecimal(
			Number(route.inAmount.toString()),
			inputToken.decimals
		);
		let expectedOutAmount = toDecimal(
			Number(route.outAmount.toString()),
			outputToken.decimals
		);

		return {
			date,
			buy,
			inputToken,
			outputToken,
			inAmount,
			expectedOutAmount,
			expectedProfit,
		};
	},
};

module.exports = transactionHelpers;
