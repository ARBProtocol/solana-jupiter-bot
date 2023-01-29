import readline from "readline";

type KeyRaw = {
	sequence: string;
	name: string;
	ctrl: boolean;
	meta: boolean;
	shift: boolean;
};

type Modifier = "ctrl" | "shift";

type KeyCombo = `${Modifier}+${Key}`;

type AllowedKeys = Key | KeyCombo;

type Callback = () => void;

type Listeners = {
	[key in AllowedKeys]?: Callback;
};

export const createKeyboardListener = () => {
	const listeners: Listeners = {
		"ctrl+c": () => {
			console.log("Exiting by user...");
			process.exit(0);
		},
	};

	// debouncing
	let lastKey: AllowedKeys | null = null;
	let lastKeyTime = performance.now();

	readline.emitKeypressEvents(process.stdin);

	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}

	process.stdin.on("keypress", (_, keyRaw: KeyRaw) => {
		let key = `${keyRaw.ctrl ? "ctrl+" : ""}${keyRaw.name}` as AllowedKeys;
		key = `${keyRaw.shift ? "shift+" : ""}${key}` as AllowedKeys;

		const listener = listeners[key] as Callback;

		if (listener && (key === lastKey ? performance.now() - lastKeyTime > 1000 : true)) {
			listener();

			lastKey = key;
			lastKeyTime = performance.now();
		}
	});

	return {
		onKeyPress: (key: AllowedKeys, listener: () => void) => {
			listeners[key] = listener;
		},
	};
};

type Key =
	| "q"
	| "w"
	| "e"
	| "r"
	| "t"
	| "y"
	| "u"
	| "i"
	| "o"
	| "p"
	| "a"
	| "s"
	| "d"
	| "f"
	| "g"
	| "h"
	| "j"
	| "k"
	| "l"
	| "z"
	| "x"
	| "c"
	| "v"
	| "b"
	| "n"
	| "m"
	| "0"
	| "1"
	| "2"
	| "3"
	| "4"
	| "5"
	| "6"
	| "7"
	| "8"
	| "9"
	| "space"
	| "left"
	| "right"
	| "up"
	| "down"
	| "enter"
	| "plus"
	| "minus"
	| "escape"
	| "delete"
	| "backspace"
	| "page_up"
	| "page_down"
	| "end"
	| "home";
