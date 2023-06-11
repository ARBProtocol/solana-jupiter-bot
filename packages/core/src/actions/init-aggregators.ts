import { PublicBot } from "src/bot";
import { logger } from "src/logger";

const MAX_RETRIES = 3;

const retry = async <T>(fn: () => T, retries = 0): Promise<T> => {
	try {
		return await fn();
	} catch (err) {
		if (retries < MAX_RETRIES) {
			const msg = `aggregators:initializing:error: retrying (${
				retries + 1
			}/${MAX_RETRIES})...\n${err}`;
			console.error(msg);
			logger.error(msg);
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return retry(fn, retries + 1);
		} else {
			throw new Error(
				`aggregators:initializing:error: Failed after ${MAX_RETRIES} retries\n${err}`
			);
		}
	}
};

export const initAggregators = async (bot: PublicBot) => {
	bot.setStatus("aggregators:initializing");
	for (const aggregator of bot.aggregators) {
		try {
			await retry(() => aggregator.init(bot.config.current));
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
