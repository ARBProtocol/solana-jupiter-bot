// import { arbitrage } from "../../strategy/arbitrage";
import { logger } from "../../logger";
import { pingPong } from "../../strategy/ping-pong";
import { Bot } from "../bot";

export const onReady = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("ready", async () => {
		logger.info("🔥 onReady FROM SUBSCRIBER <----------------");
		bot.setStatus("idle");
		// get initial out amount - I'll let the strategy do it
		// await bot.getAndSetInitialOutAmountX();
		// await arbitrage(bot);
		await pingPong(bot);
	});
};
