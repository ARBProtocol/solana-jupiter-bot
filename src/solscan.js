const { default: axios } = require("axios");
const promiseRetry = require("promise-retry");
const cache = require("./cache");
const { storeItInTempAsJSON } = require("./utils");

const getSwapResultFromSolscanParser = async (txid) => {
	try {
		// disable trading till swap result is ready
		cache.tradingEnabled = false;

		const fetcher = async (retry) => {
			const response = await axios.get(`https://api.solscan.io/transaction`, {
				params: {
					tx: txid,
				},
			});

			if (process.env.DEBUG)
				storeItInTempAsJSON(`solscan_${txid}`, response.data);

			if (response.status === 200) {
				if (response?.data?.mainActions) {
					return response.data;
				} else {
					retry(new Error("Transaction was not confirmed"));
				}
			}
		};

		const data = await promiseRetry(fetcher, {
			retries: 40,
			minTimeout: 500,
			maxTimeout: 1000,
		});

		// find signer wallet address
		const signerAccount = data.inputAccount.filter(
			(account) => account?.signer === true
		);

		const ownerAddress = signerAccount?.address;
		const tokenAddress = cache?.config?.tokenA.address;

		const mainActions = data.mainActions;

		let [inputAmount, outputAmount] = [-1, -1];
		mainActions.filter((action) => {
			const events = action?.data?.event;
			if (events) {
				const inputEvent = events.find(
					(event) =>
						event?.sourceOwner === ownerAddress &&
						event?.tokenAddress === tokenAddress
				);
				const outputEvent = events.find(
					(event) =>
						event?.destinationOwner === ownerAddress &&
						event?.tokenAddress === tokenAddress
				);

				if (inputEvent) inputAmount = inputEvent?.amount;

				if (outputEvent) outputAmount = outputEvent?.amount;
			}
		});

		return [inputAmount, outputAmount];
	} catch (error) {
		console.log(error);
	} finally {
		cache.tradingEnabled = true;
	}
};

module.exports = {
	getSwapResultFromSolscanParser,
};
