import { TokenMintAddress } from "../../services/aggregators/jupiter";
import { Store } from "../../store";
import { getTokenInfo } from "../get-token-Info";

export const setToken = (
	store: Store,
	tokenAddress: TokenMintAddress | null
) => {
	if (!tokenAddress) {
		throw new Error("setToken: tokenAddress is null");
	}

	// get stored tokens

	// get additional token info
	const tokenInfo = getTokenInfo(store, tokenAddress);

	// check decimals

	store.setState((state) => {
		state.config.tokens[tokenAddress] = { ...tokenInfo };
		state.bot.tokens[tokenAddress] = { ...tokenInfo };
	});
};
