import { PublicBot } from "src/bot";

// Improvement: use zod to validate strategies
export const validateStrategies = (bot: PublicBot) => {
	bot.setStatus("strategies:initializing");
	bot.logger.info("validating strategies");
	bot.logger.debug({ strategies: bot.strategies }, "validateStrategies:");

	const strategies = bot.strategies;

	// strategies[0]?.config.tokens;

	const required = ["id", "name", "version", "config", "run"];
	const requiredConfig = ["tokens"];

	for (const strategy of strategies) {
		for (const key of required) {
			if (!(key in strategy)) {
				throw new Error(
					`Strategy ${
						strategy.name || "<NAME NOT PROVIDED>"
					} is not valid: ${key} is missing`
				);
			}
		}

		for (const key of requiredConfig) {
			if (!(key in strategy.config)) {
				throw new Error(
					`Strategy ${
						strategy.name || "<NAME NOT PROVIDED>"
					} is not valid: config.${key} is missing`
				);
			}
		}
	}

	if (strategies[0]) {
		// register strategy as current
		bot.store.setState((state) => {
			state.strategies.current.name = strategies[0].name;
		});
	}

	bot.setStatus("strategies:initialized");
	bot.logger.info("strategies initialized");
};
