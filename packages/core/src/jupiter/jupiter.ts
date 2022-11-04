import { Jupiter } from "@jup-ag/core";

import { Keypair, SolanaConnection } from "../web3";

export { TOKEN_LIST_URL, Address, RouteInfo } from "@jup-ag/core";

export type JupiterType = Jupiter;

// create Jupiter instance
export const createJupiter = async (
	connection: SolanaConnection,
	keypair: Keypair
) => {
	const jupiter = await Jupiter.load({
		connection,
		cluster: "mainnet-beta",
		wrapUnwrapSOL: true,
		routeCacheDuration: 0,
		user: keypair,
		shouldLoadSerumOpenOrders: true, // default: true
		restrictIntermediateTokens: true,
	});

	return jupiter;
};
