import { GlobalStore } from "@arb-protocol/core";
import { uiStore } from "./ui-store";
import chalk, { Chalk } from "chalk";

const shouldRender = () => {
	const currentScreen = uiStore.getState().currentScreen;
	return currentScreen === "mini";
};

const time = () => {
	return chalk.gray(new Date().toLocaleTimeString()) + " ";
};

const MARKER_CHAR = "▌";

let output;

// fixed width
const eventTitle = (title: string) => {
	return title.padEnd(26, " ");
};

/**
 * Mini mode subscribes to the global state and renders changes to the console.
 */
export const miniMode = (store: GlobalStore) => {
	store.subscribe(
		(s) => s.status.value,
		(status, prev) => {
			if (status === prev) return;
			if (!shouldRender()) return;

			output = "";

			const state = store.getState();

			if (status === "aggregator:computingRoutes") {
				const computedRoutesPerMinute = state.chart.computedRoutesPerSecond.values.reduce(
					(acc, curr) => acc + curr,
					0
				);

				const nonZeroLatencyValues = state.chart.computeRoutesLatency.values.filter((v) => v > 0);
				const latencyAvg =
					nonZeroLatencyValues.reduce((acc, curr) => acc + curr, 0) / nonZeroLatencyValues.length;

				output += eventTitle("Computing routes...");
				output += `${computedRoutesPerMinute.toFixed(0)} routes/min`;
				output += ` | ${latencyAvg.toFixed(0)} ms/avg`;
				output = chalk.dim(output);
				output = chalk.hex("#00c4fd")(MARKER_CHAR) + output;
			}

			if (status === "aggregator:computingRoutesSuccess") {
				const currentStrategy = state.strategies.current;
				const expectedProfitPercent = currentStrategy.expectedProfitPercent;
				const inTokenSymbol = currentStrategy.inToken?.symbol;
				const outTokenSymbol = currentStrategy.outToken?.symbol;
				const inAmount = currentStrategy.inAmount?.uiValue.number;
				const outAmount = currentStrategy.outAmount?.uiValue.number;

				output += eventTitle("Routes received");
				output += `Expected Profit: ${expectedProfitPercent.toFixed(8)} % | `;
				output += `${inAmount?.toFixed(8)} ${inTokenSymbol} >>> `;
				output += `${outAmount?.toFixed(8)} ${outTokenSymbol}`;

				if (expectedProfitPercent > 0) output = chalk.hex("#A48BF9")(output);
				if (expectedProfitPercent <= 0) output = chalk.dim(output);

				output = chalk.hex("#A48BF9")(MARKER_CHAR) + output;
			}

			if (status === "aggregator:computingRoutesError") {
				output += chalk.red(MARKER_CHAR);
				output += "Computing routes error";
			}

			if (status === "aggregator:execute:executing") {
				const currentStrategy = state.strategies.current;
				const expectedProfitPercent = currentStrategy.expectedProfitPercent;
				const inTokenSymbol = currentStrategy.inToken?.symbol;
				const outTokenSymbol = currentStrategy.outToken?.symbol;
				const inAmount = currentStrategy.inAmount?.uiValue.number;
				const outAmount = currentStrategy.outAmount?.uiValue.number;

				output += eventTitle("Executing...");
				output += `Expected Profit: ${expectedProfitPercent.toFixed(8)} % | `;
				output += `${inAmount?.toFixed(8)} ${inTokenSymbol} >>> `;
				output += `${outAmount?.toFixed(8)} ${outTokenSymbol}`;

				output = MARKER_CHAR + output;
				output = chalk.bgHex("#00c4fd")(output);
			}

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
				const unrealizedProfitPercent = latestSuccessfulTx?.unrealizedProfitPercent?.toFixed(8);
				const profitPercent = latestSuccessfulTx?.profitPercent?.toFixed(8) ?? 0;

				output += eventTitle("Successful transaction");
				output += unrealizedProfitPercent
					? `Unrealized Profit: ${unrealizedProfitPercent} % | `
					: `Profit: ${profitPercent} % | `;
				output += `${inAmount} ${inTokenSymbol} >>> `;
				output += `${outAmount} ${outTokenSymbol}`;

				output = MARKER_CHAR + output;

				const color =
					(latestSuccessfulTx?.profitPercent || 0) > 0
						? "#A1D950"
						: (latestSuccessfulTx?.profitPercent || 0) < 0
						? "#FF4D4F"
						: "#00c4fd";

				output = chalk.bgHex(color)(output);
			}

			if (status === "history:failedTx") {
				const tradeHistory = Object.values(state.tradeHistory);
				const failedTransactions = tradeHistory.filter(
					(trade) => trade.status === "error" || trade.status === "unknown"
				);

				// sort by timestamp
				failedTransactions.sort((a, b) => b.createdAt - a.createdAt);
				const latestFailedTx = failedTransactions[0];
				const inTokenSymbol = latestFailedTx?.inTokenSymbol ?? "N/A";
				const outTokenSymbol = latestFailedTx?.outTokenSymbol ?? "N/A";
				const inAmount = latestFailedTx?.inUiAmount?.toFixed(8) ?? "N/A";
				const outAmount = latestFailedTx?.outUiAmount?.toFixed(8) ?? "N/A";
				const error = latestFailedTx?.error ?? "Unknown";

				output += eventTitle("Failed transaction");
				output += `${inAmount} ${inTokenSymbol} >>> `;
				output += `${outAmount} ${outTokenSymbol}`;
				output += ` | ${error}`;

				output = MARKER_CHAR + output;
				output = chalk.bgHex("#ff0000")(output);
			}

			// limiters
			if (status === "limiters:transactions:pending:activated") {
				output += "LIMITER | Pending transactions limit reached";

				output = MARKER_CHAR + output;
				output = chalk.bgHex("#ef8bce")(output);
			}

			// log the output
			if (output.length > 0) {
				output = time() + output;
				console.log(output);
			}
		}
	);
};
// TODO!
