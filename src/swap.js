const { calculateProfit, toDecimal } = require("./utils");
const cache = require("./cache");

const swap = async (jupiter, route) => {
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		const { execute } = await jupiter.exchange({
			routeInfo: route,
		});
		const result = await execute();

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [result, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};
exports.swap = swap;
// this needs some work
const failedSwapHandler = (tradeEntry) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].fail++;

	// update trade history
	cache.config.storeFailedTxInHistory;

	// update trade history
	let tempHistory = cache.tradeHistory;
	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;
};
exports.failedSwapHandler = failedSwapHandler;
const successSwapHandler = (tx, tradeEntry, tokenA, tokenB) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].success++;

	// update balance
	if (cache.sideBuy) {
		cache.lastBalance.tokenA = cache.currentBalance.tokenA;
		cache.currentBalance.tokenA = 0;
		cache.currentBalance.tokenB = tx.outputAmount;
	} else {
		cache.lastBalance.tokenB = cache.currentBalance.tokenB;
		cache.currentBalance.tokenB = 0;
		cache.currentBalance.tokenA = tx.outputAmount;
	}

	// update profit
	if (cache.sideBuy) {
		cache.currentProfit.tokenA = 0;
		cache.currentProfit.tokenB = calculateProfit(
			cache.initialBalance.tokenB,
			cache.currentBalance.tokenB
		);
	} else {
		cache.currentProfit.tokenB = 0;
		cache.currentProfit.tokenA = calculateProfit(
			cache.initialBalance.tokenA,
			cache.currentBalance.tokenA
		);
	}

	// update trade history
	let tempHistory = cache.tradeHistory;

	tradeEntry.inAmount = toDecimal(
		tx.inputAmount,
		cache.sideBuy ? tokenA.decimals : tokenB.decimals
	);
	tradeEntry.outAmount = toDecimal(
		tx.outputAmount,
		cache.sideBuy ? tokenB.decimals : tokenA.decimals
	);

	tradeEntry.profit = calculateProfit(
		cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"],
		tx.outputAmount
	);

	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;
};
exports.successSwapHandler = successSwapHandler;
