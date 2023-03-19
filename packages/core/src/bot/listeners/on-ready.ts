// import { arbitrage } from "../../strategy/arbitrage";
import { logger } from "../../logger";
import { arbitrage } from "../../strategy/arbitrage";
import { pingPong } from "../../strategy/ping-pong";
import { Bot } from "../bot";

export const onReady = async (bot: Omit<Bot, "loadPlugin">) => {
	bot.onStatus("ready", async () => {
		const strategyId = bot.store.getState().config.strategy.id;
		logger.info(`STRATEGY: ${strategyId}`);

		if (!strategyId || strategyId === "not-set")
			throw new Error("strategy is not set");

		bot.setStatus("idle");

		if (strategyId === "arbitrage") {
			await arbitrage(bot);
		}

		if (strategyId === "ping-pong") {
			await pingPong(bot);
		}
	});
};
