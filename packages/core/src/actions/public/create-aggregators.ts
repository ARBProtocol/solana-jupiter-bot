import { createAggregator } from "../create-aggregator";
import { GlobalStore } from "src/store";
import { Aggregators, RuntimeAggregators } from "src/types/aggregator";
import { Logger } from "./create-logger";

export const createAggregators = (
	aggregators: Aggregators,
	store: GlobalStore,
	logger: Logger
): RuntimeAggregators => {
	const runtimeAggregators = aggregators.map((agg) =>
		createAggregator(agg, store, logger)
	);

	if (runtimeAggregators.length === 0) {
		const msg = "createAggregators: No aggregators created";
		logger.error(msg);
		console.error(msg);
		throw new Error(msg);
	}

	return runtimeAggregators as RuntimeAggregators;
};
