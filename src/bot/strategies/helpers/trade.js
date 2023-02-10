const JSBI = require("jsbi");
const { PublicKey } = require("@solana/web3.js");

const tradeHelpers = {
	calculateAmountToTrade: (base) => {
		return base.data.cache.config.tradeSize.strategy === "cumulative"
			? base.data.cache.currentBalance[tradeHelpers.tokenToSell(base).name]
			: base.data.cache.initialBalance[tradeHelpers.tokenToSell(base).name];
	},

	calculateBaseAmount: (base) => {
		return tradeHelpers.isSingleToken(base)
			? tradeHelpers.calculateAmountToTrade(base)
			: base.data.cache.lastBalance[tradeHelpers.tokenToBuy(base).name];
	},

	calculateProfit: (oldVal, newVal) => {
		return ((newVal - oldVal) / oldVal) * 100;
	},

	calculateRouteProfitability: (base, baseAmount, route) => {
		const r = route ? route : base.data.currentCycle.route;
		const amount = baseAmount
			? baseAmount
			: tradeHelpers.calculateBaseAmount(base);

		return tradeHelpers.calculateProfit(amount, Number(r.outAmount.toString()));
	},

	calculateRoutes: async ({
		base,
		inputToken,
		outputToken,
		amountToTrade,
		slippage,
	}) => {
		const amount =
			amountToTrade instanceof JSBI
				? amountToTrade
				: JSBI.BigInt(amountToTrade);

		const routes = await base.jupiter.computeRoutes({
			inputMint: new PublicKey(inputToken.address),
			outputMint: new PublicKey(outputToken.address),
			inputAmount: amount,
			slippageBps: slippage * 100,
			forceFetch: true,
		});

		return routes;
	},

	calculateSlippage: (base) => {
		return typeof base.data.cache.config.slippage === "number"
			? base.data.cache.config.slippage
			: 1;
	},

	canStartCycle: (base) => {
		const cache = base.data.cache;
		return (
			!cache.swappingRightNow &&
			Object.keys(cache.queue).length < cache.queueThrottle
		);
	},

	currentTradeType: (base) => {
		return base.data.cache.sideBuy ? "buy" : "sell";
	},

	findAndSetMaxProfit: (base) => {
		const profit = base.data.currentCycle.simulatedProfit;

		if (tradeHelpers.isMaxProfit(base, profit)) {
			tradeHelpers.setMaxProfit(base, profit);
			return profit;
		}
	},

	getMaxProfit: (base) => {
		const tradeType = tradeHelpers.currentTradeType(base);
		return base.data.cache.maxProfitSpotted[tradeType];
	},

	isMaxProfit: (base, simulatedProfit) => {
		const profit = simulatedProfit
			? simulatedProfit
			: base.data.currentCycle.simulatedProfit;
		return profit > tradeHelpers.getMaxProfit(base);
	},

	isProfitOrKill: (base) => {
		return base.data.cache.config.slippage === "profitOrKill";
	},

	isSingleToken: (base) => {
		const values = Object.values(base.data.tokens)
			.map((token) => token.value)
			.filter((value) => value !== null);
		const hasOneUniqueValue = new Set(values).size === 1;
		return hasOneUniqueValue;
	},

	// resetCurrentCycle: (base) => {
	// 	const tradeType = tradeHelpers.currentTradeType(base);
	// 	base.data.cache.availableRoutes[tradeType] = routeCount;
	// },

	setAvailableRoutesCount: (base, routeCount) => {
		const tradeType = tradeHelpers.currentTradeType(base);
		base.data.cache.availableRoutes[tradeType] = routeCount;
	},

	setMaxProfit: (base, profit) => {
		const tradeType = tradeHelpers.currentTradeType(base);
		base.data.cache.maxProfitSpotted[tradeType] = profit;
		return profit;
	},

	setCurrentCycleRoute: (base, routes) => {
		base.data.currentCycle.route = routes.routesInfos[0];
		return base.data.currentCycle.route;
	},

	setCurrentCycleSimulatedProfit: (base, baseAmount, route) => {
		const profit = tradeHelpers.calculateRouteProfitability(
			base,
			baseAmount,
			route
		);

		base.data.currentCycle.simulatedProfit = profit;
		return base.data.currentCycle.simulatedProfit;
	},

	startCurrentCycle: (base) => {
		base.data.cache.iteration += 1;

		// Reset Current Cycle
		base.data.currentCycle.i = base.data.cache.iteration;
		base.data.currentCycle.date = new Date();
		base.data.currentCycle.route = null;
		base.data.currentCycle.simulatedProfit = null;

		tradeHelpers.setQueueBusy(base);
		tradeHelpers.updateIterationsPerMin(base);
	},

	setQueue: (base, value) => {
		const cache = base.data.cache;
		cache.queue[cache.iteration] = value;
		return cache.queue[cache.iteration];
	},

	setQueueBusy: (base) => {
		return tradeHelpers.setQueue(base, -1);
	},

	setQueueOk: (base) => {
		return tradeHelpers.setQueue(base, 0);
	},

	updateIterationsPerMin: (base) => {
		const iterationPerMinute = base.data.cache.iterationPerMinute;
		const iterationTimer =
			(performance.now() - iterationPerMinute.start) / 1000;

		if (iterationTimer >= 60) {
			iterationPerMinute.value = Number(iterationPerMinute.counter.toFixed());
			iterationPerMinute.start = performance.now();
			iterationPerMinute.counter = 0;
		} else iterationPerMinute.counter++;
	},

	tokenToBuy: (base) => {
		return tokenToTrade(base, !base.data.cache.sideBuy);
	},

	tokenToSell: (base) => {
		return tokenToTrade(base, base.data.cache.sideBuy);
	},

	verifyRoutes: (base, routes) => {
		const hasRoutesInfos = Object.hasOwn(routes, "routesInfos");
		let message;

		if (hasRoutesInfos && routes.routesInfos.length === 0) {
			message = "No routes found or something is wrong with RPC / Jupiter!";
			base.helpers.exit.exitProcess({ message }, base.data.cache);
		}

		if (!hasRoutesInfos) {
			message = "Something is wrong with RPC / Jupiter!";
			base.helpers.exit.exitProcess({ message }, base.data.cache);
		}
	},
};

function tokenToTrade(base, isBuyTrade) {
	const isSingle = tradeHelpers.isSingleToken(base);
	const token =
		isSingle || isBuyTrade ? base.data.tokens.tokenA : base.data.tokens.tokenB;

	return token;
}

module.exports = tradeHelpers;
