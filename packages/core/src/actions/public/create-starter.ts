import { StrategyRunner } from "../../strategies/strategy-runner";
import { PublicBot } from "src/bot";
import { validateStrategies } from "../validate-strategies";
import { initStrategies } from "../init-strategies";
import { loadTokens } from "../load-tokens";
import { validateWallets } from "src/actions/validate-wallets";
import { loadWallets } from "../load-wallets";
import { loadListeners } from "../load-listeners";
import { initAggregators } from "../init-aggregators";
import { initLimiters } from "../init-limiters";

export const createStarter = (bot: PublicBot) => {
	return {
		async start() {
			try {
				bot.setStatus("bot:initializing");

				loadListeners(bot);

				loadWallets(bot);
				await validateWallets(bot);

				await initAggregators(bot);

				validateStrategies(bot);
				await loadTokens(bot);
				await initStrategies(bot);

				initLimiters(bot);

				// TODO: checkStrategyDependencies(bot);

				StrategyRunner(bot, bot.config.current.maxConcurrent)?.run();

				bot.setStatus("bot:initialized");
			} catch (error) {
				bot.setStatus("bot:error");
				bot.logger.error(error);
				console.error(error);
				process.exit(1);
			}
		},
	};
};
