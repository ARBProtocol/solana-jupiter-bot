import { Jupiter, RouteInfo } from "../jupiter";
import { Store } from "../store";
import { SetStatus } from "./bot";
import { onSwapSuccess } from "./onSwapSuccess";
import { onSwapError } from "./onSwapError";

/**
 * It takes a route, and then uses the route to execute a swap
 * @param {Store} store - Store - the global store
 * @param {SetStatus} setStatus - a function that sets the bot's status
 * @param {Jupiter | null} jupiter - Jupiter | null
 * @param {RouteInfo} [route] - the route to be used for the swap
 */
export const swap = async (
	store: Store,
	setStatus: SetStatus,
	jupiter: Jupiter | null,
	route?: RouteInfo
) => {
	try {
		// set bot status to "swapping"
		setStatus("swapping");

		if (!jupiter) {
			throw new Error("swap: Jupiter instance does not exist");
		}

		if (!route) {
			// try to get route from store
			const currentRoute = store.getState().routes.currentRoute.raw;
			if (!currentRoute) {
				throw new Error("swap: route does not exist");
			}
			route = currentRoute;
			console.log("🚀 ~ file: swap.ts ~ line 30 ~ route", route);
		}

		// execute swap
		const { execute } = await jupiter.exchange({
			routeInfo: route,
		});

		const swapTimestamp = Date.now();
		const swapTimeStart = performance.now();

		const swapResult = await execute();

		const swapTime = performance.now() - swapTimeStart;

		store.setState((state) => {
			state.swaps.swapTime = swapTime;
		});

		if (typeof swapResult === "object" && "txid" in swapResult) {
			// swap success
			onSwapSuccess(store, setStatus, route, swapResult, swapTimestamp);
		} else if (typeof swapResult === "object" && "error" in swapResult) {
			// swap error
			onSwapError(store, setStatus, route, swapResult, swapTimestamp);
			setStatus("swapFail");
		} else {
			throw new Error("swap: swapResult is not valid");
		}

		setStatus("swapSuccess");
		setStatus("idle");

		return swapResult;
	} catch (error) {
		console.log("🚀 ~ file: swap.ts:74 ~ error", error);
		setStatus("swapFail");
		return error;
	} finally {
		setStatus("idle");
	}
};
