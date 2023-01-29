import { toDecimal } from "../../utils";
import { SolanaConnection, PublicKey, getTokenBalance } from "../web3";

export const validateWallet = async ({
	connection,
	wallet,
}: {
	connection: SolanaConnection;
	wallet: PublicKey;
}) => {
	const arbProtocolTokenBalance = await getTokenBalance({
		connection,
		wallet,
		token: "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh",
	});

	if (arbProtocolTokenBalance > 10_000)
		return toDecimal(arbProtocolTokenBalance);

	throw new Error(
		`
            WELCOME TO THE ARB PROTOCOL! :)

            1. Please fund your wallet with at least 10,000 ARB tokens.
            * After this step, you will be able to use the bot.
            
            Your balance: ${arbProtocolTokenBalance}

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
};
