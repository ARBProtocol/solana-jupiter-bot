import { createCustomStore } from "@arb-protocol/core";

export type UIScreen = "main" | "config" | "wallet" | "logs" | "mini";

interface UIState {
	isUpdating: boolean;
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
	updatesCount: 0,
	maxFps: 24,
	lastUpdateTimestamp: 0,
	currentScreen: "main",
	tradeHistoryTable: {
		cursor: {
			x: 0,
			y: 0,
			active: true,
		},
	},
	lastOutput: "",
};

export const uiStore = createCustomStore(uiState);
