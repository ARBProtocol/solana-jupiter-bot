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
				output += "Computing routes...";
				output += ` | ${computedRoutesPerMinute.toFixed(0)} routes/min`;
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

				output += "Routes received | ";
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

				output += "Executing ... | ";
				output += `Expected Profit: ${expectedProfitPercent.toFixed(8)} % | `;
				output += `${inAmount?.toFixed(8)} ${inTokenSymbol} >>> `;
				output += `${outAmount?.toFixed(8)} ${outTokenSymbol}`;

				output = MARKER_CHAR + output;
				output = chalk.bgHex("#00c4fd")(output);
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
