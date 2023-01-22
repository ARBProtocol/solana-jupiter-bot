import { Store } from "../store";
import { wrappedComputeRoutes } from "./bot";

export const getAndSetInitialOutAmount = async (
	store: Store,
	computeRoutes: wrappedComputeRoutes
) => {
	const routes = await computeRoutes();

	// if (!routes) throw new Error("getInitialOutAmount: routes is null");
	if (!routes) return;

	const bestRoute = routes.routesInfos[0];

	if (!bestRoute) throw new Error("getInitialOutAmount: No routes found");

	const initialOutAmount = bestRoute.outAmount;

	// set initial out amount
	store.setState((state) => {
		state.bot.prevOutAmount.tokenB = initialOutAmount;
		state.bot.initialOutAmount.tokenB = initialOutAmount;
	});

	return initialOutAmount;
};
