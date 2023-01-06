import { Store } from "../../store";

export const swapRateLimiter = async (store: Store) => {
	try {
		const rateLimiter = store.getState().swaps.rateLimiter;

		if (rateLimiter.isEnabled) {
			const currentValue = rateLimiter.value;
			const currentTimestamp = performance.now();

			if (currentTimestamp - rateLimiter.timestamp > rateLimiter.perMs) {
				store.setState((state) => {
					state.swaps.rateLimiter.timestamp = currentTimestamp;
					state.swaps.rateLimiter.value = 0;
					state.swaps.rateLimiter.isActive = false;
				});
			}

			if (currentValue >= rateLimiter.max) {
				store.setState((state) => {
					state.swaps.rateLimiter.isActive = true;
				});
				return true;
			}
		}
		return false;
	} catch (error) {
		console.log("🚀 ~ file: arbitrage.ts:93 ~ strategy ~ error", error);
	}
};
