import { Address } from "@jup-ag/core";
import { Store } from "../store";
import { getErrorMessage } from "../utils";

// get token info by address
export const getTokenInfo = (store: Store, address: Address) => {
	try {
		const tokens = store.getState().bot.tokens;

		if (!tokens) {
			throw new Error("Jupiter tokens are not loaded");
		}

		const token = tokens[address];

		if (!token) {
			throw new Error("Token not found, address: " + address);
		}

		return token;
	} catch (e) {
		throw new Error(`getTokenInfo: ${getErrorMessage(e)}`);
	}
};
