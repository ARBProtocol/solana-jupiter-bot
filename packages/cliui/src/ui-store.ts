import { createCustomStore } from "@arb-protocol/core";

type Screen = "main" | "config" | "wallet";

interface UIState {
	isUpdating: boolean;
	updatesCount: number;
	maxFps?: number;
	lastUpdateTimestamp?: number;
	currentScreen: Screen;
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
	currentScreen: "main" as Screen,
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
