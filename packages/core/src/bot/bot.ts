import { createJupiter, Jupiter, RouteInfo } from "../jupiter";
import { BotStatus, Config, createStore, initialState, Store } from "../store";
import { setToken } from "../tokens";
import { defineProperty, JSBItoNumber, NumberToJSBI, JSBI } from "../utils";
import { createKeypair, createSolanaConnection, PublicKey } from "../web3";

// plugin fn type
export type Plugin<Bot> = (bot: Bot) => void;

type ConfigRequired = Omit<Config, "strategy" | "tokens"> & {
	strategy: {
		tradeAmount: number | JSBI;
	};
	tokens: {
		tokenA: Pick<Config["tokens"]["tokenA"], "address">;
		tokenB?: Pick<Config["tokens"]["tokenB"], "address">;
	};
};

export const createBot = (config: ConfigRequired) => {
	// create store
	const store = createStore(initialState);

	let jupiter: Jupiter | null = null;

	const sleep = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));

	// prepare utils
	const utils = {
		JSBItoNumber,
		NumberToJSBI,
		JSBI,
		sleep,
	};

	const swap = async (route: RouteInfo) => {
		console.log("🚀 ~ file: bot.ts ~ line 30 ~ swap ~ route", route);
		try {
			console.log("swap!");

			// set bot status to "swapping"
			setStatus("swapping");

			if (!jupiter) {
				throw new Error("swap: Jupiter instance does not exist");
			}

			const { execute } = await jupiter.exchange({
				routeInfo: route,
			});

			const swapResult = await execute();
			setStatus("swapSuccess");
			setStatus("idle");

			return swapResult;
		} catch (error) {
			setStatus("swapFail");
			return error;
		}
	};

	const withStore = <T extends unknown[], R>(
		fn: (store: Store, ...args: T) => R
	) => {
		return (...args: T) => {
			return fn(store, ...args);
		};
	};

	const setStatus = withStore((store, status: BotStatus) => {
		store.setState((state) => {
			state.bot.status = status;
		});
	});

	const getStatus = withStore((store) => {
		return store.getState().bot.status;
	});

	const getQueueCount = withStore((store) => {
		return store.getState().bot.queue.count;
	});

	const increaseQueueCount = withStore((store) => {
		store.setState((state) => {
			state.bot.queue.count += 1;
		});
	});

	const decreaseQueueCount = withStore((store) => {
		store.setState((state) => {
			state.bot.queue.count -= 1;
		});
	});

	const queue = {
		getCount: getQueueCount,
		increase: increaseQueueCount,
		decrease: decreaseQueueCount,
	};

	const loadConfig = () => {
		// set bot status to "loadingConfig"
		setStatus("loadingConfig");

		// set tokens
		bot.setStatus("loadingTokens");
		setToken(bot.store, "tokenA", config.tokens.tokenA.address);

		// set tokenB if it exists or set to token A
		if (config.tokens.tokenB) {
			setToken(bot.store, "tokenB", config.tokens.tokenB.address);
		} else {
			setToken(bot.store, "tokenB", config.tokens.tokenA.address);
		}
		bot.setStatus("tokensLoaded");
		bot.setStatus("idle");

		// set RPC
		bot.store.setState((state) => {
			state.config.rpcURL = config.rpcURL;
			if (config.rpcWSS) {
				state.config.rpcWSS = config.rpcWSS;
			}
		});

		// set wallet
		bot.store.setState((state) => {
			state.config.privateKey = config.privateKey;
			state.wallet.privateKey = config.privateKey;
			// todo: set wallet funds
		});

		// set strategy

		const tradeAmount =
			typeof config.strategy.tradeAmount === "number"
				? NumberToJSBI(config.strategy.tradeAmount)
				: config.strategy.tradeAmount;

		bot.store.setState((state) => {
			state.config.strategy = {
				...state.config.strategy,
				tradeAmount,
			};
		});
	};

	const start = async () => {
		try {
			// set bot status to "initializing"
			setStatus("initializing");

			// performance test
			performanceTest();

			// check if config is valid and load it
			loadConfig();

			// create connection
			const connection = createSolanaConnection({
				rpcURL: bot.store.getState().config.rpcURL,
			});
			// set keypair
			const keypair = createKeypair(bot.store.getState().config.privateKey);

			// create jupiter instance
			bot.setStatus("loadingJupiter");
			jupiter = await createJupiter(connection, keypair);
			bot.setStatus("jupiterLoaded");

			bot.store.setState((state) => {
				state.bot.isStarted = true;
			});
			setStatus("ready");
			setStatus("idle");
		} catch (error) {
			console.error(error);
		}
	};

	const bot = {
		start,
		store,
		withStore,
		swap,
		getStatus,
		setStatus,
		queue,
		utils,
	};

	const performanceTest = () => {
		console.count("performanceTest");
		bot.setStatus("testingPerformance");
		const start = performance.now();
		for (let i = 0; i < 10000; i++) {
			store.setState((state) => {
				state.counter.count++;
			});
		}
		const end = performance.now();
		console.log(`Perf Test: ~${(end - start).toFixed()}ms`);
		bot.setStatus("idle");
	};

	const loadPlugin = (plugin: Plugin<typeof bot>) => {
		bot.setStatus("loadingPlugin");
		defineProperty(bot, "plugin", { writable: false, value: plugin });
		bot.setStatus("pluginLoaded");
		return bot;
	};

	const computeRoutes = async () => {
		try {
			// increase queue count
			bot.queue.increase();

			bot.setStatus("computingRoutes");
			if (!jupiter) {
				throw new Error("computeRoutes: Jupiter instance does not exist");
			}

			// increase iteration count
			bot.store.setState((state) => {
				state.bot.iterationCount++;
			});

			const inputMint = store.getState().config.tokens.tokenA
				.publicKey as PublicKey;

			if (!inputMint) throw new Error("computeRoutes: inputMint is null");

			const outputMint = store.getState().config.tokens.tokenB
				.publicKey as PublicKey;

			const amount = store.getState().config.strategy.tradeAmount;

			const routes = await jupiter.computeRoutes({
				inputMint,
				outputMint,
				amount,
				forceFetch: true,
				slippageBps: 0,
			});

			bot.setStatus("routesComputed");

			bot.setStatus("idle");

			return routes;
		} catch (error) {
			console.error(error);
			throw error;
		} finally {
			// decrease queue count
			bot.queue.decrease();
		}
	};

	return {
		...bot,
		loadPlugin,
		computeRoutes,
	};
};

export type Bot = ReturnType<typeof createBot>;
