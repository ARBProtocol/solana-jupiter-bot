require("dotenv").config();
const { Connection, PublicKey } = require("@solana/web3.js");
const { setTimeout } = require("timers/promises");
const cache = require("../bot/cache");
const { loadConfigFile, toNumber, calculateProfit, toDecimal } = require("./index.js");

cache.config = loadConfigFile({ showSpinner: true });

const waitabit = async (ms) => {
	const mySecondPromise = new Promise(function(resolve,reject){
		console.log('construct a promise...')
		setTimeout(() => {
			reject(console.log('Error in promise'));
		},ms)
	})
  }

  const connection = new Connection(cache.config.rpc[0], {
    disableRetryOnRateLimit: true,
    commitment: 'confirmed',
  });

const checktrans = async (transaction,wallet_address) => {

    var transstatus = 0;
    var transid = '';
    var transresp = [];

    // Get the goods from the RPC
    await connection.getParsedTransaction(transaction, {"maxSupportedTransactionVersion": 0}).then((trans) => {
        transresp = trans;
    });  

    // Analyze the Data
    try {
        var transaction_changes = [];

        if (transresp.meta?.status.Err){
            // Failed Transaction
            //console.log(`STATUS ERROR. DID NOT SUCCEED #1!!! ${JSON.stringify(transresp.meta.status.Err)}`);
            return [transresp.meta.status.err,2];
        } else {
            //console.log('STATUS SUCCEED!!!');
            transstatus = 1;
        }

        var tokenamt=0;
        var tokendec=0;
        var tokenuiAmount=0;

        // Outgoing SOL native mgmt
        // Handle transfers of SOL that would not show up due to wrapping
        if (transresp.meta.innerInstructions){
            for (instructions of transresp.meta.innerInstructions){
                if(instructions.instructions){
                    for (parsed of instructions.instructions){
                        //console.log(JSON.stringify(parsed, null, 4));
                        if (parsed.parsed){
                            if (parsed.parsed.type=='transferChecked'){
                                if (parsed.parsed.info.authority==wallet_address && parsed.parsed.info.mint=='So11111111111111111111111111111111111111112'){
                                    tokenamt = parsed.parsed.info.tokenAmount.amount;
                                    tokendec = parsed.parsed.info.tokenAmount.decimals;
                                    tokenuiAmount = parsed.parsed.info.tokenAmount.uiAmount;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // SOL Transfer handling
        if (tokenuiAmount>0){
            transaction_changes['So11111111111111111111111111111111111111112'] = { status: transstatus, start: tokenamt, decimals: tokendec, end: 0, change: (-1*tokenamt), changedec: (-1*tokenuiAmount) };
        }

        // Pre Token Balance Handling
        for (token of transresp.meta.preTokenBalances){
            if (token.owner==wallet_address){
                transaction_changes[token.mint.toString()] = {status: transstatus, start: token.uiTokenAmount.amount, decimals: token.uiTokenAmount.decimals};
            };
        }

        // Post Token Handling
        for (token of transresp.meta.postTokenBalances){
            if (token.owner==wallet_address){
                if (transaction_changes[token.mint].start) {
                    // Case where token account existed already
                    diff = Number(token.uiTokenAmount.amount)-Number(transaction_changes[token.mint].start);
                    diffdec = toDecimal(diff,transaction_changes[token.mint].decimals);
                    transaction_changes[token.mint] = {...transaction_changes[token.mint], end: token.uiTokenAmount.amount, change: diff, changedec: diffdec} 
                } else {
                    // Case where token did not exist yet
                    // Set the initial to 0
                    transaction_changes[token.mint] = {status: transstatus, start: 0, decimals: token.uiTokenAmount.decimals};
                    // Calculate the difference
                    diff = Number(token.uiTokenAmount.amount)-Number(transaction_changes[token.mint].start);
                    diffdec = toDecimal(diff,transaction_changes[token.mint].decimals);
                    transaction_changes[token.mint] = {...transaction_changes[token.mint], end: token.uiTokenAmount.amount, change: diff, changedec: diffdec} 
                }
            }
        }

        //console.log(transaction_changes);
        return [transaction_changes,0];

    } catch(error) {
        //console.log(`STATUS ERROR. DID NOT RESOLVE OR ERROR #2!!!`);
        return [null,1];
    }
}

module.exports = {checktrans};






