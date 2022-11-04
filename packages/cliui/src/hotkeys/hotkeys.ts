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

	readline.emitKeypressEvents(process.stdin);

	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}

	process.stdin.on("keypress", (_, keyRaw: KeyRaw) => {
		let key = `${keyRaw.ctrl ? "ctrl+" : ""}${keyRaw.name}` as AllowedKeys;
		key = `${keyRaw.shift ? "shift+" : ""}${key}` as AllowedKeys;

		const listener = listeners[key] as Callback;

		if (listener) {
			listener();
		}
	});

	return {
		onKeyPress: (key: AllowedKeys, listener: () => void) => {
			listeners[key] = listener;
		},
	};
};

// let onKeyPress = (keyRaw: KeyRaw) => {
// 	console.log(`You pressed the "${keyRaw.name}" key`);
// 	console.table(keyRaw);
// 	console.log(
// 		"You most likely forgot pass the callback to the hotkeys function if you see this message"
// 	);
// };

// process.stdin.on("keypress", (str, keyRaw) => {
// 	if (keyRaw.ctrl && keyRaw.name === "c") {
// 		console.log("User pressed Ctrl+C, exiting...");
// 		process.exit();
// 	}
// 	onKeyPress(keyRaw);
// });

// export const keyboard = {
// 	onKeyPress: (key: Key | KeyCombo, callback: () => void) => {
// 		onKeyPress = (keyRaw: KeyRaw) => {
// 			console.log(
// 				`You pressed the "${keyRaw.name}" key and key ${key} is equal?  ${keyRaw.name === key}`
// 			);
// 			console.table(keyRaw);
// 			if (key.includes("+")) {
// 				console.log("Key includes +");
// 				const [modifier, keyName] = key.split("+") as [Modifier, Key];

// 				console.log(`Modifier: ${modifier}, keyName: ${keyName}`);

// 				if (modifier !== "ctrl" && modifier !== "shift") {
// 					throw new Error("Only ctrl and shift modifiers are supported");
// 				}

// 				if (keyRaw[modifier] && keyName === keyRaw.name) {
// 					callback();
// 				}
// 			} else if (key === keyRaw.name) {
// 				callback();
// 			}
// 		};
// 	},
// };

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
	| "arrowLeft"
	| "arrowRight"
	| "arrowUp"
	| "arrowDown"
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
