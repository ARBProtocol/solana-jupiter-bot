import { GlobalState } from "./core";
import { TradeHistoryTable } from "./components/trade-history-table";
import { uiStore } from "./ui-store";
import { UI, potentialProfitChart, priceChart } from "./cliui";
import { InfoBox } from "./components/Info-box";
import chalk from "chalk";
import { TopBar } from "./components/top-bar";
import { miniMode } from "./mini-mode";
import { StatusBox } from "./components/status-box";

// Combine 2 side by side (it will be used for 2x InfoBox)
const DoubleColumn = (column1: string, column2: string) => {
	const column1Lines = column1.split("\n");
	const column2Lines = column2.split("\n");
	const linesCount = Math.max(column1Lines.length, column2Lines.length);
	const column1Width = column1Lines.reduce((max, line) => Math.max(max, line.length), 0);
	const column2Width = column2Lines.reduce((max, line) => Math.max(max, line.length), 0);
	const result = [];
	for (let i = 0; i < linesCount; i++) {
		const line1 = column1Lines[i] || "";
		const line2 = column2Lines[i] || "";
		result.push(line1.padEnd(column1Width) + "  " + line2.padStart(column2Width));
	}
	return result.join("\n");
};

export const updateUI = (
	ui: UI,
	state: GlobalState
): {
	ui: UI;
	uiOutput: string;
} => {
	const { isUpdating, maxFps, lastUpdateTimestamp } = uiStore.getState();

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

	switch (currentScreen) {
		case "main":
			ui.div(TopBar({ currentScreen }));
			ui.div("");
			ui.div(DoubleColumn(StatusBox(state), InfoBox(state)));
			ui.div(priceChart(state));
			ui.div(potentialProfitChart(state));
			ui.div(TradeHistoryTable(state));
			ui.div(chalk.dim("FPS ~ " + fps.toFixed(2) + " / " + maxFps));
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
			ui.div(state.wallet.address || "There is no wallet address in the state");
			break;
		case "mini":
			ui.div(miniMode(state));
		// case "logs":
		// TODO: maybe Pino logs (separate thread)
	}

	uiStore.setState((uiState) => {
		uiState.isUpdating = false;
	});

	const uiOutput = ui.toString();

	return { ui, uiOutput };
};
