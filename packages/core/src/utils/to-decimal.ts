import Decimal from "decimal.js";

export const toDecimal = (input: string | number, shift?: number): Decimal => {
	return shift
		? new Decimal(input.toString()).div(new Decimal(10).pow(shift))
		: new Decimal(input.toString());
};
