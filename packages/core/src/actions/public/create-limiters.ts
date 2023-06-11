import { GlobalStore } from "src/store";
import { createRateLimiter } from "../create-rate-limiter";
import { Config } from "src/types/config";
import { z } from "zod";

export const createLimiters = (store: GlobalStore, config: Config) => {
	const initialConfig = config.limiters;

	if (initialConfig) {
		if (initialConfig?.iterationsRate) {
			const IterationsRateLimiterSchema = z.object({
				max: z.number().int().positive(),
				timeWindowMs: z.number().int().positive(),
				enabled: z.boolean(),
			});

			const parsed = IterationsRateLimiterSchema.parse(
				initialConfig.iterationsRate
			);

			store.setState((state) => {
				state.limiters.iterationsRate.max = parsed.max;
				state.limiters.iterationsRate.timeWindowMs = parsed.timeWindowMs;
				state.limiters.iterationsRate.enabled = parsed.enabled;
			});
		}

		if (initialConfig?.aggregators?.errorsRate) {
			const AggregatorErrorsRateLimiterSchema = z.object({
				max: z.number().int().positive(),
				timeWindowMs: z.number().int().positive(),
				cooldownMs: z.number().int().positive(),
				enabled: z.boolean(),
			});

			const parsed = AggregatorErrorsRateLimiterSchema.parse(
				initialConfig.aggregators.errorsRate
			);

			store.setState((state) => {
				state.limiters.aggregators.errorsRate.max = parsed.max;
				state.limiters.aggregators.errorsRate.timeWindowMs =
					parsed.timeWindowMs;
				state.limiters.aggregators.errorsRate.cooldownMs = parsed.cooldownMs;
				state.limiters.aggregators.errorsRate.enabled = parsed.enabled;
			});
		}
	}

	/**
	 * Iteration rate limiter
	 * Activate when iteration rate is too high per given time window
	 */
	const iterationsRateLimiter = () => {
		const config = store.getState().limiters.iterationsRate;

		return createRateLimiter({
			max: config.max,
			timeWindowMs: config.timeWindowMs,
			onLimit: (current) => {
				store.setState((state) => {
					state.limiters.iterationsRate.current = current;
					state.limiters.iterationsRate.active = false;
					state.limiters.iterationsRate.activatedAtRel = performance.now();
				});
			},
			onAllow: (current) => {
				store.setState((state) => {
					state.limiters.iterationsRate.current = current;
					state.limiters.iterationsRate.active = true;
					state.limiters.iterationsRate.activatedAtRel = performance.now();
				});
			},
		});
	};

	const aggregatorErrorsLimiter = () => {
		const config = store.getState().limiters.aggregators.errorsRate;

		const rateLimiter = createRateLimiter({
			max: config.max,
			timeWindowMs: config.timeWindowMs,
			cooldownMs: config.cooldownMs,
			onLimit: (current) => {
				store.setState((state) => {
					state.limiters.aggregators.errorsRate.current = current;
					state.limiters.aggregators.errorsRate.active = true;
					state.limiters.aggregators.errorsRate.activatedAtRel =
						performance.now();
				});
			},
			onAllow: (current) => {
				store.setState((state) => {
					state.limiters.aggregators.errorsRate.current = current;
				});
			},
			onCooldown: (cooldownUntilRel) => {
				store.setState((state) => {
					state.limiters.aggregators.errorsRate.cooldownUntilRel =
						cooldownUntilRel;
				});
			},
			onCooldownEnd: () => {
				store.setState((state) => {
					state.limiters.aggregators.errorsRate.active = false;
				});
			},
		});

		// listen for aggregator errors
		store.subscribe(
			(state) => state.status.value,
			(status) => {
				if (status !== "aggregator:computingRoutesError") return;
				rateLimiter.shouldAllow(performance.now());
			}
		);
		return rateLimiter;
	};

	return {
		transactions: {
			// TODO: refactor init-limiters.ts
			executionRate: {},
			// TODO: refactor init-limiters.ts
			pending: {},
		},
		iterationsRate: iterationsRateLimiter(),
		aggregators: {
			errorsRate: aggregatorErrorsLimiter(),
		},
	};
};
