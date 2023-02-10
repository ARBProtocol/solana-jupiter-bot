const fs = require("fs");
const chalk = require("chalk");
const bs58 = require("bs58");
const { Jupiter, getPlatformFeeAccounts } = require("@jup-ag/core");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");

const { toNumber } = require("../../../../utils");
const CONSTANTS = require("../../../../constants");

const setupHelpers = {
	setTokens: async (base) => {
		const { tokenA, tokenB } = await loadTokens(base);
		// const tokens = loadTokens(base);

		base.data.tokens.tokenA.value = tokenA;
		base.data.tokens.tokenB.value = tokenB;
	},

	setConnections: async (base) => {
		const wallet = loadWallet(base);
		base.spinner.text = "Setting up connection ...";

		// connect to RPC
		const connection = new Connection(base.data.cache.config.rpc[0]);
		await checkAtas(base, wallet, connection);

		base.spinner.text = "Loading Jupiter SDK...";

		const jupiter = await loadJupiter({
			cluster: base.data.cache.config.network,
			wallet,
			connection,
			wrapUnwrapSOL: base.data.cache.wrapUnwrapSOL,
		});

		base.jupiter = jupiter;
		// cache.isSetupDone = true;
	},

	setInitialTokenBalances: (base, multiToken = true) => {
		setSellTokenBalances(base);

		if (multiToken) {
			setBuyTokenBalances(base);
		}
	},
};

function loadTokens(base) {
	const config = base.data.cache.config;
	const hasSecondToken =
		config.tokenB.address && config.tokenA.address !== config.tokenB.address;

	try {
		// Load the tokens from file
		const tokens = JSON.parse(fs.readFileSync("./temp/tokens.json"));
		const findToken = (address) => tokens.find((t) => t.address === address);

		// Find the full object for tokenA and tokenB
		const tokenA = findToken(config.tokenA.address);
		const tokenB = hasSecondToken ? findToken(config.tokenB.address) : null;

		return { tokenA: tokenA, tokenB: tokenB };
	} catch (error) {
		base.spinner.text = chalk.black.bgRedBright(
			`\nLoading tokens failed!` +
				`\nPlease try to run the Wizard first using ${chalk.bold(
					"`yarn start`"
				)}\n`
		);
		throw error;
	}
}

function loadWallet(base) {
	try {
		base.spinner.text = "Checking wallet...";
		const privateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
		const publicKey = process.env.SOLANA_WALLET_PUBLIC_KEY;

		if (!privateKey || (publicKey && publicKey.length !== 88)) {
			throw new Error("Wallet check failed!");
		}

		return Keypair.fromSecretKey(bs58.decode(privateKey));
	} catch (error) {
		base.spinner.text = chalk.black.bgRedBright(
			`\nWallet check failed! ` +
				`\nPlease make sure that ${chalk.bold("SOLANA_WALLET_PRIVATE_KEY")}` +
				`\ninside ${chalk.bold(".env")} file is correct \n`
		);
		throw error;
	}
}

async function checkAtas(base, wallet, connection) {
	const required_arb = CONSTANTS.ARB_PROTOCOL.REQUIRED_AMOUNT;
	const errMessage = `Must hold ${required_arb.toLocaleString("en-US")} ARB`;

	try {
		const atas = await fetchAtas(wallet, connection);
		const totalAtas = atas.value.reduce((t, ata) => t + parseAtaAmount(ata), 0);

		if (totalAtas < required_arb) {
			console.error(`\n${errMessage}\n`);
			process.exit();
		}
	} catch (error) {
		console.log(error);
		base.helpers.exit.logExit(1, errMessage, base.data.cache);
		process.exitCode = 1; // Is this needed?
	}
}

async function fetchAtas(wallet, connection) {
	return await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
		mint: new PublicKey(CONSTANTS.ARB_PROTOCOL.PUBLIC_KEY),
	});
}

function parseAtaAmount(ata) {
	return parseFloat(ata.account.data.parsed.info.tokenAmount.uiAmount);
}

async function loadJupiter({ cluster, wallet, connection, wrapUnwrapSOL }) {
	const platformFeeAndAccounts = {
		feeBps: 0,
		feeAccounts: await getPlatformFeeAccounts(
			connection,
			new PublicKey(CONSTANTS.ARB_PROTOCOL.FEE_ACCOUNT_PUBLIC_KEY) // The platform fee account owner
		),
	};
	const jupiter = await Jupiter.load({
		connection,
		cluster,
		user: wallet,
		platformFeeAndAccounts,
		restrictIntermediateTokens: true,
		wrapUnwrapSOL,
	});
	return jupiter;
}

async function setBuyTokenBalances(base) {
	const sellToken = base.helpers.trade.tokenToSell(base);
	const buyToken = base.helpers.trade.tokenToBuy(base);
	const routes = await base.helpers.trade.calculateRoutes({
		base,
		inputToken: sellToken.value,
		outputToken: buyToken.value,
		amountToTrade: base.data.cache.initialBalance[sellToken.name],
		slippage: 0,
	});

	if (routes?.routesInfos?.length > 0) base.spinner.succeed("Routes computed!");
	else base.spinner.fail("No routes found. Something is wrong!");

	const initialBalance = routes.routesInfos[0].outAmountWithSlippage;
	// const initialBalance = Number(routes.toString());
	// const initialBalance = Number(
	// 	(
	// 		await base.helpers.trade.calculateRoutes(
	// 			base,
	// 			sellToken.value,
	// 			buyToken.value,
	// 			base.data.cache.initialBalance[sellToken.name],
	// 			0
	// 		)
	// 	).toString()
	// );

	updateTokenBalances(base, buyToken.name, initialBalance);
}

function setSellTokenBalances(base) {
	const token = base.helpers.trade.tokenToSell(base);
	const initialBalance = toNumber(
		base.data.cache.config.tradeSize.value,
		token.value.decimals
	);

	updateTokenBalances(base, token.name, initialBalance);
}

function updateTokenBalances(base, tokenName, initialBalance) {
	base.data.cache.initialBalance[tokenName] = initialBalance;
	base.data.cache.currentBalance[tokenName] = initialBalance;
	base.data.cache.lastBalance[tokenName] = initialBalance;
}

module.exports = setupHelpers;
