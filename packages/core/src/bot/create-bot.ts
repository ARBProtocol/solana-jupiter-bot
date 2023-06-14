import { ReadOnly } from "../utils";
import { Wallet } from "src/actions/load-wallets";
import { BlockchainDataProvider } from "src/actions/public/create-blockchain-data-providers";
import { Aggregators } from "src/types/aggregator";
import { Config } from "src/types/config";
import { Strategies } from "src/types/strategy";

export interface CreateBotParams {
	config: Config;
	aggregators: Aggregators;
	strategies: Strategies;
	/** Blockchain data providers which will be used to retrieve transaction info */
	dataProviders: BlockchainDataProvider[];
}

export const createBot = (params: CreateBotParams) => {
	return {
		config: {
			initial: params.config as ReadOnly<Config>,
			current: params.config,
		},
		strategies: params.strategies,
		wallets: [] as Wallet[],
	};
};

export type Bot = ReturnType<typeof createBot>;
