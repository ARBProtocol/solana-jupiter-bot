import { PublicBot } from "src/bot";
import { z } from "zod";

const StrategySchema = z.object({
	name: z.string(),
	config: z.object({
		tokens: z.array(z.string()),
		inToken: z.object({
			token: z.object({
				address: z.string(),
				decimals: z.number(),
				symbol: z.string().optional(),
				name: z.string().optional(),
			}),
		}),
		outToken: z.object({
			token: z.object({
				address: z.string(),
				decimals: z.number(),
				symbol: z.string().optional(),
				name: z.string().optional(),
			}),
		}),
	}),
});

/**
 * Set up everything needed for strategies to run. e.g., enriching token data, checking dependencies, etc.
 */
export const initStrategies = async (bot: PublicBot) => {
	bot.logger.info("initStrategies");
	const strategies = bot.strategies;

	for (const strategy of strategies) {
		if (!bot.aggregators[0].tokens) {
			const msg = `initStrategies: bot.aggregator.tokens not defined`;
			bot.logger.error(msg);
			throw new Error(msg);
		}

		// TODO: check dependencies

		const tokens = strategy.config?.tokens;

		if (!tokens) {
			const msg = `initStrategies: strategy ${strategy.name} does not have tokens defined`;
			bot.logger.error(msg);
			throw new Error(msg);
		}

		const tokensInfo = tokens.map((token) => {
			const found = bot.aggregators[0].tokens?.find(
				(loadedToken) => loadedToken.address === token
			);
			if (!found) {
				const msg = `initStrategies: token ${token} not found in loaded tokens`;
				bot.logger.error(msg);
				throw new Error(msg);
			}

			return found;
		});

		// This will allow strategies to use rich token data
		strategy.config.tokensInfo = tokensInfo;

		// if strategy has a init method, call it
		if (strategy.init) {
			bot.logger.info(`initStrategies: initializing ${strategy.name}`);

			await strategy.init(bot);

			bot.logger.info(`initStrategies: initialized ${strategy.name}`);
		}
	}

	if (strategies[0]) {
		const parsedStrategy = StrategySchema.parse(strategies[0]);
		if (parsedStrategy) {
			bot.store.setState((state) => {
				state.strategies.current.inToken = parsedStrategy.config.inToken.token;
				state.strategies.current.outToken =
					parsedStrategy.config.outToken.token;
			});
		}
	}

	bot.logger.info("initStrategies: done");
};
