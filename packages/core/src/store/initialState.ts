import { JSBI } from "../utils/jsbi";
import { AmmsToExclude, JupiterToken, RouteInfo } from "../jupiter";
import { PublicKey } from "../web3";
import { createArray } from "../utils";
import { BotStatus } from "./BotStatus";
import Decimal from "decimal.js";

interface Token extends JupiterToken {
	publicKey?: PublicKey;
}

interface Wallet {
	privateKey: PrivateKey | null;
	address: string | null;
	funds: {
		tokenA: number;
		tokenB: number;
	};
	stats: {
		profit: {
			tokenA: number;
			tokenB: number;
		};
		profitPercent: {
			tokenA: number;
			tokenB: number;
		};
	};
}

interface Queue {
	count: number;
	maxAllowed: number;
}

interface ChartIndicators {
	values: number[];
	label: string;
	color: string | undefined;
}

interface Chart {
	values: number[];
	indicators?: ChartIndicators[];
}

interface BackOff {
	count: number;
	enabled?: boolean;
	shutdownOnCount?: number;
	ms: number;
}

interface Price {
	current: {
		decimal: Decimal;
		jsbi: JSBI;
	};
}

interface Swaps {
	total: number;
	success: number;
	fail: number;
	successRate: number;
	swapTime: number;
	rateLimiter: RateLimiter;
}

interface RateLimiter {
	isEnabled: boolean;
	isActive: boolean;
	timestamp: number;
	value: number;
	max: number;
	perMs: number;
}

export interface GlobalState {
	bot: {
		isStarted: boolean;
		startedAt: number | null;
		status: BotStatus;
		iterationCount: number;
		backOff: BackOff;
		queue: Queue;
		side: "buy" | "sell";
		initialOutAmount: {
			tokenA: JSBI;
			tokenB: JSBI;
		};
		tokens?: {
			[tokenAddress: string]: Token;
		};
		price: Price;
		lastIterationTimestamp: number;
		rateLimit: number;
		rateLimitPer: number;
	};
	swaps: Swaps;
	routes: Routes;
	config: Config;
	wallet: Wallet;
	tradeHistory: TradeHistory;
	chart: {
		potentialProfit: Chart;
		price: Chart;
		lookupTime: Chart;
	};
}

export interface Rules {
	execute: {
		above?: {
			potentialProfit?: number;
			price?: number;
		};
		below?: {
			price: number;
		};
	};
	slippage: {
		bps: number;
	};
}

export interface StrategyConfig {
	tradeAmount: {
		jsbi: JSBI;
		number: number;
	};
	rules?: Rules;
}

type PrivateKey = string;

export interface Config {
	privateKey: PrivateKey | null;
	rpcURL: string | null;
	rpcWSS?: string;
	tokens: {
		tokenA: Token;
		tokenB: Token;
	};
	strategy: StrategyConfig;
	ammsToExclude?: AmmsToExclude;
	backOff?: Omit<BackOff, "count" | "enabled" | "ms"> & {
		enabled?: BackOff["enabled"];
		ms?: BackOff["ms"];
	};
}

interface Route {
	raw: RouteInfo | null;
	input: {
		amount: {
			jsbi: JSBI;
			decimal: Decimal;
		};
	};
	output: {
		amount: {
			jsbi: JSBI;
			decimal: Decimal;
		};
	};
	price: {
		jsbi: JSBI;
		decimal: Decimal;
	};
}

export interface Routes {
	prevRoute: Route;
	currentRoute: Route;
	excludedAmms: {
		ammId: string;
		excludedAt: number;
	}[];
}

export interface TradeHistoryEntry {
	timestamp: number;
	txId: string;
	status: "success" | "error" | "fetchingResult" | "pending" | "unknown";
	error?: string;
	inAmount: number;
	inToken: string;
	inTokenAddress: string;
	expectedProfit: number;
	profit: number;
	expectedProfitPercent: number;
	profitPercent: number;
	expectedPrice: number;
	price: number;
	expectedOutAmount: number;
	outAmount: number;
	outToken: string;
	outTokenAddress: string;
	totalProfit: number;
	totalProfitPercent: number;
	market: string;
}

interface TradeHistory {
	[txId: string]: TradeHistoryEntry;
}

export const initialState: GlobalState = {
	bot: {
		isStarted: false,
		startedAt: null,
		status: "idle",
		iterationCount: 0,
		backOff: {
			count: 0,
			enabled: true,
			ms: 2000,
		},
		queue: {
			count: 0,
			maxAllowed: 1,
		},
		side: "buy",
		initialOutAmount: {
			tokenA: JSBI.BigInt(0),
			tokenB: JSBI.BigInt(0),
		},
		price: {
			current: {
				decimal: new Decimal(0),
				jsbi: JSBI.BigInt(0),
			},
		},
		rateLimit: 1,
		rateLimitPer: 1000,
		lastIterationTimestamp: 0,
	},
	swaps: {
		total: 0,
		success: 0,
		fail: 0,
		successRate: 0,
		swapTime: 0,
		rateLimiter: {
			isEnabled: true,
			isActive: false,
			timestamp: performance.now(),
			value: 0,
			max: 1,
			perMs: 20000,
		},
	},
	routes: {
		prevRoute: {
			raw: null,
			input: {
				amount: {
					jsbi: JSBI.BigInt(0),
					decimal: new Decimal(0),
				},
			},
			output: {
				amount: {
					jsbi: JSBI.BigInt(0),
					decimal: new Decimal(0),
				},
			},
			price: {
				jsbi: JSBI.BigInt(0),
				decimal: new Decimal(0),
			},
		},
		currentRoute: {
			raw: null,
			input: {
				amount: {
					jsbi: JSBI.BigInt(0),
					decimal: new Decimal(0),
				},
			},
			output: {
				amount: {
					jsbi: JSBI.BigInt(0),
					decimal: new Decimal(0),
				},
			},
			price: {
				jsbi: JSBI.BigInt(0),
				decimal: new Decimal(0),
			},
		},
		excludedAmms: [],
	},
	config: {
		privateKey: null,
		rpcURL: null,
		tokens: {
			tokenA: {
				address: "",
			},
			tokenB: {
				address: "",
			},
		},
		strategy: {
			tradeAmount: {
				jsbi: JSBI.BigInt(0),
				number: 0,
			},
			rules: {
				execute: {},
				slippage: {
					bps: 0,
				},
			},
		},
	},
	wallet: {
		privateKey: null,
		address: null,
		funds: {
			tokenA: 0,
			tokenB: 0,
		},
		stats: {
			profit: {
				tokenA: 0,
				tokenB: 0,
			},
			profitPercent: {
				tokenA: 0,
				tokenB: 0,
			},
		},
	},
	chart: {
		potentialProfit: {
			values: createArray(120, 0),
		},
		price: {
			values: createArray(120, 0),
		},
		lookupTime: {
			values: createArray(120, 0),
		},
	},
	tradeHistory: {},
};
