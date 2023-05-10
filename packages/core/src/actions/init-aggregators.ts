import { PublicBot } from "src/bot";

export const initAggregators = async (bot: PublicBot) => {
	bot.setStatus("aggregators:initializing");
	for (const aggregator of bot.aggregators) {
		try {
			await aggregator.init(bot.config.current);
		} catch (err) {
			bot.setStatus("aggregators:error");
			// TODO: show aggregator id in the error message
			bot.logger.error("initAggregators: error initializing aggregator");
			// @ts-expect-error FIXME: fix types, handle errors
			throw new Error(err);
		}
	}

	bot.aggregators.forEach((aggregator) => {
		if (!aggregator.isInitialized) {
			bot.setStatus("aggregators:error");
			throw new Error("createStarter: aggregator not initialized");
		}
	});
	bot.setStatus("aggregators:initialized");
};
