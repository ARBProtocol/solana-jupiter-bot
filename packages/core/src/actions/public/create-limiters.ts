import { GlobalStore } from "src/store";
import { createRateLimiter } from "../create-rate-limiter";

export const createLimiters = (store: GlobalStore) => {
	const state = store.getState();

	/**
	 * Iteration rate limiter
	 * Activate when iteration rate is too high per given time window
	 * // TODO: this can be done better because setInterval is not accurate
	 */
	const iterationsRateLimiter = createRateLimiter({
		max: state.limiters.iterationsRate.max,
		timeWindowMs: state.limiters.iterationsRate.timeWindowMs,
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

	return {
		transactions: {
			// TODO: refactor init-limiters.ts
			executionRate: {},
			// TODO: refactor init-limiters.ts
			pending: {},
		},
		iterationsRate: iterationsRateLimiter,
	};
};
