import { PublicBot } from "src/bot";
import { createSolanaConnection, getTokenBalance } from "src/services/web3";
import { Wallet } from "./load-wallets";

const ARB_PROTOCOL_MINT = "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh";

export const validateWallets = async (bot: PublicBot) => {
	try {
		bot.setStatus("wallets:validating");
		const wallets = bot.store.getState().wallets;
		const validatedWallets: Wallet[] = [];

		if (!bot.config.current.rpcURLs[0]) {
			throw new Error("validateWallets: rpcURL is undefined");
		}

		const connection = createSolanaConnection({
			rpcURL: bot.config.current.rpcURLs[0],
		});

		if (!connection) {
			throw new Error("validateWallets: connection is undefined");
		}

		if (!wallets || wallets.length === 0) {
			bot.setStatus("wallets:error");
			throw new Error("validateWallets: no wallets");
		}

		for (const wallet of wallets) {
			if (!wallet.address) {
				throw new Error("validateWallets: wallet address is undefined");
			}

			if (!wallet.privateKey) {
				throw new Error("validateWallets: wallet private key is undefined");
			}

			if (wallet.privateKey.length < 87 || wallet.privateKey.length > 88) {
				throw new Error(
					"validateWallets: wallet private key seems to be invalid"
				);
			}

			const arbProtocolTokenBalance = await getTokenBalance({
				connection,
				walletAddress: wallet.address,
				tokenMint: ARB_PROTOCOL_MINT,
			});

			if (arbProtocolTokenBalance < 10_000) {
				bot.setStatus("sadWallet");
				console.log(
					`
				Oh! No! Wallet ${wallet.address} does not have enough ARB Protocol tokens (¬_¬)

				WELCOME TO THE ARB PROTOCOL! :)

				1. Please fund your wallet with at least 10,000 ARB tokens.
				* After this step, you will be able to use the bot.

				Your current balance: ${arbProtocolTokenBalance}

				2. Join the ARB Protocol community on Discord:
				https://discord.gg/wcxYzfKNaE

				3. Verify your wallet on Discord and gain Holder role and access additional channels.

				If you believe this is an error, please contact us on Discord.

				-----------------
				!!! CAUTION !!!

				Never share your private key with anyone!

				-----------------


				`
				);
				bot.setStatus("!shutdown");
			}

			validatedWallets.push({
				...wallet,
				balance: {
					[ARB_PROTOCOL_MINT]: {
						amount: arbProtocolTokenBalance,
						updatedAtEpoch: Date.now(),
					},
				},
			});
		}

		if (validatedWallets.length === 0) {
			throw new Error("validateWallets: no validated wallets");
		}

		bot.store.setState((state) => {
			state.wallets = validatedWallets;
		});

		bot.setStatus("wallets:validated");
	} catch (error) {
		bot.setStatus("wallets:error");
		console.error(error);
		bot.logger.error({ error }, "validateWallets:error");
		process.exit(1);
	}
};
