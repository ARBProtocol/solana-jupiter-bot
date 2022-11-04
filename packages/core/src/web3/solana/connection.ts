import { Connection, Commitment } from "./web3";

export type SolanaConnection = Connection;

export const createSolanaConnection = ({
	rpcURL,
	// rpcWSS,
	commitment = "confirmed",
}: {
	rpcURL: string | null;
	rpcWSS?: string;
	commitment?: Commitment;
}) => {
	if (!rpcURL) {
		throw new Error("createSolanaConnection: rpcURL is null");
	}

	return new Connection(rpcURL, {
		commitment,
		// wsEndpoint: rpcWSS,
	});
};
