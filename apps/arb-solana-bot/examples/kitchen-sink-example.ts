import { startCLIUI } from "@arb-protocol/cliui";
import { ConfigRequired, loadPlugin } from "@arb-protocol/core";
import { createBot } from "@arb-protocol/core";
import { runWizard } from "@arb-protocol/wizard";
import * as dotenv from "dotenv";
import fs from "fs";

type Config = ConfigRequired & {
	cliui: {
		allowClearConsole?: boolean;
	};
};

export const kitchenSinkExample = async () => {
	// load .env file
	dotenv.config();

	// if there is no config.json file, run the wizard that will generate one
	if (!fs.existsSync("./config.json")) runWizard();

	// get config.json
	const config: Config = JSON.parse(fs.readFileSync("./config.json", "utf8"));

	// create bot instance
	const bot = createBot({
		...config,
		privateKey: process.env.SOLANA_WALLET_PRIVATE_KEY as string,
		rpcURL: process.env.DEFAULT_RPC as string,
	});

	if (!bot) throw new Error("Bot failed to start");

	// Start CLI UI and get onKeyPress function
	const { onKeyPress } = startCLIUI(bot, {
		/**
		 * This is for testing purposes only, by default it's set to true
		 * and every custom console.log will be cleared.
		 * while debugging you can set it to `false` to see all the logs (and every frame of the UI)
		 */
		allowClearConsole: config.cliui?.allowClearConsole,
	});

	/**
	 * onKeyPress function will allow you to listen to key presses
	 * and execute a callback function
	 */
	onKeyPress("k", () => console.log("You pressed `k` and this is the msg from callback!"));

	// Start bot
	await bot.start();

	// TODO: Plugins Example

	// Get bot state
	const getStatus = bot.getStatus();
	console.log("This is current bot status", { getStatus });

	/**
	 * Get bot wallet address (STATE) from the store
	 * Store created with
	 * - Zustand: https://github.com/pmndrs/zustand
	 * - Immer: https://github.com/immerjs/immer
	 */
	const myExampleState = bot.store.getState().wallet.address;
	console.log("This is current bot wallet address", { myExampleState });

	// Set state to the store
	bot.store.setState((state) => {
		state.config.strategy.id = "my-custom-strategy"; // set strategy id
	});

	const myCustomStrategyId = bot.store.getState().config.strategy.id;
	console.log("This is current bot strategy id", { myCustomStrategyId: myCustomStrategyId });
};
