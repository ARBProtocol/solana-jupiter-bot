import { Bot } from "@arb-protocol/core";
import { Bot as T } from "grammy";

const MARKER_CHAR = "▌";
const TELEGRAM_BOT_TOKEN = "GET THIS FROM ENV";
// TODO: get this from env
const eventTitle = (title: string) => {
	return title.padEnd(26, " ");
};

export const TelegramPlugin = <T extends Bot>(bot: T) => ({
	...bot,
	telegram: async () => {
		if (!TELEGRAM_BOT_TOKEN) {
			throw new Error("TELEGRAM_BOT_TOKEN env variable is not set");
		}

		const t = new T(TELEGRAM_BOT_TOKEN);

		let output = "";

		bot.store.subscribe(
			(state) => state.status.value,
			(status) => {
				output = "";
				const state = bot.store.getState();

				if (status === "history:successfulTx") {
					const tradeHistory = Object.values(state.tradeHistory);
					const successfulTransactions = tradeHistory.filter((trade) => trade.status === "success");
					// sort by timestamp
					successfulTransactions.sort((a, b) => b.createdAt - a.createdAt);
					const latestSuccessfulTx = successfulTransactions[0];
					const inTokenSymbol = latestSuccessfulTx?.inTokenSymbol ?? "N/A";
					const outTokenSymbol = latestSuccessfulTx?.outTokenSymbol ?? "N/A";
					const inAmount = latestSuccessfulTx?.inUiAmount?.toFixed(8) ?? "N/A";
					const outAmount = latestSuccessfulTx?.outUiAmount?.toFixed(8) ?? "N/A";
					const unrealizedProfitPercent = latestSuccessfulTx?.unrealizedProfitPercent;
					const profitPercent = latestSuccessfulTx?.profitPercent?.toFixed(8) ?? 0;

					output += eventTitle("Successful transaction");
					output +=
						unrealizedProfitPercent && unrealizedProfitPercent > 0
							? `Unrealized Profit: ${unrealizedProfitPercent} % | `
							: `Profit: ${profitPercent} % | `;
					output += `${inAmount} ${inTokenSymbol} >>> `;
					output += `${outAmount} ${outTokenSymbol}`;

					output = MARKER_CHAR + output;
				}

				if (status === "strategy:stopLossExceeded") {
					output += eventTitle("Stop loss exceeded");
				}

				if (status === "strategy:shouldReset") {
					output += eventTitle("Resetting strategy");
				}

				if (status === "bot:error") {
					output += eventTitle("Bot error");
				}

				if (status === "!shutdown") {
					output += eventTitle("Shutdown");
				}

				output &&
					t.api.sendMessage(1234567890, output).catch((err) => {
						console.error("TelegramPlugin: error sending message: ", err);
					});
			}
		);

		await t.start();
	},
});
