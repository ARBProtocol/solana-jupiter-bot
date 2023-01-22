import { PublicKey } from "../web3";
import { Address } from "../aggregators/jupiter";
import { Store } from "../store";
import { getTokenInfo } from "../bot/get-token-Info";

export const setToken = (
	store: Store,
	slot: "tokenA" | "tokenB",
	tokenAddress: Address | null
) => {
	if (!tokenAddress) {
		throw new Error("setToken: tokenAddress is null");
	}

	// get additional token info
	const tokenInfo = getTokenInfo(store, tokenAddress);

	const tokenPublicKey = new PublicKey(tokenAddress);

	store.setState((state) => {
		state.config.tokens[slot] = {
			...tokenInfo,
			publicKey: tokenPublicKey,
		};
	});
};
