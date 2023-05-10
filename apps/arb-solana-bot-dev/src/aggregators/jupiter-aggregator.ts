import {
	Aggregator,
	FailedTransaction,
	JSBI,
	NumberToJSBI,
	PublicKey,
	createCache,
	createKeypair,
	createLogger,
	createSolanaConnection,
	parseError,
} from "@arb-protocol/core";
import { isMainThread, workerData } from "worker_threads";
import axios from "axios";

import { Jupiter, SwapResult, TOKEN_LIST_URL, RouteInfo } from "@jup-ag/core";

const logger = createLogger("./bot.log");

const RoutesCache = createCache<RouteInfo[]>();

/**
 * Jupiter Aggregator Worker
 * @description
 * This worker is used to run the aggregator in a separate thread.
 * @version 0.0.1
 */
const JupiterAggregator: Aggregator<Jupiter> = {
	id: "jupiter",
	tokens: [],
	async getTokens() {
		const response = await axios.get(TOKEN_LIST_URL["mainnet-beta"]);
		const tokens = response.data;

		if (!tokens) {
			throw new Error("getTokens: No tokens returned URL: " + TOKEN_LIST_URL["mainnet-beta"]);
		}

		this.tokens = tokens;
		return tokens;
	},
	async init(config) {
		try {
			if (!config.wallets || !config.wallets[0]) {
				throw new Error("createJupiterClient: no wallets provided");
			}

			const keypair = createKeypair(config.wallets[0]);

			if (!config.rpcURLs[0]) {
				throw new Error("createJupiterClient: no rpcURL provided");
			}

			const connection = createSolanaConnection({
				rpcURL: config.rpcURLs[0],
				rpcWSS: config.rpcWSSs?.[0],
			});

			const aggregator = await Jupiter.load({
				connection,
				cluster: "mainnet-beta",
				wrapUnwrapSOL: true,
				routeCacheDuration: 0,
				user: keypair,
				shouldLoadSerumOpenOrders: true, // default: true
				restrictIntermediateTokens: true,
			});

			if (!aggregator) {
				return {
					success: false,
					error: {
						unknown: true,
						message: `aggregator ${this.id} failed to initialize without throwing`,
					},
				};
			}

			//TODO: handle errors
			this.instance = aggregator;

			return { success: true, aggregatorId: this.id };
		} catch (error) {
			if (
				typeof error === "object" &&
				error &&
				"message" in error &&
				typeof error.message === "string"
			) {
				const msg = error.message;

				if (msg.match(/Missing [\w\d]+/)) {
					return {
						success: false,
						error: { missingData: true, message: msg },
					};
				}

				if (msg.includes("503")) {
					return {
						success: false,
						error: { rpc503: true },
					};
				}

				if (msg.includes("429")) {
					return {
						success: false,
						error: { rpc429: true },
					};
				}

				if (msg.includes("400")) {
					return {
						success: false,
						error: { rpc400: true },
					};
				}

				return {
					success: false,
					error: { unknown: true, message: msg },
				};
			}

			return {
				success: false,
				error: { unknown: true },
			};
		}
	},
	async computeRoutes({ runtimeId, inToken, outToken, amount, slippage }) {
		try {
			const performanceStart = performance.now();

			if (isMainThread) {
				throw new Error("should only run in child thread");
			}
			if (!this.instance) {
				const msg = "JupiterAggregator:computeRoutes: aggregator not initialized";
				logger.error(msg);
				throw new Error(msg);
			}

			if (!inToken || !outToken || !amount || !slippage) {
				throw new Error("computeRoutes: missing params");
			}

			if (!runtimeId) {
				throw new Error("computeRoutes: missing runtimeId");
			}

			const result = await this.instance.computeRoutes({
				// forceFetch: true,
				inputMint: new PublicKey(inToken),
				outputMint: new PublicKey(outToken),
				amount: JSBI.BigInt(Number(amount)),
				slippageBps: slippage || 50,
			});

			if (!result.routesInfos) {
				throw new Error("no routesInfos");
			}

			if (result.routesInfos.length === 0 || !result.routesInfos[0]) {
				logger.error(
					{
						runtimeId,
						inToken,
						outToken,
						amount,
						slippage,
						computeRoutesDuration: performance.now() - performanceStart,
						result,
					},
					"JupiterAggregator:computeRoutes:error no routesInfos[0]"
				);
				throw new Error("no routesInfos[0]");
			}

			const bestRoute = result.routesInfos[0];

			// use native bigint
			const iA = JSBI.toNumber(bestRoute.inAmount);
			const oA = JSBI.toNumber(bestRoute.outAmount);

			logger.debug(
				{
					runtimeId,
					inToken,
					outToken,
					bestRouteInAmount: iA,
					bestRouteOutAmount: oA,
				},
				"JupiterAggregator:computeRoutes best route info"
			);

			const amountIn = BigInt(iA);
			const amountOut = BigInt(oA);

			RoutesCache.set(runtimeId, result.routesInfos);

			// store the result in a routes.json file
			// fs.writeFileSync("./routes.json", test);

			return {
				success: true,
				meta: {
					runtimeId,
					lookupPerformance: performance.now() - performanceStart,
				},
				routes: [
					{
						inToken,
						outToken,
						amountIn,
						amountOut,
						slippage: bestRoute.slippageBps,
					},
				],
			};
		} catch (error) {
			const parsedError = parseError(error);

			if (parsedError) {
				if (parsedError.message.includes("503")) {
					return {
						success: false,
						error: { rpc503: true },
					};
				}

				if (parsedError.message.includes("429")) {
					return {
						success: false,
						error: { rpc429: true },
					};
				}

				if (parsedError.message.includes("400")) {
					return {
						success: false,
						error: { rpc400: true },
					};
				}

				if (parsedError.message.match(/Account info ([a-zA-Z0-9]+) missing/)) {
					return {
						success: false,
						error: { missingData: true },
					};
				}

				return {
					success: false,
					error: { unknown: true, message: parsedError.message },
				};
			}

			return {
				success: false,
				error: { unknown: true },
			};
		}
	},
	async execute({ runtimeId, priorityFeeMicroLamports, customSlippageThreshold }) {
		try {
			const start = performance.now();
			logger.debug(
				{
					runtimeId,
					priorityFeeMicroLamports,
				},
				"JupiterAggregator:execute: start"
			);
			if (isMainThread) {
				throw new Error("should only run in child thread");
			}
			if (!this.instance) {
				const msg = "JupiterAggregator:execute: aggregator not initialized";
				logger.error(
					{
						runtimeId,
					},
					msg
				);
				throw new Error(msg);
			}
			if (!runtimeId) {
				throw new Error("execute: missing routesKey");
			}

			const routesInfos = RoutesCache.get(runtimeId);

			if (!routesInfos || !routesInfos[0]) {
				throw new Error(
					`execute: missing routesInfos for ${runtimeId}, Cache: ${JSON.stringify(
						RoutesCache.getAll()
					)}`
				);
			}

			let bestRoute = routesInfos[0];

			// If user has set a custom slippage threshold, use it
			if (customSlippageThreshold) {
				const besRouteWithCustomSlippageThreshold = bestRoute;
				besRouteWithCustomSlippageThreshold.otherAmountThreshold = NumberToJSBI(
					Number(customSlippageThreshold)
				);
				bestRoute = besRouteWithCustomSlippageThreshold;
			}

			logger.debug(
				{
					runtimeId,
					inAmount: bestRoute.inAmount,
					outAmount: bestRoute.outAmount,
				},
				"JupiterAggregator:execute: before aggregator.execute"
			);

			let result: SwapResult | undefined;
			try {
				const { execute } = await this.instance.exchange({
					routeInfo: bestRoute,
					computeUnitPriceMicroLamports: priorityFeeMicroLamports,
					wrapUnwrapSOL: process.env.WRAP_UNWRAP_SOL === "true" || undefined,
				});

				result = await execute();
			} catch (error) {
				const parsedError = parseError(error);
				logger.error(
					{
						runtimeId,
						message: parsedError?.message,
						stack: parsedError?.stack,
					},
					"JupiterAggregator:execute: error"
				);
			}

			if (result && "error" in result) {
				const msg = result.error?.message;

				if (msg) {
					const failedTx: FailedTransaction = {
						meta: {
							runtimeId,
							executePerformance: performance.now() - start,
							error: {},
						},
						txId: result.error?.txid,
						status: "failed",
					};

					if (msg === "insufficient funds") {
						failedTx.meta.error = {
							insufficientFunds: true,
						};
					}

					if (msg === "Slippage tolerance exceeded") {
						failedTx.meta.error = {
							slippageToleranceExceeded: true,
						};
					}

					if (msg.includes("503")) {
						failedTx.meta.error = {
							rpc503: true,
						};
					}

					if (msg.includes("500")) {
						failedTx.meta.error = {
							rpc500: true,
						};
					}

					if (msg.includes("429")) {
						failedTx.meta.error = {
							rpc429: true,
						};
					}
					return failedTx;
				}
			}

			if (result && "txid" in result) {
				return {
					meta: {
						runtimeId,
						executePerformance: performance.now() - start,
					},
					txId: result.txid,
					inTokenAddress: result.inputAddress.toString(),
					outTokenAddress: result.outputAddress.toString(),
					inAmount: BigInt(result.inputAmount),
					outAmount: BigInt(result.outputAmount),
					status: "success",
				};
			}

			return {
				meta: {
					runtimeId,
					executePerformance: performance.now() - start,
					error: {
						unknown: true,
					},
				},
				status: "failed",
			};
		} catch (error) {
			console.error("AGGREGATOR execute:error", error);
			throw error;
		}
	},
};

export default ({ call, args }: { call: string; args: any[] }) => {
	if (isMainThread) {
		throw new Error(
			"Jupiter Aggregator worker called from main thread. Should only be called from worker thread"
		);
	}

	if (
		call &&
		call in JupiterAggregator &&
		typeof JupiterAggregator[call as keyof typeof JupiterAggregator] === "function"
	) {
		// @ts-expect-error FIXME: fix type ridiculousness
		const result = JupiterAggregator[call as keyof typeof JupiterAggregator](...args);
		return result;
	}
};
