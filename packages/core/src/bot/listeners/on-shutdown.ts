import { Bot } from "../bot";

export const onShutdown = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("!shutdown", async () => {
		console.log("!onShutdown: shutting down...");
		process.exit(0);
	});
};
