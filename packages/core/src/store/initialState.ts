import { JSBI } from "../utils/jsbi";
import { Address } from "../jupiter";
import { PublicKey } from "../web3";

export type BotStatus =
	| "idle"
	| "initializing"
	| "loadingJupiter"
	| "jupiterLoaded"
	| "ready"
	| "error"
	| "swapping"
	| "swapSuccess"
	| "swapFail"
	| "loadingPlugin"
	| "pluginLoaded"
	| "pluginError"
	| "testingPerformance"
	| "loadingConfig"
	| "configLoaded"
	| "configError"
	| "loadingTokens"
	| "tokensLoaded"
	| "tokensError"
	| "computingRoutes"
	| "routesComputed"
	| "routesError";

interface Counter {
	count: number;
}

interface Token {
	symbol: Address | null;
	address: Address | null;
	publicKey: PublicKey | null;
}

interface Wallet {
	privateKey: PrivateKey | null;
	funds: {
		tokenA: number;
		tokenB: number;
	};
}

interface Queue {
	count: number;
	maxAllowed: number;
}

export interface GlobalState {
	bot: {
		isStarted: boolean;
		status: BotStatus;
		iterationCount: number;
		queue: Queue;
		side: "buy" | "sell";
		initialOutAmount: {
			tokenA: JSBI;
			tokenB: JSBI;
		};
	};
	config: Config;
	wallet: Wallet;
	counter: Counter;
}

export interface Strategy {
	tradeAmount: JSBI;
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
	strategy: Strategy;
}

export const initialState: GlobalState = {
	bot: {
		isStarted: false,
		status: "idle",
		iterationCount: 0,
		queue: {
			count: 0,
			maxAllowed: 1,
		},
		side: "buy",
		initialOutAmount: {
			tokenA: JSBI.BigInt(0),
			tokenB: JSBI.BigInt(0),
		},
	},
	config: {
		privateKey: null,
		rpcURL: null,
		tokens: {
			tokenA: {
				symbol: null,
				address: null,
				publicKey: null,
			},
			tokenB: {
				symbol: null,
				address: null,
				publicKey: null,
			},
		},
		strategy: {
			tradeAmount: JSBI.BigInt(0),
		},
	},
	wallet: {
		privateKey: null,
		funds: {
			tokenA: 0,
			tokenB: 0,
		},
	},
	counter: {
		count: 0,
	},
};
