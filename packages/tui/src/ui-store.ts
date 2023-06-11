import { createStore } from "@arb-protocol/core";

export type UIScreen = "main" | "config" | "wallet" | "logs" | "mini" | "main:agg";

interface UIState {
	isUpdating: boolean;
	allowClearConsole: boolean;
	enableScreenRotator: boolean;
	updatesCount: number;
	maxFps?: number;
	lastUpdateTimestamp?: number;
	currentScreen: UIScreen;
	tradeHistoryTable: {
		cursor: {
			x: number;
			y: number;
			active: boolean;
		};
	};
	lastOutput: string;
}

const uiState: UIState = {
	isUpdating: false,
	allowClearConsole: true,
	enableScreenRotator: (process.env.TUI_INITIAL_SCREEN as UIScreen) !== "mini",
	updatesCount: 0,
	maxFps: 24,
	lastUpdateTimestamp: 0,
	currentScreen: (process.env.TUI_INITIAL_SCREEN as UIScreen) || "main",
	tradeHistoryTable: {
		cursor: {
			x: 0,
			y: 0,
			active: true,
		},
	},
	lastOutput: "",
};

export const uiStore = createStore(uiState);
