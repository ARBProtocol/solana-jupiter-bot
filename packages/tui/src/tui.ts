import boxen from "./lib/boxen";
import cliui from "cliui";
import open from "open";

// import { Chart } from "./components";
import { Bot, GlobalState, GlobalStore } from "./core";
import { createKeyboardListener } from "./hotkeys/hotkeys";
import { UIScreen, uiStore } from "./ui-store";
import { updateUI } from "./update-ui";
import { Chart } from "./components/chart";

// Keyboard Listener
const keyboard = createKeyboardListener();

const render = (bot: Bot, store: GlobalStore, ui: UI, allowClearConsole: boolean) => {
	const state = store.getState();
	const { ui: newUI, uiOutput } = updateUI(bot, ui, state);
	ui = newUI;

	const currentScreen = uiStore.getState().currentScreen;
	if (allowClearConsole && currentScreen !== "mini") console.clear();
	console.log(uiOutput);

	return ui;
};

export type UI = ReturnType<typeof cliui>;

export const expectedProfitChart = (state: GlobalState) => {
	const expectedProfitPercent = state.chart.expectedProfitPercent.values.at(-1);
	const chartContainer = boxen(
		Chart({
			state,
			chartKeys: ["expectedProfitPercent"],
			height: 6,
		}),
		{
			title: `Expected Profit ${
				typeof expectedProfitPercent === "number" ? expectedProfitPercent.toFixed(12) : ""
			} %`,
			titleAlignment: "right",
			borderStyle: "round",
			borderColor: expectedProfitPercent ? (expectedProfitPercent > 0 ? "green" : "red") : "gray",
			height: 9,
		}
	);

	return {
		text: chartContainer,
		padding: [0, 0, 0, 0],
	};
};

export const priceChart = (state: GlobalState) => {
	const price = state.strategies.current.price || 0;
	const priceInverted = state.strategies.current.priceInverted || 0;
	const prevPrice = state.chart.price.values.at(-2) || 0;
	const chartContainer = boxen(
		Chart({
			state,
			chartKeys: ["price"],
			height: 8,
		}),
		{
			title: `Price ${price.toFixed(12)}  | ${priceInverted.toFixed(12)}`,
			titleAlignment: "right",
			borderStyle: "round",
			borderColor: price > prevPrice ? "green" : price < prevPrice ? "red" : "gray",
			height: 11,
			textAlignment: "center",
		}
	);
	return {
		text: chartContainer,
		padding: [0, 0, 0, 0],
	};
};

const setCurrentScreen = ({
	bot,
	screenKey,
	ui,
	store,
	allowClearConsole,
}: {
	bot: Bot;
	screenKey: UIScreen;
	ui: UI;
	store: GlobalStore;
	allowClearConsole: boolean;
}) => {
	uiStore.setState((uiState) => {
		uiState.currentScreen = screenKey;
	});
	render(bot, store, ui, allowClearConsole);
};

const startStateSubscription = (
	bot: Bot,
	ui: UI,
	store: GlobalStore,
	allowClearConsole: boolean,
	fps: number
) => {
	// screens management
	keyboard.onKeyPress("m", () => {
		const currentScreen = uiStore.getState().currentScreen;
		if (currentScreen === "main") {
			setCurrentScreen({ bot, screenKey: "mini", ui, store, allowClearConsole });
		} else {
			setCurrentScreen({ bot, screenKey: "main", ui, store, allowClearConsole });
		}
	});

	keyboard.onKeyPress("c", () =>
		setCurrentScreen({ bot, screenKey: "config", ui, store, allowClearConsole })
	);

	keyboard.onKeyPress("w", () =>
		setCurrentScreen({ bot, screenKey: "wallet", ui, store, allowClearConsole })
	);

	keyboard.onKeyPress("l", () =>
		setCurrentScreen({ bot, screenKey: "logs", ui, store, allowClearConsole })
	);

	// table navigation
	keyboard.onKeyPress("up", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y -= uiState.tradeHistoryTable.cursor.y > 0 ? 1 : 0;
		});

		render(bot, store, ui, allowClearConsole);
	});
	// keyboard.onKeyPress("down", () => {
	// 	const entriesCount = Object.keys(store.getState().tradeHistory).length;

	// 	uiStore.setState((uiState) => {
	// 		uiState.tradeHistoryTable.cursor.y +=
	// 			uiState.tradeHistoryTable.cursor.y < entriesCount - 1 ? 1 : 0;
	// 	});
	// 	refreshUI(store, ui, allowClearConsole);
	// });
	keyboard.onKeyPress("left", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x -= uiState.tradeHistoryTable.cursor.x > 0 ? 1 : 0;
		});

		render(bot, store, ui, allowClearConsole);
	});
	keyboard.onKeyPress("right", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x += uiState.tradeHistoryTable.cursor.x < 7 ? 1 : 0;
		});

		render(bot, store, ui, allowClearConsole);
	});

	// TODO: refresh UI when users changes focus with keyboard

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

	setInterval(() => render(bot, store, ui, allowClearConsole), 1000 / fps);
};

interface Config {
	allowClearConsole?: boolean;
	fps?: number;
}

export const startTUI = (bot: Bot, { allowClearConsole = true, fps = 10 }: Config = {}) => {
	let ui;
	try {
		if (fps > 14) {
			const msg = "FPS cannot be higher than 14, this is useless and can cause performance issues.";
			console.error(msg);
			bot.logger.error(msg);
			process.exit(1);
		}

		ui = cliui({ width: 140 });

		keyboard.onKeyPress("ctrl+s", () => {
			const walletAddress = bot.store.getState().wallets[0]?.address;

			// TODO: show error message
			if (!walletAddress) return;

			const solscanUrl = `https://solscan.io/address/${walletAddress}`;
			open(solscanUrl);
		});

		keyboard.onKeyPress("ctrl+c", () => {
			bot.setStatus("bot:stop");
			console.log("Exiting by user request...");
			process.exit(0); // TODO: improve exit UX

			// Emergency exit
			setTimeout(() => {
				process.exit(1);
			}, 15000);
		});

		startStateSubscription(bot, ui, bot.store, allowClearConsole, fps);
	} catch (error) {
		console.log(`Error initializing UI: `, error);
		throw error;
	}

	keyboard.onKeyPress("ctrl+e", () => bot.setStatus("execute:recentRoute"));

	return {
		onKeyPress: keyboard.onKeyPress,
	};
};
