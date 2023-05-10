/**
 * Inspired by @staccDOTsol code, thanks for contribution!
 */

import { PublicKey } from "./web3";
import { SolanaConnection } from "./connection";

export const getTokenBalance = async ({
	connection,
	walletAddress,
	tokenMint,
}: {
	connection: SolanaConnection;
	walletAddress: string;
	tokenMint: string;
}) => {
	let tokenBalance = 0;

	const accountInfo = await connection.getParsedTokenAccountsByOwner(
		new PublicKey(walletAddress),
		{ mint: new PublicKey(tokenMint) }
	);

	if (accountInfo.value.length > 0) {
		for (const account of accountInfo.value) {
			const amount = account.account.data.parsed?.info?.tokenAmount?.uiAmount;
			tokenBalance += amount ? parseFloat(amount) : 0;
		}
	}

	return tokenBalance;
};
