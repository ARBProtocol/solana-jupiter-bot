import { logger } from "../logger";
import { RouteInfo, SwapSuccess } from "../services/aggregators/jupiter";
import { Store, Token } from "../store";
import { NumberToJSBI, toDecimal, writeJsonToTempDir } from "../utils";
import { SetStatus } from "./bot";
import { calculateTxProfit } from "./calculate-tx-profit";
import { getSwapResultFromSolscan } from "./get-swap-result-from-solscan";
import { storeSwapResultInHistory } from "./store-swap-results-in-history";

export const onSwapSuccess = async (
	store: Store,
	setStatus: SetStatus,
	route: RouteInfo,
	swapResult: SwapSuccess,
	swapTimestamp: number,
	inToken: Token,
	outToken: Token,
	txUUID: string
) => {
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

	writeJsonToTempDir(swapTimestamp, swapResult);

	// increase swap count & success count
	store.setState((state) => {
		state.swaps.total++;
		state.swaps.success++;
	});

	// update success Rate
	store.setState((state) => {
		state.swaps.successRate = (state.swaps.success / state.swaps.total) * 100;
	});

	const isArbitrageSwap = inputAddress === outputAddress;

	const tokens = store.getState().bot.tokens;
	if (!tokens) throw new Error("tokens not set");

	if (!outToken) throw new Error("outToken not found");

	storeSwapResultInHistory(
		store,
		setStatus,
		route,
		swapResult,
		swapTimestamp,
		inToken,
		outToken,
		txUUID
	);

	const { inAmount, outAmount } = isArbitrageSwap
		? await getSwapResultFromSolscan(
				store,
				swapResult,
				inputAddress,
				outputAddress
		  )
		: { inAmount: swapResult.inputAmount, outAmount: swapResult.outputAmount };

	if (!inAmount || !outAmount) return;

	const prevOutAmount = store.getState().bot.prevOutAmount[outputAddress];

	const outAmountToCompare = prevOutAmount?.decimal;
	if (!outAmountToCompare) throw new Error("outAmountToCompare not found");

	// calculate tx profit
	const { profit, profitPercent } = calculateTxProfit(
		outAmountToCompare,
		toDecimal(outAmount, outToken.decimals)
	);

	// set prev out amount
	logger.debug(
		`setting prev out amount for ${outToken.symbol} to ${outAmount}`
	);
	store.setState((state) => {
		state.bot.prevOutAmount[outputAddress] = {
			jsbi: NumberToJSBI(outAmount),
			decimal: toDecimal(outAmount, outToken.decimals),
		};
	});

	// set tx status to "success"
	store.setState((state) => {
		const temp = state.tradeHistory[txUUID];

		if (temp) {
			state.tradeHistory[txUUID] = {
				...temp,
				status: "success",
				inAmount: toDecimal(inAmount, inTokenDecimals).toNumber() || 0,
				outAmount: toDecimal(outAmount, outTokenDecimals).toNumber() || 0,
				inToken: inTokenSymbol,
				outToken: outTokenSymbol,
				// DON'T FORGET TO VERIFY THIS COPILOT NONSENSE
				price: swapResult.outputAmount / swapResult.inputAmount,
				profit: profit.toNumber(),
				profitPercent: profitPercent.toNumber(),
			};
		}
	});

	setStatus("tradeHistoryUpdated");
};
