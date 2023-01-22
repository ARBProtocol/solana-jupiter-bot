import { RouteInfo, SwapSuccess } from "../aggregators/jupiter";
import { Store } from "../store";
import fs from "fs";
import { storeSwapResultInHistory } from "./store-swap-result-in-history";
import { getSwapResultFromSolscan } from "./get-swap-result-from-solscan";
import { calculateTxProfit } from "./calculate-tx-profit";
import { SetStatus } from "./bot";

export const onSwapSuccess = async (
	store: Store,
	setStatus: SetStatus,
	route: RouteInfo,
	swapResult: SwapSuccess,
	swapTimestamp: number
) => {
	console.log(
		"🚀 ~ file: onSwapSuccess.ts ~ line 4 ~ onSwapSuccess ~ SwapResult",
		swapResult
	);

	const txId = swapResult.txid;

	// save swapResult to {currentTime}.json in ./../temp folder

	try {
		fs.writeFileSync(
			`./temp/${swapTimestamp}.json`,
			JSON.stringify(swapResult, null, 2)
		);
	} catch (error) {
		console.log(error);
	}

	// increase swap count & success count
	store.setState((state) => {
		state.swaps.total++;
		state.swaps.success++;
	});

	// update success Rate
	store.setState((state) => {
		state.swaps.successRate = (state.swaps.success / state.swaps.total) * 100;
	});

	const inputAddress = swapResult.inputAddress.toString();
	const outputAddress = swapResult.outputAddress.toString();

	const isArbitrageSwap = inputAddress === outputAddress;
	console.log(
		"🚀 ~ file: onSwapSuccess.ts ~ line 22 ~ onSwapSuccess ~ isArbitrageSwap",
		isArbitrageSwap
	);

	storeSwapResultInHistory(store, setStatus, route, swapResult, swapTimestamp);

	const { inAmount, outAmount } = isArbitrageSwap
		? await getSwapResultFromSolscan(store, swapResult)
		: { inAmount: swapResult.inputAmount, outAmount: swapResult.outputAmount };

	if (!inAmount || !outAmount) {
		console.log(
			"🚀 ~ file: onSwapSuccess.ts ~ line 33 ~ onSwapSuccess ~ inAmount || outAmount",
			Date.now().toLocaleString(),
			inAmount,
			outAmount
		);
		return;
	}

	// set tx status to "success"
	store.setState((state) => {
		const temp = state.tradeHistory[txId];

		// calculate tx profit
		const { profit, profitPercent } = calculateTxProfit(inAmount, outAmount);

		if (temp) {
			state.tradeHistory[txId] = {
				...temp,
				status: "success",
				inAmount,
				outAmount,
				// DON'T FORGET TO VERIFY THIS COPILOT NONSENSE
				price: swapResult.outputAmount / swapResult.inputAmount,
				profit: profit,
				profitPercent: profitPercent,
			};
		}
	});
	setStatus("tradeHistoryUpdated");
};
