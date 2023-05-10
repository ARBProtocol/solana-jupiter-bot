import { Wallet } from "src/actions/load-wallets";
import { TokenInfo } from "./token";
import { Multi } from "src/utils";
import { TradeHistoryEntry } from "./trade-history";
import { BotStatus } from "./bot-status";

interface ChartIndicators {
	values: number[];
	label: string;
	color: string | undefined;
}

export type GlobalState = {
	isStarted: {
		value: boolean;
		updatedAtEpoch: number;
		updatedAt: number;
	};
	status: {
		value: BotStatus;
		updatedAt: number;
	};
	wallets: Wallet[];
	strategies: {
		// TODO: this needs to be more generic to support multiple strategies
		current: {
			runtimeId: string;
			name: string;
			inToken?: TokenInfo;
			outToken?: TokenInfo;
			inAmount?: Multi;
			outAmount?: Multi;
			slippage?: number;
			autoSlippageEnabled: boolean;
			autoSlippage: number;
			originalRoutes?: unknown;
			profit: number;
			profitPercent: number;
			unrealizedProfit: number;
			unrealizedProfitPercent: number;
			price?: number;
			priceInverted?: number;
			txCount: {
				failed: number;
				success: number;
				pending: number;
				total: number;
			};
			expectedProfitPercent: number;
			priorityFeeMicroLamports?: number;
			desiredProfitPercentPerTx?: number;
			shouldExecute: boolean;
		};
		// TODO: move this to root.stats.strategies.transactions and add global stats in root.stats.global.transactions
		stats: {
			scheduled: number;
			running: number; // TODO: change naming to `live`
			completed: number;
			failed: number;
		};
	};
	tradeHistory: Record<string, TradeHistoryEntry>;
	chart: {
		expectedProfitPercent: {
			values: number[];
			/** Relative time*/
			updatedAtRel: number;
			indicators?: ChartIndicators[];
		};
		price: {
			values: number[];
			/** Relative time*/
			updatedAtRel: number;
		};
		computedRoutesPerSecond: {
			values: number[];
			/** Relative time*/
			updatedAtRel: number;
		};
		computeRoutesLatency: {
			values: number[];
			/** Relative time*/
			updatedAtRel: number;
		};
	};
	stats: {
		global: {
			/**
			 * Global transaction stats.
			 */
			transactions: {
				/**
				 * Total number of transactions that are currently being processed.
				 * This is useful to manage the number of transactions that are being processed *at the same time*.
				 */
				pending: {
					value: number;
					/** Relative time*/
					updatedAtRel: number;
				};
				failed: {
					value: number;
					/** Relative time*/
					updatedAtRel: number;
				};
				successful: {
					value: number;
					/** Relative time*/
					updatedAtRel: number;
				};
			};
			/**
			 * Total number of iterations.
			 */
			iterations: {
				value: number;
				updatedAtRel: number;
			};
		};
		aggregators: {
			[aggregatorId: string]: {
				calls: {
					init: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
					computeRoutes: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
				};
				errors: {
					missingData: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
					rpc429: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
					rpcOther: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
					unknown: {
						value: number;
						/** Relative time*/
						updatedAtRel: number;
					};
				};
			};
		};
	};
	limiters: {
		transactions: {
			/** This limiter is used to prevent too many (concurrent) transactions from being processed at the same time. */
			pending: {
				/**
				 * Maximum number of transactions that can be processed at the same time
				 * @default 1
				 */
				max: number;
				/** Relative time*/
				activatedAtRel: number;
				active: boolean;
				/**
				 * When `true`, the limiter is enabled and will prevent transactions from being processed if the limit is reached.
				 * @default true
				 * */
				enabled: boolean;
			};
			/**
			 * This limiter is used to prevent too many transactions from being processed in a given time window.
			 */
			executionRate: {
				/** Number of transactions in the current time window */
				current: number;
				/** Maximum number of transactions that can be processed in a given time window
				 * @default 1
				 */
				max: number;
				/**
				 * Time window in which the maximum number of transactions can be processed.
				 * @default 20 * 1000 // === 20 seconds
				 */
				timeWindowMs: number;
				/** Relative time*/
				activatedAtRel: number;
				active: boolean;
				/**
				 * When `true`, the limiter is enabled and will prevent transactions from being processed if the limit is reached.
				 * @default true
				 */
				enabled: boolean;
			};
		};
		/**
		 * This limiter is used to limit the number of iterations in a given time window.
		 * This is useful to prevent the bot from being rate limited by the RPC provider.
		 */
		iterationsRate: {
			/** Number of iterations in the current time window */
			current: number;
			/** Maximum number of iterations that can be processed in a given time window
			 * @default 1
			 * */
			max: number;
			/**
			 * Time window in which the maximum number of iterations can be processed.
			 * @default 5 * 1000 // === 5 seconds
			 * */
			timeWindowMs: number;
			/** Relative time*/
			activatedAtRel: number;
			active: boolean;
			/**
			 * When `true`, the limiter is enabled and will prevent iterations from being processed if the limit is reached.
			 * @default true
			 */
			enabled: boolean;
		};
	};
};
