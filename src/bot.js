console.clear();
require("dotenv").config();

const { PublicKey } = require("@solana/web3.js");

const { setup, getInitialOutAmountWithSlippage } = require("./setup");

const {
	calculateProfit,
	toDecimal,
	toNumber,
	updateIterationsPerMin,
} = require("./utils");

const { handleExit } = require("./exit");

const { clearInterval } = require("timers");
const printToConsole = require("./ui");
const cache = require("./cache");
const listenHotkeys = require("./hotkeys");

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

const pingpongMode = async (jupiter, tokenA, tokenB) => {
	cache.iteration++;
	const date = new Date();
	const i = cache.iteration;
	cache.queue[i] = -1;

	try {
		// calculate & update iterations per minute
		updateIterationsPerMin();

		// Calculate amount that will be used for trade
		const amountToTrade =
			cache.currentBalance[cache.sideBuy ? "tokenA" : "tokenB"];
		const baseAmount = cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"];

		// default slippage
		const slippage = 1;

		// set input / output token
		const inputToken = cache.sideBuy ? tokenA : tokenB;
		const outputToken = cache.sideBuy ? tokenB : tokenA;

		// check current routes
		const performanceOfRouteCompStart = performance.now();
		const routes = await jupiter.computeRoutes({
			inputMint: new PublicKey(inputToken.address),
			outputMint: new PublicKey(outputToken.address),
			inputAmount: amountToTrade,
			slippage,
			forceFeech: true,
		});

		// count available routes
		cache.availableRoutes[cache.sideBuy ? "buy" : "sell"] =
			routes.routesInfos.length;

		// update status as OK
		cache.queue[i] = 0;

		const performanceOfRouteComp =
			performance.now() - performanceOfRouteCompStart;

		// choose first route
		const route = await routes.routesInfos[0];

		// update slippage with "profit or kill" slippage
		const profitOrKillSlippage =
			cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"];

		route.outAmountWithSlippage = profitOrKillSlippage;

		// calculate profitability

		let simulatedProfit = calculateProfit(baseAmount, await route.outAmount);

		// store max profit spotted
		if (
			simulatedProfit > cache.maxProfitSpotted[cache.sideBuy ? "buy" : "sell"]
		) {
			cache.maxProfitSpotted[cache.sideBuy ? "buy" : "sell"] = simulatedProfit;
		}

		printToConsole({
			date,
			i,
			performanceOfRouteComp,
			inputToken,
			outputToken,
			tokenA,
			tokenB,
			route,
			simulatedProfit,
			cache,
		});

		// check profitability and execute tx
		let tx, performanceOfTx;
		if (
			!cache.swappingRightNow &&
			(cache.hotkeys.e ||
				cache.hotkeys.r ||
				simulatedProfit >= cache.config.minPercProfit)
		) {
			// hotkeys
			if (cache.hotkeys.e) {
				console.log("[E] PRESSED - EXECUTION FORCED BY USER!");
				cache.hotkeys.e = false;
			}
			if (cache.hotkeys.r) {
				console.log("[R] PRESSED - REVERT BACK SWAP!");
			}

			if (cache.tradingEnabled || cache.hotkeys.r) {
				cache.swappingRightNow = true;
				// store trade to the history
				let tradeEntry = {
					date: date.toLocaleString(),
					buy: cache.sideBuy,
					inputToken: inputToken.symbol,
					outputToken: outputToken.symbol,
					inAmount: toDecimal(route.inAmount, inputToken.decimals),
					expectedOutAmount: toDecimal(route.outAmount, outputToken.decimals),
					expectedProfit: simulatedProfit,
				};

				// start refreshing status
				const printTxStatus = setInterval(() => {
					if (cache.swappingRightNow) {
						printToConsole({
							date,
							i,
							performanceOfRouteComp,
							inputToken,
							outputToken,
							tokenA,
							tokenB,
							route,
							simulatedProfit,
							cache,
						});
					}
				}, 500);

				[tx, performanceOfTx] = await swap(jupiter, route);

				// stop refreshing status
				clearInterval(printTxStatus);

				const profit = calculateProfit(
					cache.currentBalance[cache.sideBuy ? "tokenB" : "tokenA"],
					tx.outputAmount
				);

				tradeEntry = {
					...tradeEntry,
					outAmount: tx.outputAmount || 0,
					profit,
					performanceOfTx,
					error: tx.error?.message || null,
				};

				// handle TX results
				if (tx.error) failedSwapHandler(tradeEntry);
				else {
					if (cache.hotkeys.r) {
						console.log("[R] - REVERT BACK SWAP - SUCCESS!");
						cache.tradingEnabled = false;
						console.log("TRADING DISABLED!");
						cache.hotkeys.r = false;
					}
					successSwapHandler(tx, tradeEntry, tokenA, tokenB);
				}
			}
		}

		if (tx) {
			if (!tx.error) {
				// change side
				cache.sideBuy = !cache.sideBuy;
			}
			cache.swappingRightNow = false;
		}

		printToConsole({
			date,
			i,
			performanceOfRouteComp,
			inputToken,
			outputToken,
			tokenA,
			tokenB,
			route,
			simulatedProfit,
			cache,
		});
	} catch (error) {
		cache.queue[i] = 1;
		console.log(error);
	} finally {
		delete cache.queue[i];
	}
};

const watcher = async (jupiter, tokenA, tokenB) => {
	if (!cache.swappingRightNow) {
		if (
			Object.keys(cache.queue).length < cache.queueThrottle &&
			cache.tradingMode === "pingpong"
		) {
			await pingpongMode(jupiter, tokenA, tokenB);
		}
	}
};

const run = async () => {
	try {
		// set everything up
		const { jupiter, tokenA, tokenB } = await setup();

		// set initial & current & last balance for tokenA
		cache.initialBalance.tokenA = toNumber(
			cache.config.tradeSize,
			tokenA.decimals
		);
		cache.currentBalance.tokenA = cache.initialBalance.tokenA;
		cache.lastBalance.tokenA = cache.initialBalance.tokenA;

		// set initial & last balance for tokenB
		cache.initialBalance.tokenB = await getInitialOutAmountWithSlippage(
			jupiter,
			tokenA,
			tokenB,
			cache.initialBalance.tokenA
		);
		cache.lastBalance.tokenB = cache.initialBalance.tokenB;

		setInterval(
			() => watcher(jupiter, tokenA, tokenB),
			cache.config.minInterval
		);

		// listen for hotkeys
		listenHotkeys();
	} catch (error) {
		console.log(error);
	} finally {
		handleExit();
	}
};

run();
