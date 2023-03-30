import * as dotenv from "dotenv";

import { runWizard } from "@arb-protocol/wizard";
import { createBot, logger, ConfigRequired } from "@arb-protocol/core";
import { startCLIUI } from "@arb-protocol/cliui";

import fs from "fs";

export const start = async () => {
	try {
		// load .env file
		dotenv.config();

		// if there is no config.json file, run the wizard that will generate one
		if (!fs.existsSync("./config.json")) await runWizard();

		// fs get config.json
		const config: ConfigRequired & {
			cliui: {
				allowClearConsole?: boolean;
			};
		} = JSON.parse(fs.readFileSync("./config.json", "utf8"));

		// create bot
		const bot = createBot({
			...config,
			privateKey: process.env.SOLANA_WALLET_PRIVATE_KEY as string,
			rpcURL: process.env.DEFAULT_RPC as string,
		});

		if (!bot) throw new Error("Bot failed to start");

		// start cliui
		startCLIUI(bot, {
			/**
			 * This is for testing purposes only,
			 * by default it's set to true and every custom console.log will be cleared
			 */
			allowClearConsole: config.cliui?.allowClearConsole,
		});

		// start bot
		await bot.start();
	} catch (error) {
		logger.error(error);
	}
};
