console.clear();
require("dotenv").config();

const { PublicKey } = require("@solana/web3.js");

const fs = require("fs");
const { setup } = require("./setup");

const { calculateProfit, toDecimal, toNumber } = require("./utils");
const { handleExit } = require("./exit");
const keypress = require("keypress");
const ora = require("ora-classic");
const { clearInterval } = require("timers");
const printToConsole = require("./ui");

// read config.json file
const configSpinner = ora({
	text: "Loading config...",
	discardStdin: false,
}).start();
const config = JSON.parse(fs.readFileSync("./config.json"));
configSpinner.succeed("Config loaded!");

// cache
const cache = {
	startTime: new Date(),
	firstSwap: true,
	firstSwapInQueue: false,
	queue: {},
	queueThrottle: 1,
	sideBuy: true,
	iteration: 0,
	iterationPerMinute: {
		start: performance.now(),
		value: 0,
		counter: 0,
	},
	initialBalance: {
		tokenA: 0,
		tokenB: 0,
	},

	currentBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	currentProfit: {
		tokenA: 0,
		tokenB: 0,
	},
	lastBalance: {
		tokenA: 0,
		tokenB: 0,
	},
	profit: {
		tokenA: 0,
		tokenB: 0,
	},
	maxProfitSpotted: {
		buy: 0,
		sell: 0,
	},
	tradeCounter: {
		buy: { success: 0, fail: 0 },
		sell: { success: 0, fail: 0 },
	},
	ui: {
		defaultColor: config.ui.defaultColor,
		showPerformanceOfRouteCompChart: false,
		showProfitChart: true,
		showTradeHistory: true,
		hideRpc: false,
		showHelp: true,
	},
	chart: {
		spottedMax: {
			buy: new Array(120).fill(0),
			sell: new Array(120).fill(0),
		},
		performanceOfRouteComp: new Array(120).fill(0),
	},
	hotkeys: {
		e: false,
		r: false,
	},
	tradingEnabled: config.tradingEnabled,
	swappingRightNow: false,
	tradingMode: config.tradingMode,
	tradeHistory: new Array(),
	performanceOfTxStart: 0,
	availableRoutes: {
		buy: 0,
		sell: 0,
	},
};

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

const failedSwapHandler = (tx, tradeEntry, route) => {
	const msg = tx.error.message;

	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].fail++;

	// update trade history
	config.storeFailedTxInHistory;

	// update trade history
	let tempHistory = cache.tradeHistory || [];
	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;

	// add AMM to blockedAMMs
	const marketInfos = JSON.parse(JSON.stringify(route.marketInfos, null, 2));
	// TODO: add AMM to blockedAMMs if there is error called "Unknown"
	// for (const market of marketInfos) {
	// 	if (msg.toLowerCase().includes("unknown"))
	// 		cache.blockedAMMs[market.amm.id] = msg;
	// }
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

	if (cache.firstSwap) {
		cache.lastBalance.tokenB = tx.outputAmount;
		cache.initialBalance.tokenB = tx.outputAmount;
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
	let tempHistory = cache.tradeHistory || [];

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

	// first swap done
	if (cache.firstSwap) {
		cache.firstSwap = false;
		cache.firstSwapInQueue = false;
	}
};

