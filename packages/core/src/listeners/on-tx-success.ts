import { PublicBot } from "src/bot";
import { TradeHistoryEntry } from "src/types/trade-history";
import { thingToMulti } from "src/utils";
import { ulid } from "ulidx";

const ARB_PROTOCOL_MINT = "9tzZzEHsKnwFL1A3DyFJwj36KnZj3gZ7g4srWp9YTEoh";

// TODO: refactor this, split buyback into its own file
export const onTxSuccess = async (
	bot: PublicBot,
	successfulTransactions: TradeHistoryEntry[]
) => {
	const arbBuyBackProfitPercent =
		bot.config.current.arbProtocolBuyBack?.profitPercent;

	if (
		!bot.config.current.arbProtocolBuyBack?.enabled ||
		!arbBuyBackProfitPercent
	)
		return;

	bot.logger.info("listeners:onTxSuccess:start");
	if (successfulTransactions.length === 0) {
		bot.logger.error(
			"listeners:onTxSuccess: no successful transactions. should not be called!"
		);
		return;
	}

	// go get txs without arbAccTxId

	const txsWithoutArbAccTxId = successfulTransactions.filter(
		(tx) =>
			!tx.arbAccRuntimeId &&
			!tx.isArbAccTx &&
			tx.profit !== undefined &&
			tx.outTokenDecimals &&
			!tx?.unrealizedProfit
	);

	if (txsWithoutArbAccTxId.length === 0) return;

	// setup arb tx
	// const arbTxs = txsWithoutArbAccTxId.map((tx) => );

	for (const tx of txsWithoutArbAccTxId) {
		// calculate arb tx amount

		if (
			!tx.inTokenAddress ||
			!tx.outTokenAddress ||
			!tx.inAmount ||
			!tx.profit ||
			!tx.outTokenDecimals
		) {
			const msg = `listeners:onTxSuccess:error: tx:${tx.uid} some tx data is missing: cannot continue`;
			bot.logger.error({ tx }, msg);
			console.error(msg);
			return;
		}

		// Calculate 5% of tx profit TODO: make this configurable
		const profitMulti = thingToMulti.fromBlockchainValue(
			tx.profit,
			tx.outTokenDecimals
		);

		if (!profitMulti) {
			const msg = `listeners:onTxSuccess:error: tx:${tx.uid} failed to convert tx.profit to Multi: cannot continue`;
			bot.logger.error({ tx }, msg);
			console.error(msg);
			// FIXME: remove this exit after testing
			return;
		}

		// FIXME: change this to 0.05 after testing
		const arbTxAmountDec = profitMulti.uiValue.decimal.mul(
			arbBuyBackProfitPercent
		);

		bot.logger.debug(
			{ arbTxAmountDec },
			`listeners:onTxSuccess: tx:${tx.uid} arbTxAmountDec`
		);

		const arbTxAmount = thingToMulti.fromUiValue(
			arbTxAmountDec,
			tx.outTokenDecimals
		);

		if (!arbTxAmount) {
			const msg = `listeners:onTxSuccess:error: tx:${tx.uid} failed to convert arbTxAmountDec to number: cannot continue`;
			bot.logger.error({ tx, arbTxAmountDec }, msg);
			console.error(msg);
			return;
		}

		const runtimeId = ulid();

		// update tx trade history entry to prevent duplicate arb txs
		bot.store.setState((state) => {
			const tradeHistoryEntry = state.tradeHistory[tx.uid];
			if (tradeHistoryEntry) {
				state.tradeHistory[tx.uid] = {
					...tradeHistoryEntry,
					arbAccAmount: arbTxAmount.number,
					arbAccRuntimeId: runtimeId,
				};
			}
		});

		// calculate arb tx routes

		const arbTxRoutes = await bot.aggregators[0].computeRoutes({
			inToken: tx.outTokenAddress,
			outToken: ARB_PROTOCOL_MINT,
			amount: arbTxAmount.bigint,
			runtimeId,
			slippage: 1,
		});

		if (!arbTxRoutes.success || !arbTxRoutes.routes[0]) {
			const msg = `listeners:onTxSuccess:error tx:${runtimeId} failed to compute routes: cannot continue`;
			bot.logger.error({ tx }, msg);
			console.error(msg);
			return;
		}

		// send tx
		bot.logger.debug(
			{
				tx,
				arbTxRoutes: arbTxRoutes.routes[0],
			},
			`listeners:onTxSuccess:sendingTx tx:${runtimeId} sending ARB ACC tx`
		);

		const expectedOutAmount = thingToMulti.fromBlockchainValue(
			arbTxRoutes.routes[0].amountOut,
			6
		);

		if (!expectedOutAmount) {
			const msg = `listeners:onTxSuccess:error tx:${runtimeId} failed to convert expectedOutAmount to Multi: cannot continue`;
			bot.logger.error({ tx }, msg);
			console.error(msg);
			return;
		}

		if (expectedOutAmount.uiValue.number < 10) {
			const msg = `listeners:onTxSuccess:error tx:${runtimeId} expectedOutAmount is less than 10: likely going to fail`;
			bot.logger.warn({ tx }, msg);
		}

		const txResult = await bot.aggregators[0].execute(
			{
				inToken: tx.outTokenAddress,
				outToken: ARB_PROTOCOL_MINT,
				amount: arbTxAmount.bigint,
				runtimeId,
				slippage: 1,
				calculateProfit: () => {
					// TODO: calculate profit arb fee here eg. -0.05%
					const profitZero = thingToMulti.fromBlockchainValue(0, 6);

					return {
						profit: profitZero,
						profitPercent: profitZero?.uiValue.number,
					};
				},
			},
			{
				_internalRequest: true,
				_isArbAccTx: true,
			}
		);

		bot.logger.debug(
			{
				txResult,
			},
			`listeners:onTxSuccess:txSent tx:${runtimeId} ARB ACC tx sent`
		);
		// add arb tx to trade history entry // TODO: maybe show arb tx in the trade table as gradient entry?
		// update tx trade history entry
	}

	bot.logger.info("listeners:onTxSuccess:end");
};
