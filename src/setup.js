const { Jupiter } = require("@jup-ag/core");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const chalk = require("chalk");
const fs = require("fs");
const ora = require("ora-classic");

const setup = async (config) => {
	try {
		const spinner = ora({
			text: "Setting up...",
			discardStdin: false,
		}).start();

		// read tokens.json file
		const tokens = JSON.parse(fs.readFileSync("./temp/tokens.json"));

		// find tokens full Object
		const tokenA = tokens.find((t) => t.address === config.tokenA.address);
		const tokenB = tokens.find((t) => t.address === config.tokenB.address);

		// check wallet private key
		if (!process.env.SOLANA_WALLET_PRIVATE_KEY)
			spinner.fail(
				chalk.bold.redBright("Set WALLET PRIVATE KEY in .env file!")
			) && process.exit(1);
		else if (
			process.env.SOLANA_WALLET_PUBLIC_KEY &&
			process.env.SOLANA_WALLET_PUBLIC_KEY?.length !== 88
		)
			spinner.fail(chalk.bold.redBright("WRONG WALLET PRIVATE KEY!")) &&
				process.exit(1);

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

		spinner.succeed("Setup done!");

		return { jupiter, tokenA, tokenB, blockedAMMs };
	} catch (error) {
		console.log(error);
	}
};

const getInitialOutAmountWithSlippage = async (
	jupiter,
	inputToken,
	outputToken,
	amountToTrade
) => {
	try {
		const spinner = ora({
			text: "Computing routes...",
			discardStdin: false,
		}).start();

		// compute routes for the first time
		const routes = await jupiter.computeRoutes({
			inputMint: new PublicKey(inputToken.address),
			outputMint: new PublicKey(outputToken.address),
			inputAmount: amountToTrade,
			slippage: 0,
			forceFeech: true,
		});

		if (routes?.routesInfos?.length > 0) spinner.succeed("Routes computed!");
		else spinner.fail("No routes found. Something is wrong!");

		return routes.routesInfos[0].outAmountWithSlippage;
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	setup,
	getInitialOutAmountWithSlippage,
};
