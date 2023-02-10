const { printToConsole2 } = require("../ui");

const pingpongStrategy = (base) => {
	const actions = base.helpers;
	const currentCycle = base.data.currentCycle;

	const setup = () => {
		actions.setup.setInitialTokenBalances(base, true);
	};

	const execute = () => {
		const amountToTrade = actions.trade.calculateAmountToTrade();
		const baseAmount = actions.trade.calculateBaseAmount();
		const inputToken = actions.trade.tokenToSell(base).value;
		const outputToken = actions.trade.tokenToBuy(base).value;
		let routes;

		currentCycle.performance.routeLookup = actions.app.measurePerformance(
			async () => {
				routes = await actions.trade.calculateRoutes({
					base,
					inputToken,
					outputToken,
					amountToTrade,
					slippage: actions.trade.calculateSlippage(base),
				});

				actions.trade.verifyRoutes(base, routes);
				actions.trade.setAvailableRoutesCount(routes.routesInfos.length);
				actions.trade.setQueueOK();
			}
		);

		// Calculate profitability & store max profit spotted
		actions.trade.setCurrentCycleRoute(base, routes);
		if (actions.trade.isProfitOrKill(base)) {
			currentCycle.route.amountOut = amountToTrade;
		}
		actions.trade.setCurrentCycleSimulatedProfit(
			base,
			baseAmount,
			currentCycle.route
		);
		actions.trade.findAndSetMaxProfit(base);

		printToConsole2(base.data.cache, {
			date: currentCycle.date,
			i: currentCycle.i,
			performanceOfRouteComp: currentCycle.performance.routeLookup,
			inputToken,
			outputToken,
			tokenA: base.data.tokens.tokenA.value,
			tokenB: base.data.tokens.tokenB.value,
			route: currentCycle.route,
			simulatedProfit: currentCycle.simulatedProfit,
		});

		// ------------------
		// check profitability and execute tx
		const startTrade = actions.transaction.canStartTrade(base)
		let tx, performanceOfTx;

		if (startTrade) {
			// Hotkey handlers
			actions.app.handleHotkeyForceExecutionPress(base)
			actions.app.handleHotkeyRevertBackSwapPress(base)

			if (cache.tradingEnabled || cache.hotkeys.r) {

				cache.swappingRightNow = true;
				currentCycle.tradeEntry = base.transaction.buildTradeEntry(base)

				// start refreshing status
				const printTxStatus = setInterval(() => {
					if (cache.swappingRightNow) {
						printToConsole2(base.data.cache, {
							date: currentCycle.date,
							i: currentCycle.i,
							performanceOfRouteComp: currentCycle.performance.routeLookup,
							inputToken,
							outputToken,
							tokenA: base.data.tokens.tokenA.value,
							tokenB: base.data.tokens.tokenB.value,
							route: currentCycle.route,
							simulatedProfit: currentCycle.simulatedProfit,
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

				currentCycle.tradeEntry = {
					...currentCycle.tradeEntry,
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
					successSwapHandler(tx, tradeEntry, tokenA, tokenB, jupiter);
				}

			}

			if (tx) {
				if (!tx.error) {
					// change side
					cache.sideBuy = !cache.sideBuy;
				}
			}

			cache.swappingRightNow = false;

			printToConsole2(base.data.cache, {
				date: currentCycle.date,
				i: currentCycle.i,
				performanceOfRouteComp: currentCycle.performance.routeLookup,
				inputToken,
				outputToken,
				tokenA: base.data.tokens.tokenA.value,
				tokenB: base.data.tokens.tokenB.value,
				route: currentCycle.route,
				simulatedProfit: currentCycle.simulatedProfit,
			});
		}
	};

	return { setup, execute };
};

module.exports = pingpongStrategy;
