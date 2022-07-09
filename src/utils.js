const fs = require("fs");
const cache = require("./cache");

const calculateProfit = (oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100;

const toDecimal = (number, decimals) =>
	parseFloat(number / 10 ** decimals).toFixed(decimals);

const toNumber = (number, decimals) => number * 10 ** decimals;

const createTempDir = () => {
	// create a 'temp' directory if not exists
	if (!fs.existsSync("./temp")) {
		fs.mkdirSync("./temp");
	}
};

/**
 * It calculates the number of iterations per minute and updates the cache.
 */
const updateIterationsPerMin = () => {
	const iterationTimer =
		(performance.now() - cache.iterationPerMinute.start) / 1000;

	if (iterationTimer >= 60) {
		cache.iterationPerMinute.value = Number(
			cache.iterationPerMinute.counter.toFixed()
		);
		cache.iterationPerMinute.start = performance.now();
		cache.iterationPerMinute.counter = 0;
	} else cache.iterationPerMinute.counter++;
};

module.exports = {
	calculateProfit,
	toDecimal,
	toNumber,
	createTempDir,
	updateIterationsPerMin,
};
