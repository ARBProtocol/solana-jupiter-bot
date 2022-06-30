const calculateProfit = (oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100;

const toDecimal = (number, decimals) =>
	parseFloat(number / 10 ** decimals).toFixed(decimals);

const toNumber = (number, decimals) => number * 10 ** decimals;

module.exports = {
	calculateProfit,
	toDecimal,
	toNumber,
};
