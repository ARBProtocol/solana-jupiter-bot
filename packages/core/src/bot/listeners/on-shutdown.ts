import { logger } from "../../logger";
import { Bot } from "../bot";

export const onShutdown = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("!shutdown", async () => {
		logger.warn("!onShutdown: shutting down...");
		process.exit(0);
	});
};
