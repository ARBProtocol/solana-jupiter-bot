import { Bot } from "../bot";
import { logger } from "../../logger";

export const onStatusChange = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("*", async ({ status, prevStatus }) => {
		logger.debug(
			`🔥 onStatusChange FROM SUBSCRIBER <---------------- ${prevStatus} -> ${status}`
		);
	});
};
