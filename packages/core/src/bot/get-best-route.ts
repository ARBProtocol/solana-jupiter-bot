import { logger } from "../logger";
import { RouteInfo } from "../services/aggregators/jupiter";
import { Store } from "../store";

import { writeJsonToTempDir } from "../utils";

export const getBestRoute = (
	store: Store,
	routes?: {
		routesInfos: RouteInfo[];
		cached: boolean;
	}
) => {
	try {
		if (!routes) throw new Error("getBestRoute: routes is null");
		if (!routes.routesInfos)
			throw new Error("getBestRoute: routesInfos is null");

		const { routesInfos } = routes;

		writeJsonToTempDir("routes", routesInfos[0]);

		if (routesInfos.length === 0)
			throw new Error("getBestRoute: routes is empty");

		// const excludedAmms = store.getState().routes.excludedAmms;

		// let filteredRoutes;
		// if (excludedAmms.length > 0) {
		//     filteredRoutes = routes.filter((route) => {
		//         route.
		//     });
		// } else {
		//     filteredRoutes = routes;
		// }

		return routesInfos[0];
	} catch (error) {
		logger.error("getBestRoute: error", error);
	}
};
