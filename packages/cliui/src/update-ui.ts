import { GlobalState } from "./core";
import { TradeHistoryTable } from "./components/trade-history-table";
import { uiStore } from "./ui-store";
import { UI, potentialProfitChart, priceChart } from "./cliui";
import { InfoBox } from "./Info-box";
import chalk from "chalk";

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
	ui.div(
		`current screen: ${currentScreen} | press "c" to switch to config screen | press "w" to switch to wallet screen`
	);

	switch (currentScreen) {
		case "main":
			// ui = BotStatus(ui, state);
			ui.div(InfoBox(state));
			ui.div(priceChart(state));
			ui.div(potentialProfitChart(state));
			ui.div(TradeHistoryTable(state));
			ui.div(chalk.dim("FPS ~ " + fps.toFixed(2) + " / " + maxFps));
			break;
		case "config":
			ui.div({
				text: "Config",
				padding: [1, 0, 0, 0],
				width: 120,
			});
			break;
		case "wallet":
			ui.div({
				text: "Wallet",
				padding: [1, 0, 0, 0],
				width: 120,
			});
			ui.div(state.wallet.address || "There is no wallet address in the state");
			break;
	}

	uiStore.setState((uiState) => {
		uiState.isUpdating = false;
	});

	const uiOutput = ui.toString();
	return { ui, uiOutput };
};
