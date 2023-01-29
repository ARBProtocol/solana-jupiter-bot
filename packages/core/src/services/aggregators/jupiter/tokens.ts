import { JupiterToken, TOKEN_LIST_URL } from "./jupiter";
import axios from "axios";

export const getJupiterTokens = async () => {
	const response = await axios.get(TOKEN_LIST_URL["mainnet-beta"]);
	const data = response.data;
	if (!data) throw new Error("getJupiterTokens: No tokens found - empty data");
	return data as JupiterToken[] | undefined;
};
