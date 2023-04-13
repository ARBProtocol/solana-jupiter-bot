import boxen from "boxen";
import cliui from "cliui";
import open from "open";

import { Chart } from "./components";
import { Bot, GlobalState } from "./core";
import { createKeyboardListener } from "./hotkeys/hotkeys";
import { UIScreen, uiStore } from "./ui-store";
import { updateUI } from "./update-ui";

// Keyboard Listener
const keyboard = createKeyboardListener();

const refreshUI = (store: Bot["store"], ui: UI, allowClearConsole: boolean) => {
	const state = store.getState();
	const { ui: newUI, uiOutput } = updateUI(ui, state);
	// const lastOutput = uiStore.getState().lastOutput;
	ui = newUI;
	// subscribe version
	// if (uiOutput !== lastOutput) {
	// 	uiStore.setState((uiState) => {
	// 		uiState.lastOutput = uiOutput;
	// 	});
	// 	if (allowClearConsole) console.clear();
	// 	console.log(uiOutput);
	// }

	// 24 FPS version
	// uiStore.setState((uiState) => {
	// 	uiState.lastOutput = uiOutput;
	// });
	const currentScreen = uiStore.getState().currentScreen;
	if (allowClearConsole && currentScreen !== "mini") console.clear();
	console.log(uiOutput);

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

export const potentialProfitChart = (state: GlobalState) => {
	const potentialProfit = state.chart.potentialProfit.values.at(-1);
	const chartContainer = boxen(
		Chart({
			state,
			chartKeys: ["potentialProfit"],
			height: 6,
		}),
		{
			title: `Potential Profit ${
				typeof potentialProfit === "number" ? "~ " + potentialProfit.toFixed(12) : ""
			}`,
			titleAlignment: "right",
			borderStyle: "round",
			borderColor: potentialProfit ? (potentialProfit > 0 ? "green" : "red") : "gray",
		}
	);
	return {
		text: chartContainer,
		padding: [0, 0, 0, 0],
	};
};

export const priceChart = (state: GlobalState) => {
	const price = state.bot.price.current.decimal.toNumber();
	const prevPrice = state.chart.price.values.at(-2) || 0;
	const chartContainer = boxen(
		Chart({
			state,
			chartKeys: ["price"],
			height: 8,
		}),
		{
			title: `Price ${price.toFixed(12)}`,
			titleAlignment: "right",
			borderStyle: "round",
			borderColor: price > prevPrice ? "green" : price < prevPrice ? "red" : "gray",
		}
	);
	return {
		text: chartContainer,
		padding: [0, 0, 0, 0],
	};
};

const setCurrentScreen = ({
	screenKey,
	ui,
	store,
	allowClearConsole,
}: {
	screenKey: UIScreen;
	ui: UI;
	store: Bot["store"];
	allowClearConsole: boolean;
}) => {
	uiStore.setState((uiState) => {
		uiState.currentScreen = screenKey;
	});
	refreshUI(store, ui, allowClearConsole);
};

const startStateSubscription = (ui: UI, store: Bot["store"], allowClearConsole: boolean) => {
	// screens management
	keyboard.onKeyPress("m", () => {
		const currentScreen = uiStore.getState().currentScreen;
		if (currentScreen === "main") {
			setCurrentScreen({ screenKey: "mini", ui, store, allowClearConsole });
		} else {
			setCurrentScreen({ screenKey: "main", ui, store, allowClearConsole });
		}
	});

	keyboard.onKeyPress("c", () =>
		setCurrentScreen({ screenKey: "config", ui, store, allowClearConsole })
	);

	keyboard.onKeyPress("w", () =>
		setCurrentScreen({ screenKey: "wallet", ui, store, allowClearConsole })
	);

	keyboard.onKeyPress("l", () =>
		setCurrentScreen({ screenKey: "logs", ui, store, allowClearConsole })
	);

	// table navigation
	keyboard.onKeyPress("up", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y -= uiState.tradeHistoryTable.cursor.y > 0 ? 1 : 0;
		});

		refreshUI(store, ui, allowClearConsole);
	});
	keyboard.onKeyPress("down", () => {
		const entriesCount = Object.keys(store.getState().tradeHistory).length;

		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y +=
				uiState.tradeHistoryTable.cursor.y < entriesCount - 1 ? 1 : 0;
		});
		refreshUI(store, ui, allowClearConsole);
	});
	keyboard.onKeyPress("left", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x -= uiState.tradeHistoryTable.cursor.x > 0 ? 1 : 0;
		});

		refreshUI(store, ui, allowClearConsole);
	});
	keyboard.onKeyPress("right", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x += uiState.tradeHistoryTable.cursor.x < 7 ? 1 : 0;
		});

		refreshUI(store, ui, allowClearConsole);
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

	// subscribe version
	// store.subscribe(
	// 	(state) => state,
	// 	(state) => {
	// 		ui = refreshUI(store, ui, allowClearConsole);
	// 	}
	// );

	// 24 FPS version
	setInterval(() => refreshUI(store, ui, allowClearConsole), 1000 / 12);
};

interface Config {
	allowClearConsole?: boolean;
}

export const startCLIUI = (bot: Bot, { allowClearConsole = true }: Config = {}) => {
	const ui = cliui({ width: 140 });

	keyboard.onKeyPress("ctrl+e", () => bot.swap());

	keyboard.onKeyPress("ctrl+s", () => {
		const walletAddress = bot.store.getState().wallet.address;
		const solscanUrl = `https://solscan.io/address/${walletAddress}`;

		open(solscanUrl);
	});

	startStateSubscription(ui, bot.store, allowClearConsole);

	return {
		onKeyPress: keyboard.onKeyPress,
	};
};
