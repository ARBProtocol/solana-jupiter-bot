/* eslint-disable indent */
import gradient from "gradient-string";
import boxen from "./boxen.js";
import stripAnsi from "./strip-ansi.js";
import { stripIndents } from "common-tags";

const ALLOWED_GRADIENTS = [
	"cristal",
	"teen",
	"mind",
	"morning",
	"vice",
	"passion",
	"fruit",
	"instagram",
	"atlas",
	"retro",
	"summer",
	"pastel",
	"rainbow",
];

// Type checking in JS is a mess.
// Warning: real bad code ahead
function handleAllErrors(boxText, boxOptions, gradientOptions) {
	if (typeof boxText !== "string") {
		throw new Error("No box text provided");
	}

	if (!boxOptions) {
		throw new Error("No box options provided");
	}

	if (Object.prototype.toString.call(boxOptions) !== "[object Object]") {
		throw new Error("Box options must be an object");
	}

	if (!gradientOptions) {
		throw new Error("No gradient specified");
	}

	if (gradientOptions) {
		if (
			!(
				typeof gradientOptions === "string" ||
				(Array.isArray(gradientOptions) &&
					gradientOptions.every((gradientOption) => typeof gradientOption === "string"))
			)
		) {
			throw new TypeError(
				stripIndents`Gradient must be a string or an array of valid color codes
        Received type: ${typeof gradientOptions}. Expected type: 'string' or 'array'`
			);
		}

		if (typeof gradientOptions === "string" && !ALLOWED_GRADIENTS.includes(gradientOptions)) {
			throw new Error(
				stripIndents`Gradient name must be one of the following: ${ALLOWED_GRADIENTS.join(
					", "
				)}. Received gradient name: '${gradientOptions}'`
			);
		}
	}
}

// eslint-disable-next-line consistent-return
/**
 * Creates a box with a gradient border in the terminal
 * @param {string} boxText - The text to be displayed in the box
 * @param {Object} boxOptions - The configuration options for the box as per the boxen package
 * @param {string|string[]} gradientOptions - The gradient to be used for the box. Can be a string or an array of valid color codes
 * @returns {string} - The boxen text with the gradient border
 * @example
 * console.log(
 *  gradientBox('Hello World',
 *    {
 *      padding: 2,
 *      margin: 1,
 *      borderStyle: 'round',
 *    },
 *    'instagram',
 *  })
 * );
 */
function gradientBox(
	boxText,
	boxOptions = { borderStyle: "round", padding: 0.75, marging: 0.75 },
	gradientOptions = ["#11998e", "#38ef7d"]
) {
	handleAllErrors(boxText, boxOptions, gradientOptions);

	if (typeof gradientOptions === "string") {
		const box = gradient[gradientOptions].multiline(stripAnsi(boxen(boxText, boxOptions)));

		return `${box}\u001b[0m`;
	}
	if (gradientOptions instanceof Array) {
		const box = gradient([...gradientOptions]).multiline(stripAnsi(boxen(boxText, boxOptions)));

		return `${box}\u001b[0m`;
	}

	return "";
}

export default gradientBox;
