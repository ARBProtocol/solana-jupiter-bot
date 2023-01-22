import {
	Jupiter,
	Amm,
	Address,
	SwapResult,
	TransactionError,
} from "@jup-ag/core";

import { Keypair, SolanaConnection } from "../../web3";

export { TOKEN_LIST_URL, Address, RouteInfo } from "@jup-ag/core";

export type SwapSuccess = Extract<SwapResult, { txid: string }>;

export type SwapError = Extract<SwapResult, { error?: TransactionError }>;

type ExtensionKeys =
	| "address"
	| "assetContract"
	| "bridgeContract"
	| "coingeckoId"
	| "description"
	| "discord"
	| "twitter"
	| "website"
	| "facebook"
	| "instagram"
	| "medium"
	| "reddit"
	| "telegram"
	| "serumV3Usdc"
	| "serumV3Usdt"
	| "waterfallbot"
	| "github"
	| "coinmarketcap"
	| "solanium"
	| "linkedin"
	| "youtube"
	| "whitepaper"
	| "blog"
	| "telegramAnnouncements"
	| "vault";

export interface JupiterToken {
	chainId?: number;
	address: Address;
	symbol?: string;
	name?: string;
	decimals?: number;
	logoURI?: string;
	tags?: string[];
	extensions?: {
		[key in ExtensionKeys]?: string;
	};
}

export type JupiterType = Jupiter;

export type AmmsToExclude = {
	[key in Amm["label"]]?: boolean;
};

// create Jupiter instance
export const createJupiter = async (
	connection: SolanaConnection,
	keypair: Keypair,
	ammsToExclude?: AmmsToExclude
) => {
	try {
		const jupiter = await Jupiter.load({
			connection,
			cluster: "mainnet-beta",
			wrapUnwrapSOL: true,
			routeCacheDuration: 0,
			user: keypair,
			shouldLoadSerumOpenOrders: true, // default: true
			restrictIntermediateTokens: true,
			ammsToExclude,
		});

		return jupiter;
	} catch (e: Error | any) {
		// check if message property exists
		if (typeof e === "object" && "message" in e) {
			// check if error is 503
			if (e.message.includes("503")) {
				throw new Error(`Could not connect with current RPC.
			- Please check carefully if you have entered the correct RPC URL
			- Make sure you are connected to the internet
			- Make sure that the RPC is operational
			- If you're using VPN, please try to disable it and try again
			- If error persists, please try to use another RPC URL
			- If it still doesn't work, please report this issue on Github or on our Discord server

			CURRENT RPC: ${connection.rpcEndpoint}
			ERROR MESSAGE: ${e.message}

			IMPORTANT!
			NEVER SHARE YOUR PRIVATE KEY WITH ANYONE!
			`);
			}

			// check if error is missing data from RPC with RegEx pattern for "Missing [\w\d]+"
			if (e.message.match(/Missing [\w\d]+/)) {
				throw new Error(`Some data is missing from the RPC
			- If error persists, please try to use another RPC

			CURRENT RPC: ${connection.rpcEndpoint}
			
			IMPORTANT!
			NEVER SHARE YOUR PRIVATE KEY WITH ANYONE!`);
			}
		}

		throw new Error(`createJupiter: ${e}`);
	}
};
