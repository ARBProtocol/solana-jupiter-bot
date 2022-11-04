import { Bot } from "../bot/bot";
import { PublicKey } from "../web3";
import { Address } from "../jupiter";

export const setToken = (
	store: Bot["store"],
	slot: "tokenA" | "tokenB",
	tokenAddress: Address | null
) => {
	if (!tokenAddress) {
		throw new Error("setToken: tokenAddress is null");
	}

	const tokenPublicKey = new PublicKey(tokenAddress);

	store.setState((state) => {
		state.config.tokens[slot].publicKey = tokenPublicKey;
	});
};
