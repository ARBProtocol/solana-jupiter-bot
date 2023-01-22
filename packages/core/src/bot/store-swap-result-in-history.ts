import { RouteInfo, SwapResult } from "@jup-ag/core";
import { Store, TradeHistoryEntry } from "../store";
import { JSBItoNumber } from "../utils";

import fs from "fs";
import { SetStatus } from "./bot";

export const storeSwapResultInHistory = (
	store: Store,
	setStatus: SetStatus,
	route: RouteInfo,
	swapResult: SwapResult,
	swapTimestamp: number
) => {
	const { address: inputAddress } = store.getState().config.tokens.tokenA;
	const { address: outputAddress } = store.getState().config.tokens.tokenB;
	try {
		let entry: TradeHistoryEntry = {
			timestamp: swapTimestamp,
			txId: "dev",
			status: "pending",
			statusUpdatedAt: performance.now(),
			inAmount: 0,
			outAmount: 0,
			inToken: "dev",
			outToken: "dev",
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
				inAmount: JSBItoNumber(route.inAmount),
			};
		}

		if (typeof swapResult === "object" && "txid" in swapResult) {
			entry = {
				...entry,
				txId: swapResult.txid,
				status: "fetchingResult",
				statusUpdatedAt: performance.now(),
				inAmount: swapResult.inputAmount,
				outAmount: swapResult.outputAmount,
			};
		}

		store.setState((state) => {
			state.tradeHistory[entry.txId] = entry;
		});
		setStatus("tradeHistoryUpdated");

		const tradeHistory = store.getState().tradeHistory;
		fs.writeFileSync(
			"./temp/history.json",
			JSON.stringify(tradeHistory, null, 2)
		);
	} catch (error) {
		console.log("storeSwapResultInHistory error", error);
	}
};
