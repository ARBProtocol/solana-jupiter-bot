import { GlobalState } from "@arb-protocol/core";
import chalk from "chalk";
import boxen from "src/lib/boxen";
import { MicroBarChart } from "./micro-bar-chart";

const MICRO_CHART_GRADIENT = ["#000000", "#ef8bce", "#8968f7", "#8968f7", "#000000"];

export const StatusBox = (state: GlobalState) => {
	let output = "";
	output += chalk.dim(`${state.status.value}`) + "\n";

	// computed routes chart
	const computedRoutesPerMinute = state.chart.computedRoutesPerSecond.values.reduce(
		(acc, curr) => acc + curr,
		0
	);

	output +=
		"\n" + chalk.bold("COMPUTED ROUTES") + chalk.dim(` | ${computedRoutesPerMinute}/min`) + "\n";
	output +=
		MicroBarChart(state.chart.computedRoutesPerSecond.values.slice(-45), MICRO_CHART_GRADIENT) +
		"\n";

	// route computation latency chart
	const nonZeroLatencyValues = state.chart.computeRoutesLatency.values.filter((v) => v > 0);
	const latencyAvg =
		nonZeroLatencyValues.reduce((acc, curr) => acc + curr, 0) / nonZeroLatencyValues.length;

	const renderLatencyAvg = latencyAvg > 0 ? chalk.dim(` | ${latencyAvg.toFixed()} ms/avg`) : "";

	output += "\n" + chalk.bold("ROUTE COMP. LATENCY") + renderLatencyAvg + "\n";
	output +=
		MicroBarChart(state.chart.computeRoutesLatency.values.slice(-45), MICRO_CHART_GRADIENT) + "\n";

	// Limiters status
	output += "\n" + chalk.bold("LIMITERS") + "\n";

	if (state.limiters.transactions.pending.enabled) {
		const isActive = state.limiters.transactions.pending.active;
		output += `${isActive ? chalk.red("▌") : chalk.hex("#A48BF9")("▌")}Pending Transactions: ${
			state.stats.global.transactions.pending.value
		} /${state.limiters.transactions.pending.max}${chalk.dim("tx")}       ${
			isActive ? chalk.bgHex("#A48BF9").bold(" ACTIVE ") : ""
		}\n`;
	}

	if (state.limiters.transactions.executionRate.enabled) {
		const isActive = state.limiters.transactions.executionRate.active;

		output += `${isActive ? chalk.red("▌") : chalk.hex("#ef8bce")("▌")}Execution Rate: ${
			state.limiters.transactions.executionRate.current
		} /${state.limiters.transactions.executionRate.max}${chalk.dim("tx")} ~ ${chalk.dim(
			(state.limiters.transactions.executionRate.timeWindowMs / 1000).toString() + "s"
		)}       ${isActive ? chalk.bgHex("#ef8bce").bold(" ACTIVE ") : ""}\n`;
	}

	if (state.limiters.iterationsRate.enabled) {
		const isActive = state.limiters.iterationsRate.active;
		output += `${isActive ? chalk.red("▌") : chalk.hex("#8968f7")("▌")}Iterations Rate: ${
			state.limiters.iterationsRate.current
		} /${state.limiters.iterationsRate.max}${chalk.dim("i")} ~ ${chalk.dim(
			(state.limiters.iterationsRate.timeWindowMs / 1000).toString() + "s"
		)}        ${isActive ? chalk.bgHex("#8968f7").bold(" ACTIVE ") : ""}\n`;
	}

	const box = boxen(output, {
		title: "Status",
		titleAlignment: "left",
		padding: 1,
		float: "left",
		borderStyle: "round",
		width: 60,
		height: 16,
	});
	return box;
};
