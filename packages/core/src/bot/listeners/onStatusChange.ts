import { Bot } from "../bot";

export const onStatusChange = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("*", async (status, prevStatus) => {
		console.log(
			`🔥 onStatusChange FROM SUBSCRIBER <---------------- ${prevStatus} -> ${status}`
		);
	});
};
