/**
 * Inspired by @staccDOTsol code, thanks for contribution!
 */

import { PublicKey } from "./web3";
import { SolanaConnection } from "./connection";

export const getTokenBalance = async ({
	connection,
	wallet,
	token,
}: {
	connection: SolanaConnection;
	wallet: PublicKey;
	token: PublicKey | string;
}) => {
	let tokenBalance = 0;

	const mint = typeof token === "string" ? new PublicKey(token) : token;

	const accountInfo = await connection.getParsedTokenAccountsByOwner(wallet, {
		mint,
	});

	if (accountInfo.value.length > 0) {
		for (const account of accountInfo.value) {
			const amount = account.account.data.parsed?.info?.tokenAmount?.uiAmount;
			tokenBalance += amount ? parseFloat(amount) : 0;
		}
	}

	return tokenBalance;
};
