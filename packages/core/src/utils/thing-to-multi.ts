import Decimal from "decimal.js";
import JSBI from "jsbi";
import { parseError } from "./parse-error";
import { createLogger } from "src/actions/public/create-logger";

const logger = createLogger("./bot.log");

// TODO: use better naming (?)

export interface Multi {
	/**
	 * Blockchain Value - Smallest possible unit of a token
	 */
	readonly string: string;
	/**
	 * Blockchain Value - Smallest possible unit of a token
	 */
	readonly number: number;
	/**
	 * Blockchain Value - Smallest possible unit of a token
	 */
	readonly jsbi: JSBI;
	/**
	 * Blockchain Value - Smallest possible unit of a token
	 */
	readonly bigint: bigint;

	readonly uiValue: {
		/**
		 * UI Value - Human readable value
		 */
		string: string;
		/**
		 * UI Value - Human readable value
		 */
		number: number;
		/**
		 * UI Value - Human readable value
		 */
		decimal: Decimal;
	};
}

const fromUiValue = (
	thing: string | number | Decimal,
	decimals: number
): Multi | undefined => {
	let string: string;
	let number: number;
	let jsbi: JSBI;
	let bigint: bigint;

	// UI Values
	let uiString: string;
	let uiNumber: number;
	let uiDecimal: Decimal;

	try {
		if (typeof thing === "number") {
			uiString = thing.toString();
			uiNumber = thing;
			uiDecimal = new Decimal(thing);

			const blockChainValue = Math.round(thing * 10 ** decimals);
			number = blockChainValue;
			string = blockChainValue.toString();
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = BigInt(blockChainValue);
		} else if (typeof thing === "string") {
			uiString = thing;
			uiNumber = Number(thing);
			uiDecimal = new Decimal(thing);

			const blockChainValue = Math.round(Number(thing) * 10 ** decimals);
			number = blockChainValue;
			string = blockChainValue.toString();
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = BigInt(blockChainValue);
		} else if (thing instanceof Decimal) {
			uiString = thing.toString();
			uiNumber = thing.toNumber();
			uiDecimal = thing;

			const blockChainValue = Math.round(thing.toNumber() * 10 ** decimals);
			string = blockChainValue.toString();
			number = blockChainValue;
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = BigInt(blockChainValue);
		} else {
			throw new Error("fromUiValue:error Invalid type");
		}

		return {
			string,
			number,
			jsbi,
			bigint,
			uiValue: {
				string: uiString,
				number: uiNumber,
				decimal: uiDecimal,
			},
		};
	} catch (error) {
		const parsedError = parseError(error);
		logger.error(
			{
				input: thing,
				decimals,
			},
			"fromUiValue:error: " + parsedError?.message
		);
		process.exit(1);
	}
};

const fromBlockchainValue = (
	thing: string | number | JSBI | bigint,
	decimals: number
): Multi | undefined => {
	let string: string;
	let number: number;
	let jsbi: JSBI;
	let bigint: bigint;

	// UI Values
	let uiString: string;
	let uiNumber: number;
	let uiDecimal: Decimal;

	try {
		if (typeof thing === "number") {
			const blockChainValue = Math.round(thing);
			string = blockChainValue.toString();
			number = blockChainValue;
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = BigInt(blockChainValue);

			uiNumber = blockChainValue / 10 ** decimals;
			uiString = uiNumber.toString();
			uiDecimal = new Decimal(uiNumber);
		} else if (typeof thing === "string") {
			const blockChainValue = Math.round(Number(thing));
			string = blockChainValue.toString();
			number = blockChainValue;
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = BigInt(blockChainValue);

			uiNumber = blockChainValue / 10 ** decimals;
			uiString = uiNumber.toString();
			uiDecimal = new Decimal(uiNumber);
		} else if (thing instanceof JSBI) {
			const blockChainValue = Math.round(JSBI.toNumber(thing));
			string = JSBI.toString();
			number = blockChainValue;
			jsbi = thing;
			bigint = BigInt(blockChainValue);

			uiNumber = blockChainValue / 10 ** decimals;
			uiString = uiNumber.toString();
			uiDecimal = new Decimal(uiNumber);
		} else if (typeof thing === "bigint") {
			const blockChainValue = Math.round(Number(thing));
			string = blockChainValue.toString();
			number = blockChainValue;
			jsbi = JSBI.BigInt(blockChainValue);
			bigint = thing;

			uiNumber = blockChainValue / 10 ** decimals;
			uiString = uiNumber.toString();
			uiDecimal = new Decimal(uiNumber);
		} else {
			throw new Error("Invalid type");
		}

		return {
			string,
			number,
			jsbi,
			bigint,
			uiValue: {
				string: uiString,
				number: uiNumber,
				decimal: uiDecimal,
			},
		};
	} catch (error) {
		const parsedError = parseError(error);
		logger.error(
			{
				input: thing,
				decimals,
				stack: parsedError?.stack,
			},
			"fromUiValue:error: " + parsedError?.message
		);
		process.exit(1);
	}
};

export const thingToMulti = {
	fromUiValue,
	fromBlockchainValue,
};
