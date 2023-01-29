/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";

import { createBot } from "@arb-protocol/core";
import { startCLIUI } from "@arb-protocol/cliui";

// It's for testing right now
export const setup = async () => {
	try {
		// load .env file
		dotenv.config();

		// create bot
		const bot = createBot({
			privateKey: process.env.SOLANA_WALLET_PRIVATE_KEY as string,
			rpcURL: process.env.DEFAULT_RPC as string,
			ammsToExclude: {
				GooseFX: true,
				Serum: true,
			},
			backOff: {
				enabled: true,
				shutdownOnCount: 3,
			},
			// rpcWSS: (process.env.DEFAULT_RPC_WSS as string) || undefined,
			tokens: {
				tokenA: {
					address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
					// address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
					// address: "CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", // renBTC
					// address: "So11111111111111111111111111111111111111112", // SOL
					// address: "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh", // ARB
				},
				tokenB: {
					// address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
					address: "So11111111111111111111111111111111111111112", // SOL
					// address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
					// address: "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh", // ARB
				},
			},
			strategy: {
				tradeAmount: 0.05,
				rules: {
					execute: {
						above: {
							potentialProfit: 0.05,
						},
					},
					slippage: {
						bps: 10,
					},
				},
			},
			// rpcWSS:
			// 	"wss://silent-convincing-night.solana-mainnet.quiknode.pro/1b47blahblahblah40e4/",
		});

		if (!bot) throw new Error("Bot failed to start");

		bot.getStatus();

		// start cliui
		const { onKeyPress } = startCLIUI(bot, {
			allowClearConsole: false,
		});

		onKeyPress("z", () => console.log("You pressed z, test ok!"));
		// start bot
		await bot.start();

		// load plugin with loader
		// loadPlugin(bot, "getCounterPlugin2", (bot) => ({
		// 	countState: bot.store.getState().counter.count,
		// }));

		// bot.store.setState((prev) => {
		// 	prev.counter.count += 2;
		// });

		return bot;
	} catch (error) {
		console.error(error);
	}
};
