import { Decimal } from "decimal.js";

export const calculateTxProfit = (inAmount: Decimal, outAmount: Decimal) => {
	const profit = outAmount.minus(inAmount);

	const profitPercent = profit.div(inAmount).times(100);

	return { profit, profitPercent };
};
