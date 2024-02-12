const fs = require("fs");
const chalk = require("chalk");
const ora = require("ora-classic");
const bs58 = require("bs58");
const { Jupiter } = require("@jup-ag/core");
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } = require("@solana/web3.js");

var JSBI = (require('jsbi'));
var invariant = (require('tiny-invariant'));
var _Decimal = (require('decimal.js'));
var _Big = (require('big.js'));
var toFormat = (require('toformat'));
var anchor = require('@project-serum/anchor');

const { logExit } = require("./exit");
const { loadConfigFile, toDecimal } = require("../utils");
const { intro, listenHotkeys } = require("./ui");
const { setTimeout } = require("timers/promises");
const cache = require("./cache");
const wrapUnwrapSOL = cache.wrapUnwrapSOL;

// Account balance code
const balanceCheck = async (checkToken) => {
	let checkBalance = Number(0);
	let t = Number(0);

	const connection = new Connection(process.env.DEFAULT_RPC);
	wallet = Keypair.fromSecretKey(bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY));

	if (wrapUnwrapSOL && checkToken.address === 'So11111111111111111111111111111111111111112') {
		// This is where Native balance is needing to be checked and not the Wrapped SOL ATA
		try {
			const balance = await connection.getBalance(wallet.publicKey);
			checkBalance = balance / LAMPORTS_PER_SOL;
		} catch (error) {
			console.error('Error fetching native balance:', error);
		}
	} else {
		// Normal token so look up the ATA balance(s)
		let totalTokenBalance = BigInt(0);
		try {
 			const atas = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
				mint: new PublicKey(checkToken.address)
			});
		
			// Took a recipe from the cookbook for this one...
			atas.value.forEach((accountInfo) => {
				console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
				console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
				console.log(`owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`);
				console.log(`decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`);
				console.log(`amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`);
				totalTokenBalance += BigInt(accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]);
				console.log("====================");
			  });
			  
			  // As easy as pie...
			  checkBalance = Number(totalTokenBalance);

			} catch (error) {
			console.error('Error fetching token balance:', error);
		}
	}

	try {
		// Pass back the BN version to match
		var checkBalanceUi = toDecimal(
			checkBalance,
			checkToken.decimals
		);
		console.log(`Wallet balance for tokenA is ${checkBalanceUi} (${checkBalance})`);
	} catch (error) {
		console.error('Silence is golden.. Or not...:', error);
	}

	if (checkBalance>Number(0)){
			return checkBalance;
	} else {
			return(Number(0));
	}
};

const setup = async () => {
	let spinner, tokens, tokenA, tokenB, wallet;
	try {
		// listen for hotkeys
		listenHotkeys();
		await intro();

		// load config file and store it in cache
		cache.config = loadConfigFile({ showSpinner: false });

		spinner = ora({
			text: "Loading tokens...",
			discardStdin: false,
			color: "magenta",
		}).start();

		// read tokens.json file
		try {
			tokens = JSON.parse(fs.readFileSync("./temp/tokens.json"));
			// find tokens full Object
			tokenA = tokens.find((t) => t.address === cache.config.tokenA.address);

			if (cache.config.tradingStrategy !== "arbitrage")
				tokenB = tokens.find((t) => t.address === cache.config.tokenB.address);
		} catch (error) {
			spinner.text = chalk.black.bgRedBright(
				`\n	Loading tokens failed!\n	Please try to run the Wizard first using ${chalk.bold(
					"`yarn start`"
				)}\n`
			);
			throw error;
		}

		// check wallet private key again
		try {
			spinner.text = "Checking wallet...";
			if (
				!process.env.SOLANA_WALLET_PRIVATE_KEY ||
				(process.env.SOLANA_WALLET_PUBLIC_KEY &&
					process.env.SOLANA_WALLET_PUBLIC_KEY?.length !== 88)
			) {
				throw new Error("Wallet check failed!");
			} else {
				wallet = Keypair.fromSecretKey(
					bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
				);
			}
		} catch (error) {
			spinner.text = chalk.black.bgRedBright(
				`\n	Wallet check failed! \n	Please make sure that ${chalk.bold(
					"SOLANA_WALLET_PRIVATE_KEY "
				)}\n	inside ${chalk.bold(".env")} file is correct \n`
			);
			logExit(1, error);
			process.exitCode = 1;
			throw error;
		}

		spinner.text = "Setting up connection ...";
		const connection = new Connection(cache.config.rpc[0]);

		spinner.text = "Loading Jupiter V4 SDK...";

		const jupiter = await Jupiter.load({
			connection,
			cluster: cache.config.network,
			user: wallet,
			restrictIntermediateTokens: false,
			shouldLoadSerumOpenOrders: false,
			wrapUnwrapSOL: cache.wrapUnwrapSOL,
			ammsToExclude: {
				'Aldrin': false,
				'Crema': false,
				'Cropper': true,
				'Cykura': true,
				'DeltaFi': false,
				'GooseFX': true,
				'Invariant': false,
				'Lifinity': false,
				'Lifinity V2': false,
				'Marinade': false,
				'Mercurial': false,
				'Meteora': false,
				'Raydium': false,
				'Raydium CLMM': false,
				'Saber': false,
				'Serum': true,
				'Orca': false,
				'Step': false, 
				'Penguin': false,
				'Saros': false,
				'Stepn': true,
				'Orca (Whirlpools)': false,   
				'Sencha': false,
				'Saber (Decimals)': false,
				'Dradex': true,
				'Balansol': true,
				'Openbook': false,
				'Marco Polo': false,
				'Oasis': false,
				'BonkSwap': false,
				'Phoenix': false,
				'Symmetry': true,
				'Unknown': true			
			}
		});
		cache.isSetupDone = true;
		spinner.succeed("Setup done!");
		return { jupiter, tokenA, tokenB, wallet };
	} catch (error) {
		if (spinner)
			spinner.fail(
				chalk.bold.redBright(`Setting up failed!\n 	${spinner.text}`)
			);
		logExit(1, error);
		process.exitCode = 1;
	}
};

const getInitialotherAmountThreshold = async (
	jupiter,
	inputToken,
	outputToken,
	amountToTrade
) => {
	let spinner;
	try {
        const tokdecimals = cache.sideBuy ? inputToken.decimals : outputToken.decimals;
        const multiplythisbb = JSBI.BigInt(10 ** (tokdecimals));
		spinner = ora({
			text: "Computing routes for token with amountToTrade "+String(amountToTrade)+" with decimals "+tokdecimals+" and multiply is "+String(multiplythisbb),
			discardStdin: false,
			color: "magenta",
		}).start();

		//JSBI AMT to TRADE
		const amountInJSBI = JSBI.BigInt(amountToTrade);

		// compute routes for the first time
		const routes = await jupiter.computeRoutes({
			inputMint: new PublicKey(inputToken.address),
			outputMint: new PublicKey(outputToken.address),
			amount: amountInJSBI,
			slippageBps: 0,
			forceFetch: true,
			onlyDirectRoutes: false,
			filterTopNResult: 1,
		});

		if (routes?.routesInfos?.length > 0) spinner.succeed("Routes computed!");
		else spinner.fail("No routes found. Something is wrong! Check tokens:"+inputToken.address+" "+outputToken.address);

		return routes.routesInfos[0].otherAmountThreshold;
	} catch (error) {
		if (spinner)
			spinner.fail(chalk.bold.redBright("Computing routes failed!\n"));
		logExit(1, error);
		process.exitCode = 1;
	}
};

module.exports = {
	setup,
	getInitialotherAmountThreshold,
	balanceCheck,
};
