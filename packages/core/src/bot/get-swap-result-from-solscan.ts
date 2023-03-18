import { Event, getTransaction } from "../services/solscan";
import { Store } from "../store";

import { SwapSuccess } from "../services/aggregators/jupiter";
import { writeJsonToTempDir } from "../utils";
import { logger } from "../logger";

export const getSwapResultFromSolscan = async (
	store: Store,
	swapResult: SwapSuccess,
	inputAddress: string,
	outputAddress: string
) => {
	if (!swapResult)
		throw new Error("getSwapResultFromSolscan: swapResult is null");

	const walletAddress = store.getState().wallet.address;

	const { txid: txId } = swapResult;

	if (!txId || !inputAddress || !outputAddress) {
		return { txId: null, inAmount: null, outAmount: null };
	}

	// set swap status to fetchingResults
	store.setState((state) => {
		if (state.tradeHistory.txId) {
			state.tradeHistory.txId.status = "fetchingResult";
			state.tradeHistory.txId.statusUpdatedAt = performance.now();
		}
	});

	const tx = await getTransaction(txId);

	if (tx) {
		writeJsonToTempDir("txSolscanResult", tx);
		const result: Event[] = [];

		const inputAddressString = inputAddress.toString();

		const outputAddressString = outputAddress.toString();

		if ("unknownTransfers" in tx) {
			logger.debug("SOLSCAN - UnknownTransfers found");
			tx.unknownTransfers.forEach((transfer) => {
				const tokenRelatedEvents = transfer.event.filter(({ tokenAddress }) => {
					logger.debug("SOLSCAN - UnknownTransfers tokenAddress", tokenAddress);
					return (
						tokenAddress === inputAddressString ||
						tokenAddress === outputAddressString
					);
				});

				logger.debug(
					"🚀 ~ file: getSwapResultFromSolscan.ts:62 ~ tx.unknownTransfers.forEach ~ tokenAddress === inputAddress.toString()",
					inputAddressString,
					outputAddressString
				);
				result.push(...tokenRelatedEvents);
			});
			logger.debug("SOLSCAN - UnknownTransfers found - DONE", result);
		}

		if ("innerInstructions" in tx && tx.innerInstructions) {
			logger.debug("SOLSCAN - innerInstructions found");
			tx.innerInstructions.forEach((instruction) => {
				const tokenRelatedEvents = instruction.parsedInstructions.filter(
					(instruction) => {
						const extra = instruction.extra;
						if (extra) {
							const tokenAddress = extra.tokenAddress;
							logger.debug(
								"SOLSCAN - innerInstructions tokenAddress, inputAddress, outputAddress",
								tokenAddress,
								inputAddressString,
								outputAddressString
							);
							return (
								tokenAddress === inputAddressString ||
								tokenAddress === outputAddressString
							);
						}
					}
				);

				result.push(
					...tokenRelatedEvents.map((instruction) => instruction.extra as Event)
				);
			});

			logger.debug("SOLSCAN - innerInstructions found - DONE", result);
		}

		logger.debug("SOLSCAN - result", result);

		if (result.length > 0) {
			const inAmount = Number(
				result.find((event) => event.sourceOwner === walletAddress)?.amount
			);

			logger.debug(
				"HERE",
				result.find((event) => event.sourceOwner === walletAddress)?.amount
			);

			const outAmount = Number(
				result.find((event) => event.destinationOwner === walletAddress)?.amount
			);

			logger.debug(
				"HERE",
				result.find((event) => event.destinationOwner === walletAddress)?.amount
			);

			writeJsonToTempDir("txResult", result);

			logger.debug(
				"🚀 ~ file: getSwapResultFromSolscan.ts:46 ~ tx.unknownTransfers.forEach ~ result",
				result
			);

			// set swap status to success
			store.setState((state) => {
				if (state.tradeHistory.txId) {
					const temp = { ...state.tradeHistory.txId };
					temp.status = "success";
					temp.statusUpdatedAt = performance.now();
					return temp;
				}
			});

			return {
				txId,
				inAmount,
				outAmount,
			};
		}
	}

	logger.error("SOLSCAN - No result found !!!!!!!!!!!!!!!!!!!");

	// set swap status to failed
	store.setState((state) => {
		if (state.tradeHistory.txId) {
			const temp = { ...state.tradeHistory.txId };
			temp.status = "unknown";
			temp.statusUpdatedAt = performance.now();
			return temp;
		}
	});

	return { txId, inAmount: null, outAmount: null };
};
