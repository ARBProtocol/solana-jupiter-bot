import boxen from "boxen";
import cliui from "cliui";
import open from "open";

import { Chart } from "./components";
import { Bot, GlobalState } from "./core";
import { createKeyboardListener } from "./hotkeys/hotkeys";
import { uiStore } from "./uiStore";
import { updateUI } from "./updateUI";

// Keyboard Listener
const keyboard = createKeyboardListener();

const refreshUI = (state: GlobalState, ui: UI, allowClearConsole: boolean) => {
	const { ui: newUI, uiOutput } = updateUI(ui, state);
	const lastOutput = uiStore.getState().lastOutput;
	ui = newUI;
	if (uiOutput !== lastOutput) {
		uiStore.setState((uiState) => {
			uiState.lastOutput = uiOutput;
		});
		if (allowClearConsole) console.clear();
		console.log(uiOutput);
		console.count("UI Render");
	}
	return ui;
};

export type UI = ReturnType<typeof cliui>;

// const BotStatus = (ui: UI, state: GlobalState) => {
// 	ui.div({
// 		text: `Bot Status: ${state.bot.status}`,
// 		padding: [1, 0, 0, 0],
// 		width: 120,
// 	});
// 	return ui;
// };

export const potentialProfitChart = (ui: UI, state: GlobalState) => {
	const potentialProfit = state.chart.potentialProfit.values.at(-1);
	const chartContainer = boxen(Chart(state, ["potentialProfit"]), {
		title: `Potential Profit ${potentialProfit ? "~ " + potentialProfit.toFixed(12) : ""}`,
		titleAlignment: "left",
		borderStyle: "round",
		borderColor: "green",
	});
	ui.div({
		text: chartContainer,
		padding: [0, 0, 0, 0],
	});

	return ui;
};

const startStateSubscription = (ui: UI, store: Bot["store"], allowClearConsole: boolean) => {
	keyboard.onKeyPress("m", () => {
		uiStore.setState((uiState) => {
			uiState.currentScreen = "main";
		});
		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});
	keyboard.onKeyPress("c", () => {
		uiStore.setState((uiState) => {
			uiState.currentScreen = "config";
		});
		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});
	keyboard.onKeyPress("w", () => {
		uiStore.setState((uiState) => {
			uiState.currentScreen = "wallet";
		});
		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});

	// table navigation
	keyboard.onKeyPress("up", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y -= uiState.tradeHistoryTable.cursor.y > 0 ? 1 : 0;
		});
		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});
	keyboard.onKeyPress("down", () => {
		const state = store.getState();
		const entriesCount = Object.keys(state.tradeHistory).length;

		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y +=
				uiState.tradeHistoryTable.cursor.y < entriesCount - 1 ? 1 : 0;
		});
		ui = refreshUI(state, ui, allowClearConsole);
	});
	keyboard.onKeyPress("left", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x -= uiState.tradeHistoryTable.cursor.x > 0 ? 1 : 0;
		});

		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});
	keyboard.onKeyPress("right", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x += uiState.tradeHistoryTable.cursor.x < 7 ? 1 : 0;
		});
		const state = store.getState();
		ui = refreshUI(state, ui, allowClearConsole);
	});

	// uiStore.subscribe((state) => state, 		(state) => {
	// 	const { ui: newUI, uiOutput } = updateUI(ui, state);
	// 	ui = newUI;
	// 	if (uiOutput !== uiPrevOutput) {
	// 		uiPrevOutput = uiOutput;
	// 		if (allowClearConsole) console.clear();
	// 		console.log(uiOutput);
	// 	}
	// }
	// );

	store.subscribe(
		(state) => state,
		(state) => {
			ui = refreshUI(state, ui, allowClearConsole);
		}
	);
};

interface Config {
	allowClearConsole?: boolean;
}

export const startCLIUI = (bot: Bot, { allowClearConsole = true }: Config = {}) => {
	const ui = cliui({ width: 140 });

	keyboard.onKeyPress("u", () => console.log("You pressed u, test ok!"));
	keyboard.onKeyPress("ctrl+o", () => console.log("You pressed ctrl+o, test ok!"));

	// [e] - execute swap
	keyboard.onKeyPress("ctrl+e", () => bot.swap());

	keyboard.onKeyPress("ctrl+s", () => {
		// log current wallet address
		const walletAddress = bot.store.getState().wallet.address;
		const solscanUrl = `https://solscan.io/address/${walletAddress}`;

		open(solscanUrl);
	});

	startStateSubscription(ui, bot.store, allowClearConsole);

	return {
		onKeyPress: keyboard.onKeyPress,
	};
};