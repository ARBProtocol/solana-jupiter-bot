import { PublicBot } from "src/bot";
import { parseError } from "src/utils";
import z from "zod";

export const initLimiters = (bot: PublicBot) => {
	try {
		bot.setStatus("limiters:initializing");

		// load config
		const limitersConfig = bot.config.current.limiters;

		if (limitersConfig) {
			if (limitersConfig?.transactions?.pending) {
				const PendingTxLimiterSchema = z.object({
					max: z.number().int().positive(),
					enabled: z.boolean(),
				});

				const parsed = PendingTxLimiterSchema.parse(
					limitersConfig.transactions.pending
				);

				bot.store.setState((state) => {
					state.limiters.transactions.pending.max = parsed.max;
					state.limiters.transactions.pending.enabled = parsed.enabled;
				});
			}

			if (limitersConfig?.transactions?.executionRate) {
				const ExecutionRateLimiterSchema = z.object({
					max: z.number().int().positive(),
					timeWindowMs: z.number().int().positive(),
					enabled: z.boolean(),
				});

				const parsed = ExecutionRateLimiterSchema.parse(
					limitersConfig.transactions.executionRate
				);

				bot.store.setState((state) => {
					state.limiters.transactions.executionRate.max = parsed.max;
					state.limiters.transactions.executionRate.timeWindowMs =
						parsed.timeWindowMs;
					state.limiters.transactions.executionRate.enabled = parsed.enabled;
				});
			}

			if (limitersConfig?.iterationsRate) {
				const IterationsRateLimiterSchema = z.object({
					max: z.number().int().positive(),
					timeWindowMs: z.number().int().positive(),
					enabled: z.boolean(),
				});

				const parsed = IterationsRateLimiterSchema.parse(
					limitersConfig.iterationsRate
				);

				bot.store.setState((state) => {
					state.limiters.iterationsRate.max = parsed.max;
					state.limiters.iterationsRate.timeWindowMs = parsed.timeWindowMs;
					state.limiters.iterationsRate.enabled = parsed.enabled;
				});
			}
		}

		/**
		 * Pending transactions limiter
		 * Activate when pending transactions max is reached
		 */
		bot.store.subscribe(
			(state) => state.stats.global.transactions.pending.value,
			(pendingTransactions) => {
				const state = bot.store.getState();

				// If limiter is disabled, do nothing
				if (!state.limiters.transactions.pending.enabled) return;

				bot.logger.debug("limiters:transactions:pending: checking...");

				// Activate when pending transactions max is reached
				if (pendingTransactions >= state.limiters.transactions.pending.max) {
					bot.store.setState((state) => {
						state.limiters.transactions.pending.active = true;
						state.limiters.transactions.pending.activatedAtRel =
							performance.now();
					});

					bot.setStatus("limiters:transactions:pending:activated");
					bot.logger.debug(
						`limiters:transactions:pending: ACTIVATED by pending transactions ${pendingTransactions} >= ${state.limiters.transactions.pending.max} max`
					);
				} else {
					// Reset active state
					bot.store.setState((state) => {
						state.limiters.transactions.pending.active = false;
					});

					bot.logger.debug(
						`limiters:transactions:pending: OK | reset because pending transactions ${pendingTransactions} < ${state.limiters.transactions.pending.max} max`
					);
				}
			}
		);

		/**
		 * Execution rate limiter
		 * Activate when execution rate is too high per given time window
		 */
		const executionRateLimiter = () => {
			const state = bot.store.getState();

			// If limiter is disabled, do nothing
			if (!state.limiters.transactions.executionRate.enabled) return;

			const now = Date.now();
			const maxTxPerWindow = state.limiters.transactions.executionRate.max;
			const timeWindow = state.limiters.transactions.executionRate.timeWindowMs;
			const transactionsInTimeWindow = Object.values(state.tradeHistory).filter(
				(trade) => trade?.createdAt && now - trade.createdAt <= timeWindow
			).length;

			// report current execution rate
			bot.store.setState((state) => {
				state.limiters.transactions.executionRate.current =
					transactionsInTimeWindow;
			});

			// Activate when execution rate is too high per given time window
			if (transactionsInTimeWindow >= maxTxPerWindow) {
				bot.store.setState((state) => {
					state.limiters.transactions.executionRate.active = true;
					state.limiters.transactions.executionRate.activatedAtRel =
						performance.now();
				});

				bot.setStatus("limiters:executionRate:activated");
				bot.logger.debug(
					`limiters:transactions:executionRate: ACTIVATED by ${transactionsInTimeWindow}/${maxTxPerWindow} transactions max reached within ${timeWindow}ms time window`
				);

				// set timeout to check again after time window
				setTimeout(executionRateLimiter, timeWindow);
			} else {
				// Reset active state
				bot.store.setState((state) => {
					state.limiters.transactions.executionRate.active = false;
				});
			}
		};

		// Check every time pending transactions change
		bot.store.subscribe(
			(state) => state.stats.global.transactions.pending.value,
			executionRateLimiter
		);

		bot.setStatus("limiters:initialized");
	} catch (error) {
		const parsedError = parseError(error);

		bot.logger.error(
			{
				error,
			},
			`limiters:initializing:error: ${
				parsedError ? parsedError.message : "unknown"
			}`
		);
		bot.setStatus("limiters:error");
	}
};
