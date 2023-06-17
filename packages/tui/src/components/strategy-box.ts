import { GlobalState } from "@arb-protocol/core";
import boxen from "../lib/boxen";
import { Bot } from "../core";
import chalk from "chalk";
import gradient from "gradient-string";
import { uiStore } from "src/ui-store";

// arrows animation
const ARROWS_FRAMES = ["> > >", " > > "];
const GRADIENT = ["#ef8bce", "#8968f7"];

let step = 0;

const formatTrailingZeros = (string?: string) => {
	if (!string) return "";
	const match = string.match(/^(.*[^0])(0+)$/);

	let result = string;
	if (match) {
		const [_, prefix, suffix] = match;
		result = `${prefix}${suffix ? "".padEnd(suffix.length, " ") : ""}`;
	}
	return result;
};

export const StrategyBox = (bot: Bot, state: GlobalState) => {
	const uiState = uiStore.getState();

	// arrows animation
	step === 0 ? (step = 1) : (step = 0);
	let output = "";
	if (state.strategies.current.outToken?.symbol && state.strategies.current.inToken?.symbol) {
		output +=
			" " + (uiState.enableIncognitoMode ? "###" : state.strategies.current.inToken?.symbol) + "  ";
		output += gradient(GRADIENT)(ARROWS_FRAMES[step]);
		output +=
			"  " + (uiState.enableIncognitoMode ? "###" : state.strategies.current.outToken?.symbol);
	}

	const autoSlippage = state.strategies.current.autoSlippageEnabled;
	if (autoSlippage) {
		output += ` ·Slippage: auto`;
	} else {
		output += ` ·Slippage: ${
			state.strategies.current.slippage ? state.strategies.current.slippage / 100 + " %" : ""
		}`;
	}

	if (state.strategies.current.priorityFeeMicroLamports) {
		output += `    ·P.FEE: ${state.strategies.current.priorityFeeMicroLamports} µL`;
	}

	output += `\n\nIN AMOUNT:    ${formatTrailingZeros(
		state.strategies.current.inAmount?.uiValue.decimal.toFixed(8)
	)}`;

	output += `\nEXPECTED OUT: ${formatTrailingZeros(
		state.strategies.current.outAmount?.uiValue.decimal.toFixed(8)
	)} ${state.strategies.current.expectedProfitPercent.value.toFixed(8) || ""} %\n`;

	if (state.strategies.current.desiredProfitPercentPerTx) {
		output += `\nDESIRED PROFIT: ${state.strategies.current.desiredProfitPercentPerTx} % /tx\n`;
	}

	output += `\n${chalk.bold("TX STATS")}\n`;
	output += `·Success: ${state.strategies.current.txCount.success}   ·Failed: ${
		state.strategies.current.txCount.failed
	}\n·Total: ${state.strategies.current.txCount.total}     ·Success Rate ${
		state.strategies.current.txCount.total > 0
			? Math.floor(
					(state.strategies.current.txCount.success / state.strategies.current.txCount.total) * 100
			  )
			: 0
	} % \n\n`;
	// Profit
	const unrealizedPP = state.strategies.current.unrealizedProfitPercent || 0;
	const pp = unrealizedPP > 0 ? 0 : state.strategies.current.profitPercent || 0;
	const ppBgColor = pp > 0 ? "bgGreen" : pp < 0 ? "bgRed" : "bgBlack";
	const ppColor = pp > 0 ? "black" : pp < 0 ? "white" : "white";
	output += `·Profit %: ${chalk[ppBgColor][ppColor](pp?.toFixed(8))} ${chalk.dim(
		unrealizedPP.toFixed(8) + " | "
	)}`;

	if (bot.strategies[0]?.uiHook?.value) {
		output += bot.strategies[0].uiHook.value;
	}

	return boxen(output, {
		title: `Strategy · ${state.strategies.current.name} ·`,
		titleAlignment: "left",
		padding: 1,
		float: "left",
		borderStyle: "round",
		width: 70,
		height: 16,
	});
};
