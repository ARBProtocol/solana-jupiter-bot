import { RouteInfo, SwapError } from "../jupiter";
import { Store } from "../store";

import fs from "fs";
import { storeSwapResultInHistory } from "./storeSwapResultInHistory";
import { SetStatus } from "./bot";

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
		fs.writeFileSync(
			`./temp/${new Date().getTime()}.json`,
			JSON.stringify(swapResult, null, 2)
		);
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
