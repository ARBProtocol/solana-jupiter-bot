import { createStore } from "../../store";
import { createLogger } from "./create-logger";
import { createSetStatus } from "./create-set-status";
import { createAggregators as createAggregators } from "./create-aggregators";
import { CreateBotParams } from "src/bot";
import { initialState } from "src/store/initial-state";
import { createOnStatusChange } from "./on-status-change";
import { createBlockchainDataProviders } from "./create-blockchain-data-providers";
import { createReporters } from "./create-reporters";
import { createLimiters } from "./create-limiters";

export const createPublicActions = (config: CreateBotParams) => {
	const store = createStore(initialState);
	const setStatus = createSetStatus(store);
	const logger = createLogger(`./bot.log`);

	const publicActions = {
		logger,
		store,
		setStatus,
		onStatusChange: createOnStatusChange(store),
		aggregators: createAggregators(config.aggregators, store, logger),
		dataProviders: createBlockchainDataProviders(config.dataProviders),
		...createReporters(store, logger),
		limiters: createLimiters(store),
	};

	return {
		...publicActions,
	};
};
