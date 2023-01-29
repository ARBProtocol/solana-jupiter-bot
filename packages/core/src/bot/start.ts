import fs from "fs";

import {
	createJupiter,
	getJupiterTokens,
} from "../services/aggregators/jupiter";
import { validateWallet } from "../services/arb-protocol";
import { createKeypair, createSolanaConnection } from "../services/web3";
import { Store, Token } from "../store";
import { ConfigRequired, SetJupiter, SetStatus } from "./bot";
import { loadConfig } from "./load-config";
import { performanceTest } from "./performance-test";

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

		// create ./temp directory
		fs.mkdirSync("./temp", { recursive: true });

		// get all Jupiter tokens
		setStatus("loadingTokens");
		const tokens = await getJupiterTokens();

		if (!tokens) {
			throw new Error("start: tokens are null");
		}
		// set tokens
		const compatibleTokens = tokens.reduce((acc, token) => {
			if (token.decimals && token.address && token.symbol) {
				acc[token.address] = {
					decimals: token.decimals,
					symbol: token.symbol,
					...token,
				};
			}

			return acc;
		}, {} as Record<string, Token>);

		// check if tokens are valid
		if (!compatibleTokens) {
			throw new Error("start: compatibleTokens is undefined");
		}

		store.setState((state) => {
			state.bot.compatibleTokens = compatibleTokens;
		});

		setStatus("tokensLoaded");

		// check if config is valid and load it
		loadConfig(store, setStatus, config);

		// create connection
		const connection = createSolanaConnection({
			rpcURL: store.getState().config.rpcURL,
		});

		// create jupiter instance
		const ammsToExclude = store.getState().config.ammsToExclude;

		// set keypair
		const walletPrivateKey = store.getState().config.privateKey;
		const keypair = createKeypair(walletPrivateKey);

		// validate wallet
		const arbProtocolBalance = await validateWallet({
			connection,
			wallet: keypair.publicKey,
		});

		// create jupiter instance
		setStatus("loadingJupiter");
		const jupiter = await createJupiter(connection, keypair, ammsToExclude);
		setJupiter(jupiter);
		setStatus("jupiterLoaded");

		// set bot status to "idle"
		store.setState((state) => {
			state.bot.isStarted = true;
			state.bot.startedAt = Date.now();

			state.wallet.arbProtocolBalance = arbProtocolBalance;
		});
		setStatus("ready");
	} catch (error) {
		console.error(error);
		return setStatus("!shutdown");
	}
};
