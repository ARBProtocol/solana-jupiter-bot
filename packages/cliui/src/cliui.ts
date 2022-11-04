import cliui from "cliui";
import { Bot, GlobalState } from "@arb-protocol/core";
import boxen from "boxen";
import { createKeyboardListener } from "./hotkeys/hotkeys";

type UI = ReturnType<typeof cliui>;

export const TextBox = (ui: UI, content: string) => {
	const textBox = boxen(content, {
		title: "Title",
		titleAlignment: "left",
		padding: 1,
		backgroundColor: "blue",
		borderStyle: "round",
		borderColor: "magenta",
	});

	ui.div(textBox);

	return ui;
};

const BotStatus = (ui: UI, state: GlobalState) => {
	ui.div({
		text: `Bot Status: ${state.bot.status}`,
		padding: [1, 0, 0, 0],
		width: 120,
	});
	return ui;
};

const updateUI = (ui: UI, state: GlobalState) => {
	ui.resetOutput();
	ui = BotStatus(ui, state);
	ui = TextBox(ui, ui.toString());
	const uiOutput = ui.toString();
	return { ui, uiOutput };
};

const startStateSubscription = (ui: UI, store: Bot["store"]) => {
	let uiPrevOutput = "";
	store.subscribe(
		(state) => state,
		(state) => {
			const { ui: newUI, uiOutput } = updateUI(ui, state);
			ui = newUI;
			if (uiOutput !== uiPrevOutput) {
				uiPrevOutput = uiOutput;
				// console.clear();
				console.log(uiOutput);
			}
		}
	);
};

export const startCLIUI = (bot: Bot) => {
	const ui = cliui({ width: 140 });

	const keyboard = createKeyboardListener();

	keyboard.onKeyPress("u", () => console.log("You pressed u, test ok!"));
	keyboard.onKeyPress("ctrl+o", () => console.log("You pressed ctrl+o, test ok!"));

	startStateSubscription(ui, bot.store);

	return {
		onKeyPress: keyboard.onKeyPress,
	};
};
