import { PublicBot } from "src/bot";

export const onShutdown = (bot: PublicBot) => {
	bot.onStatusChange("!shutdown", ({ prevStatus }) => {
		const msg = `!SHUTDOWN REQUEST on status "${prevStatus}"`;
		bot.logger.info(msg);
		console.log(msg);
		process.exit(0);
	});
};
