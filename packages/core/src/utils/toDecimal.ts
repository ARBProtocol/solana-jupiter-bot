import Decimal from "decimal.js";

export const toDecimal = (input: string | number, shift: number): Decimal => {
	return new Decimal(input.toString()).div(new Decimal(10).pow(shift));
};

// export const minToNumber = (number: number, decimals: number): number =>
// 	parseFloat((number / 10 ** decimals).toFixed(decimals));
