import { RouteInfo, SwapError } from "../aggregators/jupiter";
import { Store } from "../store";

import { storeSwapResultInHistory } from "./store-swap-result-in-history";
import { SetStatus } from "./bot";
import { writeJsonToTempDir } from "../utils";

export const onSwapError = (
	store: Store,
	setStatus: SetStatus,
	route: RouteInfo,
	swapResult: SwapError,
	swapTimestamp: number
) => {
	console.log(
		"🚀 ~ file: onSwapFail.ts ~ line 5 ~ onSwapFail ~ swapResult",
		swapResult
	);

	try {
		writeJsonToTempDir(swapTimestamp, swapResult);
	} catch (error) {
		console.log(error);
	}

	// increase swap fail count & total count
	store.setState((state) => {
		state.swaps.total++;
		state.swaps.fail++;
	});

	// update success Rate
	store.setState((state) => {
		state.swaps.successRate = (state.swaps.success / state.swaps.total) * 100;
	});

	storeSwapResultInHistory(store, setStatus, route, swapResult, swapTimestamp);
};
