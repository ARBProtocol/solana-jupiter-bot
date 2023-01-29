import { Address } from "@jup-ag/core";
import { Store } from "../store";
import { getErrorMessage } from "../utils";
import { PublicKey } from "../web3";

// get token info by address
export const getTokenInfo = (store: Store, address: Address) => {
	try {
		let token;
		const tokens = store.getState().bot.compatibleTokens;

		if (!tokens) throw new Error("compatibleTokens tokens are not loaded");

		token = tokens[address];
		if (!token) throw new Error("Token not found, address: " + address);

		if (!token.publicKey) {
			token = {
				...token,
				publicKey: new PublicKey(token.address),
			};
		}

		if (!token) {
			throw new Error("Token not found, address: " + address);
		}

		return token;
	} catch (e) {
		throw new Error(`getTokenInfo: ${getErrorMessage(e)}`);
	}
};
