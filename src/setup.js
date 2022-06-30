const { Jupiter } = require("@jup-ag/core");
const { Connection, Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
const fs = require("fs");

const setup = async (config) => {
	try {
		// read tokens.json file
		const tokens = JSON.parse(fs.readFileSync("./temp/tokens.json"));

		// find tokens full Object
		const tokenA = tokens.find((t) => t.address === config.tokenA.address);
		const tokenB = tokens.find((t) => t.address === config.tokenB.address);

		// check wallet
		if (!process.env.SOLANA_WALLET_PRIVATE_KEY)
			console.log("Wallet is not set") && process.exit(1);

		const wallet = Keypair.fromSecretKey(
			bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
		);

		// connect to RPC
		const connection = new Connection(config.rpc[0]);

		const jupiter = await Jupiter.load({
			connection,
			cluster: config.network,
			user: wallet,
		});

		// read blocked AMMs from blockedAMMs.json
		const blockedAMMs = {};
		if (fs.existsSync("./blockedAMMs.json")) {
			const blockedAMMs = JSON.parse(fs.readFileSync("./blockedAMMs.json"));
		}

		return { jupiter, tokenA, tokenB, blockedAMMs };
	} catch (error) {
		console.log(error);
	}
};
exports.setup = setup;
