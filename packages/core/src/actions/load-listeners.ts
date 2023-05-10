import { PublicBot } from "src/bot";
import { onHistoryEntry } from "src/listeners/on-history-entry";
import { onRoutesComputed } from "src/listeners/on-routes-computed";
import { onShutdown } from "src/listeners/on-shutdown";

export const loadListeners = (bot: PublicBot) => {
	bot.setStatus("listeners:loading");

	onShutdown(bot);
	onHistoryEntry(bot);
	// onExecuteRecentRoute(bot);
	onRoutesComputed(bot);

	bot.onStatusChange("execute:recentRoute", () => {
		bot.logger.debug("listener:execute:recentRoute");
		bot.store.setState((state) => {
			state.strategies.current.shouldExecute = true;
		});
	});

	bot.onStatusChange("execute:shouldExecute", () => {
		bot.logger.debug("listener:execute:shouldExecute");

		const executionRateLimiterEnabled =
			bot.store.getState().limiters.transactions.executionRate.enabled;

		if (executionRateLimiterEnabled) {
			bot.logger.debug(
				"listener:execute:shouldExecute:executionRateLimiterActive bypassing!"
			);
			bot.store.setState((state) => {
				// bypass all limiters except pending transactions because it may lead to unexpected behavior
				state.limiters.transactions.executionRate.enabled = false;
				state.limiters.transactions.executionRate.active = false;
			});

			// reactivate limiter after transaction is executed
			const unsubscribe = bot.store.subscribe(
				(state) => state.status.value === "aggregator:execute:executing",
				() => {
					bot.logger.debug(
						"listener:execute:shouldExecute:executionRateLimiterActive reactivating..."
					);
					bot.store.setState((state) => {
						// reset shouldExecute flag
						state.strategies.current.shouldExecute = false;

						state.limiters.transactions.executionRate.enabled = true;
					});
					unsubscribe();
				}
			);
		}

		const iterationsRateLimiterEnabled =
			bot.store.getState().limiters.iterationsRate.enabled;

		if (iterationsRateLimiterEnabled) {
			bot.logger.debug(
				"listener:execute:shouldExecute:iterationsRateLimiterActive bypassing!"
			);
			bot.store.setState((state) => {
				// bypass all limiters except pending transactions because it may lead to unexpected behavior
				state.limiters.iterationsRate.enabled = false;
				state.limiters.iterationsRate.active = false;
			});

			// reactivate limiter after transaction is executed
			const unsubscribe = bot.store.subscribe(
				(state) => state.status.value === "aggregator:execute:executing",
				() => {
					bot.logger.debug(
						"listener:execute:shouldExecute:iterationsRateLimiterActive reactivating..."
					);
					bot.store.setState((state) => {
						// reset shouldExecute flag
						state.strategies.current.shouldExecute = false;

						state.limiters.iterationsRate.enabled = true;
					});
					unsubscribe();
				}
			);
		}
	});

	const STATUS_TIMEOUT = 1000 * 60 * 2; // 2 minutes
	const STATUS_PRE_TIMEOUT = 1000 * 30; // 30 seconds
	/**
	 * Bot status timeout listener
	 * Prevents bot from being stuck in a state for too long
	 */
	const onBotStatusTimeout = () => {
		const status = bot.store.getState().status;
		const now = performance.now();

		const diff = now - status.updatedAt;

		if (diff > STATUS_PRE_TIMEOUT) {
			bot.logger.warn(
				`listener:onBotStatusTimeout: bot status ${status.value} is not updated for ${diff}ms`
			);
		}

		if (diff > STATUS_TIMEOUT) {
			const msg = `listener:onBotStatusTimeout: bot status ${status.value} is not updated for ${diff}ms`;
			bot.logger.error(msg);
			console.error(msg);
			process.exit(1);
		}
	};
	setInterval(onBotStatusTimeout, 1000);

	bot.onStatusChange("*", ({ status, prevStatus }) => {
		bot.logger.debug(`listener:onStatusChange: ${prevStatus} -> ${status}`);
	});

	bot.setStatus("listeners:loaded");
};
