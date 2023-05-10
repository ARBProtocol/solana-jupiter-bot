import stripAnsi from "./strip-ansi.js";
import eastAsianWidth from "eastasianwidth";
import emojiRegex from "emoji-regex";

export default function stringWidth(string, options) {
	if (typeof string !== "string" || string.length === 0) {
		return 0;
	}

	options = {
		ambiguousIsNarrow: true,
		countAnsiEscapeCodes: false,
		...options,
	};

	if (!options.countAnsiEscapeCodes) {
		string = stripAnsi(string);
	}

	if (string.length === 0) {
		return 0;
	}

	const ambiguousCharacterWidth = options.ambiguousIsNarrow ? 1 : 2;
	let width = 0;

	for (const { segment: character } of new Intl.Segmenter().segment(string)) {
		const codePoint = character.codePointAt(0);

		// Ignore control characters
		if (codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f)) {
			continue;
		}

		// Ignore combining characters
		if (codePoint >= 0x3_00 && codePoint <= 0x3_6f) {
			continue;
		}

		if (emojiRegex().test(character)) {
			width += 2;
			continue;
		}

		const code = eastAsianWidth.eastAsianWidth(character);
		switch (code) {
			case "F":
			case "W": {
				width += 2;
				break;
			}

			case "A": {
				width += ambiguousCharacterWidth;
				break;
			}

			default: {
				width += 1;
			}
		}
	}

	return width;
}
