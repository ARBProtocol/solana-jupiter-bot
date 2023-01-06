import { arbitrage } from "../../strategy/arbitrage";
// import { pingPong } from "../../strategy/ping-pong";
import { Bot } from "../bot";

export const onReady = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("ready", async () => {
		console.log("🔥 onReady FROM SUBSCRIBER <----------------");
		bot.setStatus("idle");
		// get initial out amount
		await bot.getAndSetInitialOutAmountX();
		await arbitrage(bot);
		// await pingPong(bot);
	});
};
