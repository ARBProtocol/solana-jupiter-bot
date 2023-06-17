import boxen from "./lib/boxen";
import cliui from "cliui";
import open from "open";

import { Bot, GlobalState, GlobalStore } from "./core";
import { createKeyboardListener } from "./hotkeys/hotkeys";
import { UIScreen, uiStore } from "./ui-store";
import { updateUI } from "./update-ui";
import { Chart } from "./components/chart";
import { miniMode } from "./mini-mode";
import chalk from "chalk";

// Keyboard Listener
const keyboard = createKeyboardListener();

const render = (bot: Bot, store: GlobalStore, ui: UI) => {
	const state = store.getState();
	const { ui: newUI, uiOutput } = updateUI(bot, ui, state);
	ui = newUI;

	const uiState = uiStore.getState();

	if (uiState.allowClearConsole && uiState.currentScreen !== "mini") console.clear();
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
}: {
	bot: Bot;
	screenKey: UIScreen;
	ui: UI;
	store: GlobalStore;
}) => {
	uiStore.setState((uiState) => {
		uiState.currentScreen = screenKey;
	});
	render(bot, store, ui);
};

const startStateSubscription = (bot: Bot, ui: UI, store: GlobalStore, fps: number) => {
	// screens management
	keyboard.onKeyPress("m", () => {
		const currentScreen = uiStore.getState().currentScreen;
		if (currentScreen === "main") {
			setCurrentScreen({ bot, screenKey: "mini", ui, store });

			uiStore.setState((uiState) => {
				// disable allowClearConsole
				uiState.allowClearConsole = false;
				// disable screen rotation
				uiState.enableScreenRotator = false;
			});

			console.log();
			console.log("Entering mini mode. Press 'm' to exit.");
			console.log();
			console.log(chalk.hex("#00c4fd")("WARNING: THIS IS EXPERIMENTAL FEATURE! WIP!"));
			console.log();
		} else {
			setCurrentScreen({ bot, screenKey: "main", ui, store });

			uiStore.setState((uiState) => {
				// enable allowClearConsole
				uiState.allowClearConsole = true;
				// enable screen rotation
				uiState.enableScreenRotator = true;
			});
			console.log("Exiting mini mode.");
		}
	});

	keyboard.onKeyPress("c", () => setCurrentScreen({ bot, screenKey: "config", ui, store }));

	keyboard.onKeyPress("w", () => setCurrentScreen({ bot, screenKey: "wallet", ui, store }));

	keyboard.onKeyPress("l", () => setCurrentScreen({ bot, screenKey: "logs", ui, store }));

	keyboard.onKeyPress("i", () => {
		//toggle incognito mode
		uiStore.setState((uiState) => {
			uiState.enableIncognitoMode = !uiState.enableIncognitoMode;
		});
	});

	// table navigation
	keyboard.onKeyPress("up", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.y -= uiState.tradeHistoryTable.cursor.y > 0 ? 1 : 0;
		});

		render(bot, store, ui);
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

		render(bot, store, ui);
	});
	keyboard.onKeyPress("right", () => {
		uiStore.setState((uiState) => {
			uiState.tradeHistoryTable.cursor.x += uiState.tradeHistoryTable.cursor.x < 7 ? 1 : 0;
		});

		render(bot, store, ui);
	});

	// should reset event
	keyboard.onKeyPress("r", () => {
		bot.store.setState((s) => {
			s.status.value = "strategy:shouldReset";
			s.status.updatedAt = performance.now();
		});
	});

	// TODO: refresh UI when users changes focus with keyboard

	// init screen rotator
	screenRotator({ bot, ui, store });

	// init subscribers for mini mode
	miniMode(store);

	// prevent clearing console on shutdown request
	bot.store.subscribe(
		(s) => s.status.value,
		(status) => {
			if (status === "!shutdown") {
				uiStore.setState((uiState) => {
					uiState.allowClearConsole = false;
				});
			}
		}
	);

	// render loop
	setInterval(() => {
		if (uiStore.getState().currentScreen !== "mini") {
			render(bot, store, ui);
		}
	}, 1000 / fps);
};

interface Config {
	allowClearConsole?: boolean;
	fps?: number;
	tradeHistoryMaxRows?: number;
}

const screenRotator = ({ bot, ui, store }: { bot: Bot; ui: UI; store: GlobalStore }) => {
	let interval: NodeJS.Timeout;

	const rotateMain = () => {
		interval = setInterval(() => {
			const state = uiStore.getState();

			if (!state.enableScreenRotator) return;

			const currentScreen = state.currentScreen;
			if (currentScreen === "main") {
				setCurrentScreen({ bot, screenKey: "main:agg", ui, store });
			}
			if (currentScreen === "main:agg") {
				setCurrentScreen({ bot, screenKey: "main", ui, store });
			}
		}, 1000 * 5);
	};

	rotateMain();
};

export const startTUI = (
	bot: Bot,
	{ allowClearConsole = true, fps = 10, tradeHistoryMaxRows }: Config = {}
) => {
	let ui;
	try {
		if (fps > 14) {
			const msg = "FPS cannot be higher than 14, this is useless and can cause performance issues.";
			console.error(msg);
			bot.logger.error(msg);
			process.exit(1);
		}

		uiStore.setState((uiState) => {
			uiState.allowClearConsole = allowClearConsole;
			if (tradeHistoryMaxRows) uiState.tradeHistoryTable.maxRows = tradeHistoryMaxRows;
		});

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
		});

		// toggle charts
		keyboard.onKeyPress("t", () => {
			uiStore.setState((us) => {
				if (us.showExpectedProfitChart && us.showPriceChart) {
					us.showPriceChart = false;
					return;
				}

				if (us.showExpectedProfitChart && !us.showPriceChart) {
					us.showExpectedProfitChart = false;
					us.showPriceChart = true;
					return;
				}

				if (!us.showExpectedProfitChart && us.showPriceChart) {
					us.showExpectedProfitChart = false;
					us.showPriceChart = false;
					return;
				}

				if (!us.showExpectedProfitChart && !us.showPriceChart) {
					us.showPriceChart = true;
					us.showExpectedProfitChart = true;
					return;
				}
			});
		});

		startStateSubscription(bot, ui, bot.store, fps);
	} catch (error) {
		console.log(`Error initializing UI: `, error);
		throw error;
	}

	keyboard.onKeyPress("ctrl+e", () => bot.setStatus("execute:recentRoute"));

	return {
		onKeyPress: keyboard.onKeyPress,
	};
};
