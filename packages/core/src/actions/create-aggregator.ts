import Piscina from "piscina";
import { GlobalStore } from "src/store";
import { shiftAndPush, thingToMulti } from "src/utils";
import {
	Aggregator,
	AggregatorComputeRoutesMethod,
	AggregatorInitMethod,
	AggregatorWorker,
	RuntimeAggregator,
} from "src/types/aggregator";
import { Logger } from "./public/create-logger";
import { TradeHistoryEntry } from "src/types/trade-history";

export const createAggregator = (
	aggregatorAdapter: AggregatorWorker,
	store: GlobalStore,
	logger: Logger
) => {
	logger.info("createAggregator:loading " + aggregatorAdapter);
	if (!aggregatorAdapter)
		throw new Error("createAggregator: no aggregator provided");

	/**
	 * Internal aggregator that manages the aggregator worker
	 */
	const Aggregator: RuntimeAggregator = {
		id: "init",
		isInitialized: false,
		worker: null,
		tokens: [],
		async getTokens() {
			if (!this.worker) {
				throw new Error("internalAggregator: No worker created");
			}

			const tokens = await this.worker.run({
				call: "getTokens",
				args: [],
			});

			if (!tokens) {
				throw new Error("internalAggregator: No tokens returned");
			}

			return tokens;
		},
		async init(config) {
			logger.debug("internalAggregator:init");
			const aggregatorWorker = new Piscina({
				filename: aggregatorAdapter,
				// TODO: explore if we can use more threads here, make this configurable
				maxThreads: 1,
			});

			if (!aggregatorWorker) {
				throw new Error("internalAggregator: No worker created");
			}
			// TODO: get aggregator id and set it here
			const result: Awaited<ReturnType<AggregatorInitMethod>> =
				await aggregatorWorker.run({ call: "init", args: [config] });

			if (!result.success) {
				store.setState((state) => {
					state.status.value = "aggregators:error";
					state.status.updatedAt = Date.now();
				});

				if ("unknown" in result.error) {
					const msg = `internalAggregator:init:error:unknown: Aggregator failed to initialize. Try again or change RPC,\n AggErrorMsg: ${result.error.message}`;
					logger.error(msg);
					throw new Error(msg);
				}

				if (result.error.missingData) {
					// TODO: handle missing data, retry?

					// update stats
					store.setState((state) => {
						if (state.stats.aggregators[this.id]) {
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.missingData.value++;
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.missingData.updatedAtRel =
								performance.now();
						}
					});
					const msg = `internalAggregator:init:error:missingData: Aggregator failed to initialize. Try again or change RPC,\n AggErrorMsg: ${result.error.message}`;
					logger.error(msg);
					throw new Error(msg);
				}

				if (result.error.rpc429) {
					// update stats
					store.setState((state) => {
						if (state.stats.aggregators[this.id]) {
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpc429.value++;
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpc429.updatedAtRel =
								performance.now();
						}
					});

					logger.error("internalAggregator:init:rpc429");
					throw new Error("internalAggregator: Too many requests");
				}

				if (result.error.rpc500) {
					// update stats
					store.setState((state) => {
						if (state.stats.aggregators[this.id]) {
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpcOther.value++;
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpcOther.updatedAtRel =
								performance.now();
						}
					});

					logger.error("internalAggregator:init:rpc500");
					throw new Error("internalAggregator: Internal server error");
				}

				if (result.error.rpc503) {
					// update stats
					store.setState((state) => {
						if (state.stats.aggregators[this.id]) {
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpcOther.value++;
							// @ts-expect-error FIXME: fix this
							state.stats.aggregators[this.id].errors.rpcOther.updatedAtRel =
								performance.now();
						}
					});

					logger.error("internalAggregator:init:rpc503");
					throw new Error("internalAggregator: Service unavailable");
				}
			} else {
				if (result.aggregatorId.length === 0) {
					const msg = "internalAggregator:init:aggregatorId empty string";
					logger.error(msg);
					throw new Error(msg);
				}

				// init stats object
				const updatedAtRel = performance.now();
				const initWithZero = {
					value: 0,
					updatedAtRel,
				};
				store.setState((state) => {
					state.stats.aggregators[result.aggregatorId] = {
						calls: {
							computeRoutes: initWithZero,
							init: {
								value: 1,
								updatedAtRel,
							},
						},
						errors: {
							missingData: initWithZero,
							rpc429: initWithZero,
							rpcOther: initWithZero,
							unknown: initWithZero,
						},
					};
				});

				this.worker = aggregatorWorker;
				this.id = result.aggregatorId;
				this.isInitialized = true;
			}

			logger.debug("internalAggregator:init:done");
		},
		async computeRoutes({
			inToken,
			outToken,
			amount,
			slippage,
			runtimeId,
			done,
		}) {
			logger.debug(
				{
					runtimeId,
					inToken,
					outToken,
					amount: Number(amount),
					slippage,
				},
				"internalAggregator:computeRoutes:started"
			);

			if (!this.worker) {
				const msg = "internalAggregator: No worker created";
				logger.error(msg);
				throw new Error(msg);
			}

			if (!inToken || !outToken || !amount || !slippage) {
				const msg =
					"internalAggregator: missing required params inToken, outToken, amount, slippage";
				logger.error(msg);
				throw new Error(msg);
			}

			let result:
				| undefined
				| Awaited<ReturnType<AggregatorComputeRoutesMethod<unknown, unknown>>>;

			const inTokenInfo = this.tokens.find(
				(token) => token.address === inToken
			);

			const outTokenInfo = this.tokens.find(
				(token) => token.address === outToken
			);

			try {
				// update stats
				store.setState((state) => {
					if (state.stats.aggregators[this.id]) {
						// @ts-expect-error FIXME: fix this
						state.stats.aggregators[this.id].calls.computeRoutes.value++;
						// @ts-expect-error FIXME: fix this
						state.stats.aggregators[this.id].calls.computeRoutes.updatedAtRel =
							performance.now();
					}
				});

				// report status change
				store.setState((state) => {
					state.status.value = "aggregator:computingRoutes";
					state.status.updatedAt = performance.now();
				});

				// set timeout for checking if the request is taking too long
				const computeRoutesTimeout = setTimeout(() => {
					logger.error(
						{ runtimeId },
						"internalAggregator:computeRoutes:timeout"
					);
					// report status change
					store.setState((state) => {
						state.status.value = "aggregator:computingRoutesTimeout";
						state.status.updatedAt = performance.now();
					});

					// FIXME: handle this better
					console.error("internalAggregator:computeRoutes:timeout");
					process.exit(1);
				}, 20000);

				result = await this.worker.run({
					call: "computeRoutes",
					args: [
						{
							// careful, this is not type safe
							inToken,
							outToken,
							amount,
							slippage,
							runtimeId,
						},
					],
				});

				clearTimeout(computeRoutesTimeout);

				if (!result) {
					const msg = "internalAggregator: No result returned";
					logger.error(msg);
					throw new Error(msg);
				}

				if (!result?.success) {
					// report status change
					store.setState((state) => {
						state.status.value = "aggregator:computingRoutesError";
						state.status.updatedAt = performance.now();
					});

					if ("unknown" in result.error) {
						// update stats
						store.setState((state) => {
							if (state.stats.aggregators[this.id]) {
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.unknown.value++;
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.unknown.updatedAtRel =
									performance.now();
							}
						});

						const msg = `internalAggregator:computeRoutes:unknown ${result.error?.message}`;
						logger.error(
							{
								error: result.error,
							},
							msg
						);
						throw new Error(msg);
					}

					if (result.error.missingData) {
						// update stats
						store.setState((state) => {
							if (state.stats.aggregators[this.id]) {
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.missingData.value++;
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[
									this.id
								].errors.missingData.updatedAtRel = performance.now();
							}
						});

						logger.error(
							"internalAggregator:computeRoutes:missingData - restart or change RPC"
						);
						throw new Error("internalAggregator: Missing data");
					}

					if (result.error.rpc429) {
						// update stats
						store.setState((state) => {
							if (state.stats.aggregators[this.id]) {
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.rpc429.value++;
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.rpc429.updatedAtRel =
									performance.now();
							}
						});

						logger.error("internalAggregator:computeRoutes:rpc429");
						throw new Error("internalAggregator: Too many requests");
					}

					if (result.error.rpc500) {
						// update stats
						store.setState((state) => {
							if (state.stats.aggregators[this.id]) {
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.rpcOther.value++;
								// @ts-expect-error FIXME: fix this
								state.stats.aggregators[this.id].errors.rpcOther.updatedAtRel =
									performance.now();
							}
						});

						logger.error("internalAggregator:computeRoutes:rpc500");
						throw new Error("internalAggregator: Internal server error");
					}

					const msg = "internalAggregator: No result returned";
					logger.error(msg);
					throw new Error(msg);
				}

				if (!inTokenInfo || !outTokenInfo) {
					const msg = "internalAggregator: No token info found";
					logger.error(msg);
					throw new Error(msg);
				}

				if (!result.routes || !result.routes[0]) {
					const msg = "internalAggregator: No routes found";
					logger.error(msg);
					throw new Error(msg);
				}

				const routesLatency = result.meta.lookupPerformance;

				store.setState((state) => {
					// report status change
					state.status.value = "aggregator:computingRoutesSuccess";
					state.status.updatedAt = performance.now();

					// update computeRoutesLatency chart
					if (routesLatency)
						state.chart.computeRoutesLatency.values = shiftAndPush(
							state.chart.computeRoutesLatency.values,
							routesLatency
						);
					state.chart.computeRoutesLatency.updatedAtRel = performance.now();
				});

				// calculate current price
				const inAmount = thingToMulti.fromBlockchainValue(
					result.routes[0].amountIn,
					inTokenInfo.decimals
				);

				const outAmount = thingToMulti.fromBlockchainValue(
					result.routes[0].amountOut,
					outTokenInfo.decimals
				);

				if (!inAmount || !outAmount) {
					const msg =
						"internalAggregator:computeRoutes:error inAmount || outAmount not defined";
					logger.error(msg);
					throw new Error(msg);
				}

				const currentPrice = outAmount.uiValue.decimal.div(
					inAmount.uiValue.decimal
				);
				const currentPriceInverted = inAmount.uiValue.decimal.div(
					outAmount.uiValue.decimal
				);

				// how many hops and on which markets
				const hops = result.routes[0].hops;

				store.setState((state) => {
					// set current strategy info
					state.strategies.current = {
						...state.strategies.current,
						runtimeId,
						inToken: inTokenInfo,
						outToken: outTokenInfo,
						inAmount: inAmount,
						outAmount: outAmount,
						slippage,
						price: currentPrice.toNumber(),
						priceInverted: currentPriceInverted.toNumber(),
						hops,
					};
					// update price chart
					state.chart.price.values = shiftAndPush(
						state.chart.price.values,
						currentPrice.toNumber()
					);
					state.chart.price.updatedAtRel = performance.now();
				});
			} catch (error) {
				const msg = "internalAggregator:computeRoutes:error";
				logger.error({ error }, msg);
			}

			if (!result) {
				const msg =
					"internalAggregator:computeRoutes:error: No result returned";
				logger.error(msg);
				throw new Error(msg);
			}

			// TODO: validate result

			done && done(result);

			return result;
		},
		async execute(
			{
				runtimeId,
				originalRoutes,
				inToken,
				outToken,
				amount,
				slippage,
				priorityFeeMicroLamports,
				calculateProfit,
			},
			internalOptions
		) {
			logger.debug(
				{
					runtimeId,
					inToken,
					outToken,
					amount,
					slippage,
					priorityFeeMicroLamports,
				},
				"internalAggregator:execute:started"
			);
			const isInternalRequest =
				internalOptions && internalOptions._internalRequest;

			const limitersState = store.getState().limiters;
			const pendingLimiter = limitersState.transactions.pending;
			const executionRateLimiter = limitersState.transactions.executionRate;

			// report status change
			store.setState((state) => {
				state.status.value = "aggregator:execute:start";
				state.status.updatedAt = performance.now();
			});

			if (pendingLimiter.active && !isInternalRequest) {
				const msg =
					"internalAggregator:execute:pendingLimiter: Too many concurrent transactions";

				logger.debug(msg);
				return {
					status: "limitedByPendingLimiter",
					meta: {
						runtimeId,
						executePerformance: 0,
						error: {
							_pendingLimiter: true,
						},
					},
				};
			}

			if (executionRateLimiter.active && !isInternalRequest) {
				const msg = `internalAggregator:execute:executionRateLimiter: Max transactions per ${executionRateLimiter.timeWindowMs} ms reached!`;
				logger.debug(msg);
				return {
					status: "limitedByExecutionRateLimiter",
					meta: {
						runtimeId,
						executePerformance: 0,
						error: {
							_executionRateLimiter: true,
						},
					},
				};
			}

			if (!this.worker) {
				throw new Error("internalAggregator:execute: No worker created");
			}

			if (!runtimeId) {
				throw new Error(
					"internalAggregator:execute: missing required params runtimeId"
				);
			}

			const inTokenInfo = this.tokens.find(
				(token) => token.address === inToken
			);

			const outTokenInfo = this.tokens.find(
				(token) => token.address === outToken
			);

			if (!inTokenInfo || !outTokenInfo) {
				throw new Error("internalAggregator:execute: No token info found");
			}
			const inAmountMulti = thingToMulti.fromBlockchainValue(
				amount,
				inTokenInfo.decimals
			);

			if (!inAmountMulti) {
				const msg =
					"internalAggregator:execute:error inAmountMulti is undefined";
				logger.error(msg);
				throw new Error(msg);
			}

			// Add entry to trade history with pending status
			const pendingTxHistoryEntry: TradeHistoryEntry = {
				uid: runtimeId,
				createdAt: Date.now(),
				updatedAt: Date.now(),
				status: "pending",
				inTokenAddress: inToken,
				outTokenAddress: outToken,
				inTokenSymbol: inTokenInfo.symbol,
				inTokenDecimals: inTokenInfo.decimals,
				outTokenSymbol: outTokenInfo.symbol,
				outTokenDecimals: outTokenInfo.decimals,
				inAmount: inAmountMulti.number,
				inUiAmount: inAmountMulti.uiValue.number,
				slippage: slippage,
				isArbAccTx: internalOptions?._isArbAccTx,
			};

			store.setState((state) => {
				state.tradeHistory[pendingTxHistoryEntry.uid] = pendingTxHistoryEntry;
				state.status = {
					value: "history:newEntry",
					updatedAt: performance.now(),
				};

				// report pending transaction change
				state.stats.global.transactions.pending.value++;
				state.stats.global.transactions.pending.updatedAtRel =
					performance.now();
			});

			let result:
				| undefined
				| Awaited<ReturnType<Aggregator<unknown, unknown>["execute"]>>;

			try {
				store.setState((state) => {
					state.status.value = "aggregator:execute:executing";
					state.status.updatedAt = performance.now();
				});

				result = await this.worker.run({
					call: "execute",
					args: [
						{
							// careful, this is not type safe
							runtimeId,
							originalRoutes,
							priorityFeeMicroLamports,
						},
					],
				});
			} catch (error) {
				const msg = "internalAggregator:execute:error";
				console.error(msg, error);
				logger.error({ error }, msg);
			}

			if (!result) {
				const msg = "internalAggregator:execute: No result returned";
				logger.error(msg);
				throw new Error(msg);
			}

			if ("error" in result.meta) {
				// TODO: create SpecificError classes

				// @ts-expect-error FIXME: fix type
				const historyEntry: TradeHistoryEntry = {
					uid: result.meta.runtimeId,
					updatedAt: Date.now(),
					status: "error",
					txId: result.txId,
					inTokenAddress: inToken,
					outTokenAddress: outToken,
					inTokenSymbol: inTokenInfo.symbol,
					outTokenSymbol: outTokenInfo.symbol,
					slippage: slippage,
				};

				if ("unknown" in result.meta.error) {
					const msg = "internalAggregator:execute: unknown error";
					logger.error(msg);
					historyEntry.error = "unknown";
				} else {
					if (result.meta.error.rpc429) {
						logger.error("internalAggregator:execute: rpc429");
						process.exit(1);
						// TODO: report error to state
					}
					if (result.meta.error.rpc503) {
						logger.error("internalAggregator:execute: rpc503");
						process.exit(1);
					}
					if (result.meta.error.rpc500) {
						logger.error("internalAggregator:execute: rpc500");
						process.exit(1);
					}
					if (result.meta.error.insufficientFunds) {
						historyEntry.error = "insufficientFunds";

						store.setState((state) => {
							state.tradeHistory[historyEntry.uid] = {
								...state.tradeHistory[historyEntry.uid],
								...historyEntry,
							};
							state.status = {
								value: "history:failedTx",
								updatedAt: performance.now(),
							};

							// report pending transaction change
							state.stats.global.transactions.pending.value--;
							state.stats.global.transactions.pending.updatedAtRel =
								performance.now();

							// report failed transaction change
							state.stats.global.transactions.failed.value++;
							state.stats.global.transactions.failed.updatedAtRel =
								performance.now();
						});

						const msg =
							"internalAggregator:execute: insufficient funds, exiting...";
						logger.error(msg);
						store.setState((state) => {
							state.status = {
								value: "!shutdown",
								updatedAt: performance.now(),
							};

							// report pending transaction change
							state.stats.global.transactions.pending.value--;
							state.stats.global.transactions.pending.updatedAtRel =
								performance.now();

							// report failed transaction change
							state.stats.global.transactions.failed.value++;
							state.stats.global.transactions.failed.updatedAtRel =
								performance.now();
						});

						// Exit process because there is no point in continuing without funds
						process.exit(1);
					}

					// Handle slippage tolerance exceeded
					if (result.meta.error.slippageToleranceExceeded) {
						historyEntry.error = "slippageToleranceExceeded";
					}

					// report tx status update
					store.setState((state) => {
						state.tradeHistory[historyEntry.uid] = {
							...state.tradeHistory[historyEntry.uid],
							...historyEntry,
						};
						state.status = {
							value: "history:failedTx",
							updatedAt: performance.now(),
						};

						// report pending transaction change
						state.stats.global.transactions.pending.value--;
						state.stats.global.transactions.pending.updatedAtRel =
							performance.now();

						// report failed transaction change
						state.stats.global.transactions.failed.value++;
						state.stats.global.transactions.failed.updatedAtRel =
							performance.now();
					});
				}
			} else if (
				result.status === "success" &&
				result.txId &&
				result.inAmount &&
				result.outAmount
			) {
				const inAmountMulti = thingToMulti.fromBlockchainValue(
					result.inAmount,
					inTokenInfo.decimals
				);
				const outAmountMulti = thingToMulti.fromBlockchainValue(
					result.outAmount,
					outTokenInfo.decimals
				);

				if (!inAmountMulti || !outAmountMulti) {
					const msg =
						"internalAggregator:execute:error inAmountMulti or outAmountMulti is undefined";
					logger.error(msg);
					throw new Error(msg);
				}

				const calculatedProfits = calculateProfit({
					inAmount: inAmountMulti,
					outAmount: outAmountMulti,
					inToken: inTokenInfo,
					outToken: outTokenInfo,
				});

				// @ts-expect-error FIXME: fix type
				const historyEntry: TradeHistoryEntry = {
					uid: result.meta.runtimeId,
					updatedAt: Date.now(),
					status: "success",
					txId: result.txId,
					inTokenAddress: inToken,
					outTokenAddress: outToken,
					inTokenSymbol: inTokenInfo.symbol,
					outTokenSymbol: outTokenInfo.symbol,
					inAmount: inAmountMulti.number,
					inUiAmount: inAmountMulti.uiValue.number,
					outAmount: outAmountMulti.number,
					outUiAmount: outAmountMulti.uiValue.number,
					slippage: slippage,
					profit: calculatedProfits.profit?.number,
					profitPercent: calculatedProfits.profitPercent,
					unrealizedProfit: calculatedProfits.unrealizedProfit?.uiValue.number,
					unrealizedProfitPercent: calculatedProfits.unrealizedProfitPercent,
				};

				store.setState((state) => {
					// set current strategy info
					state.strategies.current = {
						...state.strategies.current,
						profitPercent: calculatedProfits.profitPercent || 0,
					};

					// update trade history
					state.tradeHistory[historyEntry.uid] = {
						...state.tradeHistory[historyEntry.uid],
						...historyEntry,
					};

					state.status = {
						value: "history:successfulTx",
						updatedAt: performance.now(),
					};

					// TODO: consider moving this to on history:newEntry listener
					// report pending transaction change
					state.stats.global.transactions.pending.value--;
					state.stats.global.transactions.pending.updatedAtRel =
						performance.now();

					// report successful transaction change
					state.stats.global.transactions.successful.value++;
					state.stats.global.transactions.successful.updatedAtRel =
						performance.now();
				});

				return {
					...result,
					profitPercent: calculatedProfits.profitPercent,
				};
			}

			return result;
		},
	};

	return Aggregator;
};