const pingpongMode = async (jupiter, tokenA, tokenB) => {
	cache.iteration++;
	const date = new Date();
	const i = cache.iteration;
	cache.queue[i] = -1;
	if (cache.firstSwap) cache.firstSwapInQueue = true;
	try {
		// calculate & update iteration per minute
		const iterationTimer =
			(performance.now() - cache.iterationPerMinute.start) / 1000;

		if (iterationTimer >= 60) {
			cache.iterationPerMinute.value = Number(
				cache.iterationPerMinute.counter.toFixed()
			);
			cache.iterationPerMinute.start = performance.now();
			cache.iterationPerMinute.counter = 0;
		} else cache.iterationPerMinute.counter++;

		// Calculate amount that will be used for trade
		const amountToTrade = cache.firstSwap
			? cache.initialBalance.tokenA
			: cache.currentBalance[cache.sideBuy ? "tokenA" : "tokenB"];
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
		const profitOrKillSlippage = cache.firstSwap
			? route.outAmountWithSlippage
			: cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"];

		route.outAmountWithSlippage = profitOrKillSlippage;

		// calculate profitability

		let simulatedProfit = cache.firstSwap
			? 0
			: calculateProfit(baseAmount, await route.outAmount);

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
			config,
		});

		// check profitability and execute tx
		let tx, performanceOfTx;
		if (
			!cache.swappingRightNow &&
			(cache.firstSwap ||
				cache.hotkeys.e ||
				cache.hotkeys.r ||
				simulatedProfit >= config.minPercProfit)
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
							config,
						});
					}
				}, 500);

				[tx, performanceOfTx] = await swap(jupiter, route);

				// stop refreshing status
				clearInterval(printTxStatus);

				const profit = cache.firstSwap
					? 0
					: calculateProfit(
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
				if (tx.error) failedSwapHandler(tx, tradeEntry, route);
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
			config,
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
		if (cache.firstSwap && Object.keys(cache.queue).length === 0) {
			const firstSwapSpinner = ora({
				text: "Executing first swap...",
				discardStdin: false,
			}).start();
			await pingpongMode(jupiter, tokenA, tokenB);
			if (cache.firstSwap) firstSwapSpinner.fail("First swap failed!");
			else firstSwapSpinner.stop();
		} else if (
			!cache.firstSwap &&
			!cache.firstSwapInQueue &&
			Object.keys(cache.queue).length < cache.queueThrottle &&
			cache.tradingMode === "pingpong"
		) {
			await pingpongMode(jupiter, tokenA, tokenB);
		}
	}
};

const run = async () => {
	try {
		const setupSpinner = ora({
			text: "Setting up...",
			discardStdin: false,
		}).start();
		const { jupiter, tokenA, tokenB, blockedAMMs } = await setup(config);
		setupSpinner.succeed("Setup done!");

		// load blocked AMMs to cache
		cache.blockedAMMs = blockedAMMs;

		// set initial & last balance for tokenA
		cache.initialBalance.tokenA = toNumber(config.tradeSize, tokenA.decimals);
		cache.currentBalance.tokenA = cache.initialBalance.tokenA;
		cache.lastBalance.tokenA = cache.initialBalance.tokenA;

		setInterval(() => watcher(jupiter, tokenA, tokenB), config.minInterval);

		// hotkeys
		keypress(process.stdin);

		process.stdin.on("keypress", function (ch, key) {
			// console.log('got "keypress"', key);
			if (key && key.ctrl && key.name == "c") {
				cache.tradingEnabled = false; // stop all trades
				console.log("[CTRL] + [C] PRESS AGAIN TO EXIT!");
				process.stdin.pause();
				process.stdin.setRawMode(false);
				process.stdin.resume();
			}

			// [E] - forced execution
			if (key && key.name === "e") {
				cache.hotkeys.e = true;
			}

			// [R] - revert back swap
			if (key && key.name === "r") {
				cache.hotkeys.r = true;
			}

			// [P] - switch profit chart visibility
			if (key && key.name === "p") {
				cache.ui.showProfitChart = !cache.ui.showProfitChart;
			}

			// [L] - switch performance chart visibility
			if (key && key.name === "l") {
				cache.ui.showPerformanceOfRouteCompChart =
					!cache.ui.showPerformanceOfRouteCompChart;
			}

			// [H] - switch trade history visibility
			if (key && key.name === "t") {
				cache.ui.showTradeHistory = !cache.ui.showTradeHistory;
			}

			// [I] - incognito mode (hide RPC)
			if (key && key.name === "i") {
				cache.ui.hideRpc = !cache.ui.hideRpc;
			}

			// [H] - switch help visibility
			if (key && key.name === "h") {
				cache.ui.showHelp = !cache.ui.showHelp;
			}

			// [S] - simulation mode switch
			if (key && key.name === "s") {
				cache.tradingEnabled = !cache.tradingEnabled;
			}
		});

		process.stdin.setRawMode(true);
		process.stdin.resume();
	} catch (error) {
		console.log(error);
	} finally {
		handleExit(config, cache);
	}
};

run();
