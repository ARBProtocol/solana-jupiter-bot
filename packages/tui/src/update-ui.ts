import { Bot, GlobalState } from "./core";
import { uiStore } from "./ui-store";
import { UI, expectedProfitChart, priceChart } from "./tui";
import chalk from "chalk";
import { TopBar } from "./components/top-bar";
import { StatusBox } from "./components/status-box";
import { StrategyBox } from "./components/strategy-box";
import { TradeHistoryTable } from "./components/trade-history-table";
import stripAnsi from "./lib/strip-ansi";
import { AggregatorBox } from "./components/aggregator-box";
import { version as coreVersion } from "@arb-protocol/core";

const CORE_VERSION = chalk.dim(coreVersion);

const isDevMode = process.env.NODE_ENV !== "production";

const getProcessUptime = (): string => {
	const uptime = process.uptime();
	const days = Math.floor(uptime / 86400);
	const hours = Math.floor((uptime % 86400) / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	const seconds = Math.floor(uptime % 60);
	return `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes
		.toString()
		.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Combine 2 side by side (it will be used for 2x InfoBox)
const DoubleColumn = (column1: string, column2: string) => {
	const column1Lines = column1.split("\n");
	const column2Lines = column2.split("\n");
	const column1StrippedLines = stripAnsi(column1).split("\n");
	const column2StrippedLines = stripAnsi(column2).split("\n");
	const linesCount = Math.max(column1StrippedLines.length, column2StrippedLines.length);
	const column1Width = column1StrippedLines.reduce((max, line) => Math.max(max, line.length), 0);
	const column2Width = column2StrippedLines.reduce((max, line) => Math.max(max, line.length), 0);
	const result = [];
	for (let i = 0; i < linesCount; i++) {
		const line1 = column1Lines[i] || "";
		const line2 = column2Lines[i] || "";
		result.push(line1.padEnd(column1Width) + "  " + line2.padStart(column2Width));
	}
	return result.join("\n");
};

export const updateUI = (
	bot: Bot,
	ui: UI,
	state: GlobalState
): {
	ui: UI;
	uiOutput: string;
} => {
	const { isUpdating, lastUpdateTimestamp } = uiStore.getState();

	if (isUpdating) return { ui, uiOutput: ui.toString() };

	const fps = (lastUpdateTimestamp && 1000 / (performance.now() - lastUpdateTimestamp)) || 0;

	// restrict fps
	// if (maxFps && fps > maxFps) return { ui, uiOutput: ui.toString() };

	uiStore.setState((uiState) => {
		uiState.isUpdating = true;
		uiState.updatesCount++;
		uiState.lastUpdateTimestamp = performance.now();
	});

	const currentScreen = uiStore.getState().currentScreen;
	ui.resetOutput();

	const BottomBar = `${chalk.dim("FPS ~ " + fps.toFixed(0).padEnd(3, " "))}${
		isDevMode ? chalk.red(" DEV MODE") : ""
	} ${
		isDevMode
			? chalk.dim(` USED MEM ~ ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)} MB`)
			: ""
	} ${chalk.dim("UPTIME: " + getProcessUptime().padEnd(100, " "))} ${CORE_VERSION}`;

	const uiState = uiStore.getState();

	// TODO: refactor this (redundancy)
	switch (currentScreen) {
		case "main":
			ui.div("");
			ui.div(TopBar({ currentScreen }));
			ui.div("");
			ui.div(DoubleColumn(StatusBox(state), StrategyBox(bot, state)));
			ui.div("");
			uiState.showPriceChart && ui.div(priceChart(state));
			uiState.showExpectedProfitChart && ui.div(expectedProfitChart(state));
			ui.div(TradeHistoryTable(state));
			ui.div(BottomBar);
			break;
		case "main:agg":
			ui.div("");
			ui.div(TopBar({ currentScreen }));
			ui.div("");
			ui.div(DoubleColumn(StatusBox(state), AggregatorBox(bot, state)));
			ui.div("");
			uiState.showPriceChart && ui.div(priceChart(state));
			uiState.showExpectedProfitChart && ui.div(expectedProfitChart(state));
			ui.div(TradeHistoryTable(state));
			ui.div(BottomBar);
			break;
		case "config":
			ui.div(TopBar({ currentScreen }));
			ui.div({
				text: "Config",
				padding: [1, 0, 0, 0],
				width: 120,
			});
			break;
		case "wallet":
			ui.div(TopBar({ currentScreen }));
			ui.div({
				text: "Wallet",
				padding: [1, 0, 0, 0],
				width: 120,
			});
			ui.div(state.wallets[0]?.address || "Missing wallet address in the state");
			break;
		case "mini":
			break;
		case "logs":
			console.log("logs ui not implemented yet");
			break;
		// TODO: print .log file
	}

	uiStore.setState((uiState) => {
		uiState.isUpdating = false;
	});

	const uiOutput = ui.toString();

	return { ui, uiOutput };
};
