const fs = require("fs");
const ora = require("ora-classic");

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
 * It loads the config file and returns the config object
 * @returns The config object
 */
const loadConfigFile = () => {
	const configSpinner = ora({
		text: "Loading config...",
		discardStdin: false,
	}).start();

	const config = JSON.parse(fs.readFileSync("./config.json"));

	configSpinner.succeed("Config loaded!");

	return config;
};

/**
 * It calculates the number of iterations per minute and updates the cache.
 */
const updateIterationsPerMin = (cache) => {
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

const storeItInTempAsJSON = (filename, data) => {
	fs.writeFileSync(`./temp/${filename}.json`, JSON.stringify(data, null, 2));
};

module.exports = {
	calculateProfit,
	toDecimal,
	toNumber,
	createTempDir,
	loadConfigFile,
	updateIterationsPerMin,
	storeItInTempAsJSON,
};
