export const calculateTxProfit = (inAmount: number, outAmount: number) => {
	const profit = outAmount - inAmount;

	const profitPercent = profit / inAmount;

	return { profit, profitPercent };
};
