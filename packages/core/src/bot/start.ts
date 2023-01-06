import { createJupiter, getJupiterTokens, JupiterToken } from "../jupiter";
import { Store } from "../store";
import { createKeypair, createSolanaConnection } from "../web3";
import { SetStatus, SetJupiter, ConfigRequired } from "./bot";
import { performanceTest } from "./performanceTest";
import { loadConfig } from "./loadConfig";

export const start = async (
	store: Store,
	setStatus: SetStatus,
	setJupiter: SetJupiter,
	config: ConfigRequired
) => {
	try {
		// set bot status to "initializing"
		setStatus("initializing");

		// performance test
		performanceTest(store, setStatus);

		// get all Jupiter tokens
		setStatus("loadingTokens");
		const tokens = await getJupiterTokens();

		if (!tokens) {
			throw new Error("start: tokens are null");
		}
		// set tokens
		const tokensByAddress = tokens.reduce((acc, token) => {
			acc[token.address] = token;
			return acc;
		}, {} as Record<string, JupiterToken>);

		store.setState((state) => {
			state.bot.tokens = tokensByAddress;
		});

		setStatus("tokensLoaded");

		// check if config is valid and load it
		loadConfig(store, setStatus, config);

		// create connection
		const connection = createSolanaConnection({
			rpcURL: store.getState().config.rpcURL,
		});
		// set keypair
		const keypair = createKeypair(store.getState().config.privateKey);

		// get wallet address
		const walletAddress = keypair.publicKey.toString();

		// set wallet address
		store.setState((state) => {
			state.wallet.address = walletAddress;
		});

		// create jupiter instance
		setStatus("loadingJupiter");

		const ammsToExclude = store.getState().config.ammsToExclude;

		const jupiter = await createJupiter(connection, keypair, ammsToExclude);
		setJupiter(jupiter);
		setStatus("jupiterLoaded");

		if (!tokensByAddress) {
			throw new Error("start: tokensByAddress is undefined");
		}

		// set bot status to "idle"
		store.setState((state) => {
			state.bot.isStarted = true;
			state.bot.startedAt = Date.now();
		});
		setStatus("ready");
	} catch (error) {
		console.error(error);
	}
};
