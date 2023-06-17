import { createArray } from "src/utils";
import { GlobalState } from "src/types/global-state";

export const initialState: GlobalState = {
	isStarted: {
		value: false,
		updatedAtEpoch: Date.now(),
		updatedAt: performance.now(),
	},
	status: {
		value: "bot:idle",
		updatedAt: performance.now(),
	},
	wallets: [],
	// TODO: consider using Map
	tradeHistory: {},
	strategies: {
		current: {
			shouldExecute: false,
			name: "",
			runtimeId: "",
			expectedProfitPercent: {
				value: 0,
				updatedAtRel: 0,
				positiveValueAtRel: 0,
			},
			txCount: {
				failed: 0,
				success: 0,
				pending: 0,
				total: 0,
			},
			profit: 0,
			profitPercent: 0,
			unrealizedProfit: 0,
			unrealizedProfitPercent: 0,
			autoSlippage: 0,
			autoSlippageEnabled: false,
		},
		stats: {
			scheduled: 0,
			running: 0,
			completed: 0,
			failed: 0,
		},
	},
	chart: {
		expectedProfitPercent: {
			values: createArray(115, 0),
			updatedAtRel: 0,
		},
		price: {
			values: createArray(115, 0),
			updatedAtRel: 0,
		},
		computedRoutesPerSecond: {
			values: createArray(60, 0),
			updatedAtRel: 0,
		},
		computeRoutesLatency: {
			values: createArray(60, 0),
			updatedAtRel: 0,
		},
	},
	stats: {
		global: {
			transactions: {
				pending: {
					value: 0,
					updatedAtRel: 0,
				},
				failed: {
					value: 0,
					updatedAtRel: 0,
				},
				successful: {
					value: 0,
					updatedAtRel: 0,
				},
			},
			iterations: {
				value: 0,
				updatedAtRel: performance.now(),
			},
		},
		aggregators: {},
	},
	limiters: {
		transactions: {
			pending: {
				enabled: true,
				max: 1,
				active: false,
				activatedAtRel: 0,
			},
			executionRate: {
				current: 0,
				enabled: true,
				max: 1,
				timeWindowMs: 5000,
				active: false,
				activatedAtRel: 0,
			},
		},
		iterationsRate: {
			current: 0,
			enabled: true,
			max: 1,
			timeWindowMs: 5000,
			active: false,
			activatedAtRel: 0,
		},
		aggregators: {
			errorsRate: {
				enabled: true,
				current: 0,
				active: false,
				max: 2,
				activatedAtRel: 0,
				cooldownMs: 10000,
				cooldownUntilRel: 0,
				timeWindowMs: 10000,
			},
		},
	},
};
