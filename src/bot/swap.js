const { calculateProfit, toDecimal, storeItInTempAsJSON } = require("../utils");
const cache = require("./cache");
const { NodeWallet } = require('@project-serum/common')
const { AnchorProvider } = require('@project-serum/anchor')
const { getSwapResultFromSolscanParser } = require("../services/solscan");
const { TransactionMessage, PublicKey, Keypair, Connection, sendAndConfirmTransaction, VersionedTransaction } = require("@solana/web3.js");
const bs58 = require('bs58')
const {
	AccountService,
	Reserve,
	FLASH_LOAN_ID,
  } = require( "@texture-finance/solana-flash-loan-sdk" );
const connection = new Connection(process.env.DEFAULT_RPC);


const arbSwap = async (jupiter, route, inputMint) => {
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		if (process.env.DEBUG) storeItInTempAsJSON("routeInfoBeforeSwap", route);

		let instructions = []
		let routes 
		let routes2 = await jupiter.computeRoutes({
			inputMint: new PublicKey(inputMint),
			outputMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
			amount:  route.inAmount,
			slippageBps: 6666,
			forceFetch: true
		});
		const tousdc = await routes2.routesInfos[0];
		 routes = await jupiter.computeRoutes({
			outputMint: new PublicKey(inputMint),
			inputMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
			amount: tousdc.outAmount,
			slippageBps: 6666,
			forceFetch: true
		});
		const totoken = routes.routesInfos[0];
	
		const execute2 = await jupiter.exchange({
			routeInfo: totoken,
		});
		await Promise.all(
			[execute2.setupTransaction, execute2.swapTransaction, execute2.cleanupTransaction]
			  .filter(Boolean)
			  .map(async (vTx) => {
				let DecompileArgs = {
					addressLookupTableAccounts:
					execute2.addressLookupTableAccounts,
				  };
				  let decompiled = TransactionMessage.decompile(
					// @ts-ignore
					vTx.message,
					DecompileArgs
				  );
				  let c = 0 
				  for (var abc of decompiled.instructions){
					if (c != 0){
						instructions.push(abc)
					}
					c++
				  }
			  })
		)
		const execute = await jupiter.exchange({
			routeInfo: route,
		});
		await Promise.all(
			[execute.setupTransaction, execute.swapTransaction, execute.cleanupTransaction]
			  .filter(Boolean)
			  .map(async (vTx) => {
				let DecompileArgs = {
					addressLookupTableAccounts:
					  execute.addressLookupTableAccounts,
				  };
				  let decompiled = TransactionMessage.decompile(
					// @ts-ignore
					vTx.message,
					DecompileArgs
				  );
				  let c = 0 
				  for (var abc of decompiled.instructions){
					if (c != 0){
						instructions.push(abc)
					}
					c++
				  }
							  })
		)
		const accountService = new AccountService(connection);

		let usdcReserve = await accountService.getReserveInfo(
			new PublicKey("8qow5YNnT9NfvxVsxYMiKV4ddggT5gEe3uLUvjQ6uYaZ")
		  );
		  let wsolReserve = await accountService.getReserveInfo(
			new PublicKey("EY9dLpeVro64JBTFUSNfo6Vu1r1R1MJVgTbDFtqFRKBD")
		  );
		const execute3 = await jupiter.exchange({
			routeInfo: tousdc,
		});
		await Promise.all(
			[execute3.setupTransaction, execute3.swapTransaction, execute3.cleanupTransaction]
			  .filter(Boolean)
			  .map(async (vTx) => {
				let DecompileArgs = {
					addressLookupTableAccounts:
					execute3.addressLookupTableAccounts,
				  };
				  let decompiled = TransactionMessage.decompile(
					// @ts-ignore
					vTx.message,
					DecompileArgs
				  );
				  let c = 0 
				  for (var abc of decompiled.instructions){
					if (c != 0){
						instructions.push(abc)
					}
					c++
				  }
							  })
		)

		const [token] = PublicKey.findProgramAddressSync(
			[
				(Keypair.fromSecretKey(
					bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
				)).publicKey.toBuffer(),
			(new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")).toBuffer(),
			(new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")).toBuffer(),
			],
			new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
		);
		let finalIxs = [
			usdcReserve.flashBorrow((tousdc.outAmount), token),
			...instructions,
			usdcReserve.flashRepay(totoken.outAmount, token, 
			(Keypair.fromSecretKey(
				bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
			)).publicKey)

		]

		var messageV00 = new TransactionMessage({
			payerKey: (Keypair.fromSecretKey(
				bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
			)).publicKey,
			recentBlockhash: await // @ts-ignore
			(
			  await connection.getLatestBlockhash()
			).blockhash,
			instructions: finalIxs,
		  }).compileToV0Message([
			// @ts-ignore
			...execute.addressLookupTableAccounts,
			...execute2.addressLookupTableAccounts,
			...execute3.addressLookupTableAccounts,
			// @ts-ignore
			(await connection.getAddressLookupTable(new PublicKey(	"4CoN8gzbkhLTCKSpChu83wMSwiadSz5Tk62KGU8k6rPE")))
		  .value]);
		  var transaction = new VersionedTransaction(messageV00);
		  let provider = new AnchorProvider(connection,new NodeWallet((Keypair.fromSecretKey(
			bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
		))),{})
		await transaction.sign([(Keypair.fromSecretKey(
			// @ts-ignore
			bs58.decode(process.env.SOLANA_WALLET_PRIVATE_KEY)
		  ))])
		  let result = await sendAndConfirmTransaction(connection,
			 transaction, 
			 {},
			 {})
		  console.log(result)

		if (process.env.DEBUG) storeItInTempAsJSON("result", result);

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [{tx: result, error: false}, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};

const swap = async (jupiter, route) => {
	try {
		const performanceOfTxStart = performance.now();
		cache.performanceOfTxStart = performanceOfTxStart;

		if (process.env.DEBUG) storeItInTempAsJSON("routeInfoBeforeSwap", route);

		const { execute } = await jupiter.exchange({
			routeInfo: route,
		});
		const result = await execute();

		if (process.env.DEBUG) storeItInTempAsJSON("result", result);

		const performanceOfTx = performance.now() - performanceOfTxStart;

		return [result, performanceOfTx];
	} catch (error) {
		console.log("Swap error: ", error);
	}
};
exports.swap = swap;

exports.arbSwap = arbSwap;

const failedSwapHandler = (tradeEntry) => {
	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].fail++;

	// update trade history
	cache.config.storeFailedTxInHistory;

	// update trade history
	let tempHistory = cache.tradeHistory;
	tempHistory.push(tradeEntry);
	cache.tradeHistory = tempHistory;
};
exports.failedSwapHandler = failedSwapHandler;

const successSwapHandler = async (tx, tradeEntry, tokenA, tokenB) => {
	if (process.env.DEBUG) storeItInTempAsJSON(`txResultFromSDK_${tx?.txid}`, tx);

	// update counter
	cache.tradeCounter[cache.sideBuy ? "buy" : "sell"].success++;

	if (cache.config.tradingStrategy === "pingpong") {
		// update balance
		if (cache.sideBuy) {
			cache.lastBalance.tokenA = cache.currentBalance.tokenA;
			cache.currentBalance.tokenA = 0;
			cache.currentBalance.tokenB = tx.outputAmount;
		} else {
			cache.lastBalance.tokenB = cache.currentBalance.tokenB;
			cache.currentBalance.tokenB = 0;
			cache.currentBalance.tokenA = tx.outputAmount;
		}

		// update profit
		if (cache.sideBuy) {
			cache.currentProfit.tokenA = 0;
			cache.currentProfit.tokenB = calculateProfit(
				cache.initialBalance.tokenB,
				cache.currentBalance.tokenB
			);
		} else {
			cache.currentProfit.tokenB = 0;
			cache.currentProfit.tokenA = calculateProfit(
				cache.initialBalance.tokenA,
				cache.currentBalance.tokenA
			);
		}

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(
			tx.inputAmount,
			cache.sideBuy ? tokenA.decimals : tokenB.decimals
		);
		tradeEntry.outAmount = toDecimal(
			tx.outputAmount,
			cache.sideBuy ? tokenB.decimals : tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			cache.lastBalance[cache.sideBuy ? "tokenB" : "tokenA"],
			tx.outputAmount
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;
	}
	if (cache.config.tradingStrategy === "arbitrage") {
		/** check real amounts on solscan because Jupiter SDK returns wrong amounts
		 *  when we trading TokenA <> TokenA (arbitrage)
		 */
		const [inAmountFromSolscanParser, outAmountFromSolscanParser] =
			await getSwapResultFromSolscanParser(tx?.txid);

		if (inAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan inputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);
		if (outAmountFromSolscanParser === -1)
			throw new Error(
				`Solscan outputAmount error\n	https://solscan.io/tx/${tx.txid}`
			);

		cache.lastBalance.tokenA = cache.currentBalance.tokenA;
		cache.currentBalance.tokenA =
			cache.lastBalance.tokenA +
			(outAmountFromSolscanParser - inAmountFromSolscanParser);

		// update trade history
		let tempHistory = cache.tradeHistory;

		tradeEntry.inAmount = toDecimal(inAmountFromSolscanParser, tokenA.decimals);
		tradeEntry.outAmount = toDecimal(
			outAmountFromSolscanParser,
			tokenA.decimals
		);

		tradeEntry.profit = calculateProfit(
			tradeEntry.inAmount,
			tradeEntry.outAmount
		);
		tempHistory.push(tradeEntry);
		cache.tradeHistory = tempHistory;

		const prevProfit = cache.currentProfit.tokenA;

		// total profit
		cache.currentProfit.tokenA = prevProfit + tradeEntry.profit;
	}
};
exports.successSwapHandler = successSwapHandler;
