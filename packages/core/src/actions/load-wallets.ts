import { PublicBot } from "src/bot";
import { createKeypair } from "src/services/web3";
import { TokenMintAddress } from "src/types/token";

export type WalletPrivateKey = string;
export type WalletPublicKey = string;

export type Wallet = {
	address: WalletPublicKey;
	privateKey: WalletPrivateKey;
	balance?: Record<
		TokenMintAddress,
		{
			amount: number;
			updatedAtEpoch: number;
		}
	>;
};

export const loadWallets = (bot: PublicBot) => {
	bot.setStatus("wallets:loading");
	const { wallets } = bot.config.current;

	if (!wallets || wallets.length === 0) {
		bot.setStatus("wallets:error");
		throw new Error("loadWallets: no wallets");
	}

	for (const wallet of wallets) {
		const keypair = createKeypair(wallet);

		if (!keypair) {
			throw new Error("loadWallets: keypair is undefined");
		}

		bot.store.setState((state) => {
			state.wallets.push({
				address: keypair.publicKey.toString(),
				privateKey: wallet,
			});
		});
	}

	bot.setStatus("wallets:loaded");
};
