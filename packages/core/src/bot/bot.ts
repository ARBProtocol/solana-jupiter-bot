import { Jupiter, RouteInfo } from "../aggregators/jupiter";
import { BotStatus, Config, createStore, initialState, Store } from "../store";
import {
	defineProperty,
	JSBItoNumber,
	NumberToJSBI,
	JSBI,
	sleep,
	getErrorMessage,
} from "../utils";
import { backOff } from "./back-off";
import { computeRoutes } from "./compute-routes";
import { getAndSetInitialOutAmount } from "./get-and-set-Initial-out-amount";
import { getTokenInfo } from "./get-token-Info";
import { storeSwapResultInHistory } from "./store-swap-result-in-history";
import { onReady, onStatusChange } from "./listeners";
import { onShutdown } from "./listeners/on-shutdown";
import { createQueue } from "./queue";
import { start } from "./start";
import { swap } from "./swap";

// plugin fn type
export type Plugin<Bot> = (bot: Bot) => void;

export type ConfigRequired = Omit<Config, "strategy" | "tokens"> & {
	strategy: {
		tradeAmount: number | JSBI;
		rules?: Partial<Config["strategy"]["rules"]>;
	};
	tokens: {
		tokenA: Pick<Config["tokens"]["tokenA"], "address">;
		tokenB?: Pick<Config["tokens"]["tokenB"], "address">;
	};
};

export type GetStatus = () => BotStatus;
export type SetStatus = (status: BotStatus) => void;
export type SetJupiter = (jupiterInstance: Jupiter) => void;
export type wrappedComputeRoutes = () => Promise<
	| {
			routesInfos: RouteInfo[];
			cached: boolean;
	  }
	| undefined
>;

export const createBot = (config: ConfigRequired) => {
	let jupiter: Jupiter | null = null;

	const setJupiter: SetJupiter = (jupiterInstance) => {
		jupiter = jupiterInstance;
	};

	// const withConfig = <T extends unknown[], R>(fn: (config: ConfigRequired, ...args: T) => R) =>
	// (...args: T) =>
	// 	fn(config, ...args);

	// create store
	const store = createStore(initialState);

	const withStore =
		<T extends unknown[], R>(fn: (store: Store, ...args: T) => R) =>
		(...args: T) =>
			fn(store, ...args);

	const setStatus = withStore((store: Store, status: BotStatus) => {
		store.setState((state) => {
			state.bot.status = {
				value: status,
				updatedAt: performance.now(),
			};
		});
	});

	// const withSetStatus =
	// 	<T extends unknown[], R>(fn: (setStatus: SetStatus, ...args: T) => R) =>
	// 	(...args: T) =>
	// 		fn(setStatus, ...args);

	// start method with store, setStatus curried from start
	// const start = withSetStatus(
	// 	(setStatus: SetStatus) => {
	// 		return withStore((store: Store) => {
	// 			return withConfig((config: ConfigRequired) => start(store, setStatus, config));
	// 		});
	// 	}
	// );

	const utils = {
		JSBItoNumber,
		NumberToJSBI,
		JSBI,
		sleep,
		getErrorMessage,
	};

	const getStatus = withStore((store) => {
		return store.getState().bot.status.value;
	});

	const queue = createQueue(store);

	const wrappedComputeRoutes: wrappedComputeRoutes = () => {
		return computeRoutes(store, getStatus, setStatus, jupiter, queue);
	};

	const onStatus = (
		observedStatus: BotStatus | "*",
		callback: (status: BotStatus, prevStatus: BotStatus) => void
	) => {
		const isWildCard = observedStatus === "*";
		store.subscribe(
			(state) => state.bot.status.value,
			(status, prevStatus) => {
				if (
					isWildCard ||
					(status === observedStatus && prevStatus !== observedStatus)
				) {
					callback(status, prevStatus);
				}
			}
		);
	};

	const bot = {
		start: () => start(store, setStatus, setJupiter, config),
		store,
		swap: (route?: RouteInfo) => swap(store, setStatus, jupiter, route),
		queue,
		getStatus,
		setStatus,
		tokens: {
			getTokenInfo: withStore(getTokenInfo),
		},
		withStore,
		utils,
		computeRoutes: wrappedComputeRoutes,
		getAndSetInitialOutAmountX: () =>
			getAndSetInitialOutAmount(store, () =>
				computeRoutes(store, getStatus, setStatus, jupiter, queue)
			),
		onStatus,
		backOff: () => backOff(store, setStatus),
		history: { storeSwapResultInHistory },
	};

	const loadPlugin = (plugin: Plugin<typeof bot>) => {
		bot.setStatus("loadingPlugin");
		defineProperty(bot, "plugin", { writable: false, value: plugin });
		bot.setStatus("pluginLoaded");
		return bot;
	};

	// listeners
	onReady(bot);
	onShutdown(bot);
	onStatusChange(bot);

	// run strategy
	// arbitrage(bot);

	return {
		...bot,
		loadPlugin,
	} as const;
};

export type Bot = Readonly<ReturnType<typeof createBot>>;
