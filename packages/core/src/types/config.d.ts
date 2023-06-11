import { WalletPrivateKey } from "src/actions/load-wallets";

export interface Config {
	/** Max concurrently working strategies */
	maxConcurrent: number;
	/** Private keys */
	wallets: WalletPrivateKey[];
	rpcURLs: string[];
	rpcWSSs?: string[];
	limiters?: {
		transactions?: {
			pending: {
				enabled: boolean;
				max: number;
			};
			executionRate: {
				enabled: boolean;
				max: number;
				timeWindowMs: number;
			};
		};
		iterationsRate: {
			enabled: boolean;
			max: number;
			timeWindowMs: number;
		};
		aggregators?: {
			errorsRate: {
				enabled: boolean;
				max: number;
				cooldownMs: number;
				timeWindowMs: number;
			};
		};
	};
	arbProtocolBuyBack?: {
		enabled: boolean;
		/** The amount of profit to use for buyback */
		profitPercent: number;
	};
}
