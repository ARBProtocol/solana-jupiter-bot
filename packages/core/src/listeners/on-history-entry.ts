import { PublicBot } from "src/bot";
import { writeJsonToTempDir } from "src/utils";
import { onTxSuccess } from "./on-tx-success";

const handleHistoryUpdate = async (bot: PublicBot) => {
	bot.logger.info("history:newEntry called!");
	const tradeHistory = Object.values(bot.store.getState().tradeHistory);

	// store history in temp TODO: make this configurable
	writeJsonToTempDir("history", tradeHistory);

	const pendingTransactions = tradeHistory.filter(
		(trade) => trade.status === "pending"
	);
	const failedTransactions = tradeHistory.filter(
		(trade) => trade.status === "error" || trade.status === "unknown"
	);

	const successfulTransactions = tradeHistory.filter(
		(trade) => trade.status === "success"
	);

	// run onTxSuccess
	if (successfulTransactions.length > 0) {
		onTxSuccess(bot, successfulTransactions);
	}

	let totalProfitPercent = 0;

	for (const tx of successfulTransactions) {
		if (!tx.txId) {
			// If txId is undefined, it means that the transaction has not been sent yet
			// TODO: add logger
			return;
		}

		if (tx.profitPercent) {
			totalProfitPercent += tx.profitPercent;
		}
	}

	/**
	 * Add timer that will check if some transactions are stuck in pending state
	 * // TODO: make timeouts configurable
	 * // TODO: handle advanced scenarios (What to do if transaction is stuck in pending state for more than 120 seconds? Maybe check the wallet and try to sync bot state with blockchain?)
	 */
	const stuckTransactionWatcher = () => {
		const tradeHistory = Object.values(bot.store.getState().tradeHistory);

		const maybeStuckTransactions = tradeHistory.filter(
			(trade) =>
				trade.status === "pending" &&
				trade?.createdAt &&
				Date.now() - trade.createdAt >= 1000 * 90 // 90 seconds timeout
		);
		const stuckTransactions = tradeHistory.filter(
			(trade) =>
				trade.status === "pending" &&
				trade?.createdAt &&
				Date.now() - trade.createdAt >= 1000 * 120 // 120 seconds timeout
		);

		if (maybeStuckTransactions.length > 0) {
			bot.logger.warn(
				`There are ${maybeStuckTransactions.length} transactions stuck in pending state for more than 90 seconds.`
			);

			if (stuckTransactions.length > 0) {
				bot.logger.error(
					`There are ${stuckTransactions.length} transactions stuck in pending state for more than 120 seconds. This can lead to unexpected behavior. Shutting down the bot...`
				);

				bot.setStatus("!shutdown");
			}

			setTimeout(stuckTransactionWatcher, 1000 * 30);
		}
	};
	setTimeout(stuckTransactionWatcher, 1000 * 90);

	// for (const tx of pendingTransactions) {
	// 	console.log("pending trade", tx);

	// 	const { txId, profitPercent } = tx;

	// TODO: figure out how to get txInfo from data providers
	// const walletAddress = bot.store.getState().wallets[0]?.address;

	// if (!walletAddress) {
	// 	throw new Error("onHistoryEntry: walletAddress is undefined");
	// }

	// if (!bot.dataProviders[0]) {
	// 	throw new Error("onHistoryEntry: dataProviders[0] is undefined");
	// }

	// if (!inTokenAddress || !outTokenAddress) {
	// 	throw new Error(
	// 		"onHistoryEntry: inTokenAddress or outTokenAddress is undefined"
	// 	);
	// }

	// // TODO: get tx from BLockchainDataProvider if there is no outAmount and txId is defined
	// const txInfo = await bot.dataProviders[0]?.getTransactionInfo({
	// 	txId,
	// 	walletAddress,
	// 	inTokenMint: inTokenAddress,
	// 	outTokenMint: outTokenAddress,
	// });
	// }

	bot.store.setState((state) => {
		// update total profit percent
		state.strategies.current.profitPercent = totalProfitPercent;

		// update tx counters
		state.strategies.current.txCount.success = successfulTransactions.length;
		state.strategies.current.txCount.failed = failedTransactions.length;
		state.strategies.current.txCount.pending = pendingTransactions.length;
		state.strategies.current.txCount.total = tradeHistory.length;
	});
};

export const onHistoryEntry = (bot: PublicBot) => {
	bot.logger.info("listeners:loading:onHistoryEntry");

	bot.onStatusChange("history:newEntry", () => handleHistoryUpdate(bot));
	bot.onStatusChange("history:successfulTx", () => handleHistoryUpdate(bot));
	bot.onStatusChange("history:failedTx", () => handleHistoryUpdate(bot));
};
