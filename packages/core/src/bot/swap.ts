import { v4 as uuid } from "uuid";

import { Jupiter, RouteInfo } from "../services/aggregators/jupiter";
import { Store, Token, TradeHistoryEntry } from "../store";
import { JSBItoNumber } from "../utils";
import { SetStatus } from "./bot";
import { onSwapError } from "./on-swap-error";
import { onSwapSuccess } from "./on-swap-success";

export const swap = async ({
	store,
	setStatus,
	jupiter,
	route,
	inToken,
	outToken,
}: {
	store: Store;
	setStatus: SetStatus;
	jupiter: Jupiter | null;
	route?: RouteInfo;
	inToken?: Token;
	outToken?: Token;
}) => {
	try {
		// set bot status to "swapping"
		setStatus("swapping");

		if (!jupiter) {
			throw new Error("swap: Jupiter instance does not exist");
		}

		if (!route) {
			// try to get route from store
			const currentRoute = store.getState().routes.currentRoute.raw;
			if (!currentRoute) {
				throw new Error("swap: route does not exist");
			}
			route = currentRoute;
			console.log("🚀 ~ file: swap.ts ~ line 30 ~ route", route);
		}

		// get inToken & outToken from store if not provided (unsafe)
		inToken ||= store.getState().bot.currentInToken;
		outToken ||= store.getState().bot.currentOutToken;

		if (!inToken || !outToken) {
			throw new Error("swap: inToken or outToken does not exist");
		}

		// execute swap
		const { execute } = await jupiter.exchange({
			routeInfo: route,
			// wrapUnwrapSOL: false, TODO: get setting from config
		});

		const swapTimestamp = Date.now();

		// store swap info in history

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

		const entry: TradeHistoryEntry = {
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

		const txUUID = uuid();

		store.setState((state) => {
			state.tradeHistory[txUUID] = entry;
		});

		const swapTimeStart = performance.now();

		const swapResult = await execute();

		const swapTime = performance.now() - swapTimeStart;

		store.setState((state) => {
			state.swaps.swapTime = swapTime;
		});

		let isSwapSuccess = false;

		if (typeof swapResult === "object" && "txid" in swapResult) {
			// swap success
			onSwapSuccess(
				store,
				setStatus,
				route,
				swapResult,
				swapTimestamp,
				inToken,
				outToken,
				txUUID
			);
			setStatus("swapSuccess");
			isSwapSuccess = true;
		} else if (typeof swapResult === "object" && "error" in swapResult) {
			// swap error
			onSwapError(
				store,
				setStatus,
				route,
				swapResult,
				swapTimestamp,
				inToken,
				outToken,
				txUUID
			);
			setStatus("swapFail");
		} else {
			throw new Error("swap: swapResult is not valid");
		}

		setStatus("idle");

		return { isSwapSuccess, swapResult };
	} catch (error) {
		console.log("🚀 ~ file: swap.ts:74 ~ error", error);
		setStatus("swapFail");
		return { error };
	} finally {
		setStatus("idle");
	}
};
