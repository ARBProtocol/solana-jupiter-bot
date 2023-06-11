import { setupExitHandlers } from "./listeners/on-exit";
import { setupUnhandledErrorHandlers } from "./listeners/on-unhandled-error";

setupExitHandlers();
setupUnhandledErrorHandlers();

export type { GlobalStore } from "./store";
export type { TradeHistoryEntry } from "./types/trade-history";
export type { PublicBot as Bot } from "./bot/create-public-bot";
export type { GlobalState } from "./types/global-state";
export type { TokenInfo as Token } from "./types/token";
export type {
	Aggregator,
	FailedTransaction,
	SuccessfulTransaction,
	AbsolutePath,
} from "./types/aggregator";
export type { Config } from "./types/config";

export { createArray, parseError, NumberToJSBI, JSBItoNumber } from "./utils";
export { createCache } from "./actions/public/create-cache";

export { createStore } from "./store";
export { createLogger } from "./actions/public/create-logger";
export { logger } from "./logger";
export { createPublicBot as createBot } from "./bot";

export * from "./utils/extend-bot";

import * as plugins from "./plugins";

export { plugins };
export * from "./strategies";
export * from "./services/web3";

export * from "./utils";

export { SolscanDataProvider } from "./blockchain-data-providers/solscan-data-provider";
