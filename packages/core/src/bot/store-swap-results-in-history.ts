import { RouteInfo, SwapResult } from "@jup-ag/core";

import { Store, Token, TradeHistoryEntry } from "../store";
import { JSBItoNumber, toDecimal, writeJsonToTempDir } from "../utils";
import { SetStatus } from "./bot";

export const storeSwapResultInHistory = (
	store: Store,
	setStatus: SetStatus,
	route: RouteInfo,
	swapResult: SwapResult,
	swapTimestamp: number,
	inToken: Token,
	outToken: Token,
	txUUID: string
) => {
	if (!inToken) throw new Error("inToken not set");
	if (!outToken) throw new Error("outToken not set");

	const {
		address: inputAddress,
		symbol: inTokenSymbol,
		decimals: inTokenDecimals,
	} = inToken;
	const {
		address: outputAddress,
		symbol: outTokenSymbol,
		decimals: outTokenDecimals,
	} = outToken;

	try {
		let entry: TradeHistoryEntry = {
			timestamp: swapTimestamp,
			txId: "dev",
			status: "pending",
			statusUpdatedAt: performance.now(),
			inAmount: 0,
			outAmount: 0,
			inToken: inTokenSymbol,
			outToken: outTokenSymbol,
			expectedOutAmount: JSBItoNumber(route.outAmount),
			market: "dev",
			inTokenAddress: inputAddress,
			outTokenAddress: outputAddress,
			price: 0,
			expectedPrice: 0,
			expectedProfit: 0,
			profit: 0,
			expectedProfitPercent: 0,
			profitPercent: 0,
			totalProfit: 0,
			totalProfitPercent: 0,
		};

		if (typeof swapResult === "object" && "error" in swapResult) {
			entry = {
				...entry,
				txId: swapResult.error?.txid || "error",
				status: "error",
				statusUpdatedAt: performance.now(),
				error: swapResult.error?.message,
				inAmount: toDecimal(
					JSBItoNumber(route.inAmount),
					inTokenDecimals
				).toNumber(),
			};
		}

		if (typeof swapResult === "object" && "txid" in swapResult) {
			entry = {
				...entry,
				txId: swapResult.txid,
				status: "fetchingResult",
				statusUpdatedAt: performance.now(),
				inAmount:
					toDecimal(JSBItoNumber(route.inAmount), inTokenDecimals).toNumber() ||
					0,
				outAmount:
					toDecimal(
						JSBItoNumber(route.outAmount),
						outTokenDecimals
					).toNumber() || 0,
			};
		}

		store.setState((state) => {
			state.tradeHistory[txUUID] = entry;
		});
		setStatus("tradeHistoryUpdated");

		const tradeHistory = store.getState().tradeHistory;

		writeJsonToTempDir("history", tradeHistory);
	} catch (error) {
		console.log("storeSwapResultInHistory error", error);
	}
};
