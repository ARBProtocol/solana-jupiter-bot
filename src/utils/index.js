const fs = require("fs");
const ora = require("ora-classic");
const { logExit } = require("../bot/exit");

const createTempDir = () => !fs.existsSync("./temp") && fs.mkdirSync("./temp");

const storeItInTempAsJSON = (filename, data) =>
	fs.writeFileSync(`./temp/${filename}.json`, JSON.stringify(data, null, 2));

const createConfigFile = (config) => {
	const configSpinner = ora({
		text: "Creating config...",
		discardStdin: false,
	}).start();

	const configValues = {
		network: config.network.value,
		rpc: config.rpc.value,
		tradingStrategy: config.strategy.value,
		tokenA: config.tokens.value.tokenA,
		tokenB: config.tokens.value.tokenB,
		slippage: config.slippage.value,
		minPercProfit: config.profit.value,
		minInterval: parseInt(config.advanced.value.minInterval),
		// tradingEnabled: config.tradingEnabled.value,
		tradingEnabled: true,
		tradeSize: {
			value: parseFloat(config["trading size"].value.value),
			strategy: config["trading size"].value.strategy,
		},
		ui: {
			defaultColor: "cyan",
		},
		storeFailedTxInHistory: true,
	};

	fs.writeFileSync("./config.json", JSON.stringify(configValues, null, 2), {});
	configSpinner.succeed("Config created!");
};

const verifyConfig = (config) => {
	let result = true;
	const badConfig = [];
	Object.entries(config).forEach(([key, value]) => {
		const isSet = value.isSet;
		const isSectionSet =
			isSet instanceof Object
				? Object.values(isSet).every((value) => value === true)
				: isSet;

		if (!isSectionSet) {
			result = false;
			badConfig.push(key);
		}
	});
	return { result, badConfig };
};

/**
 * It loads the config file and returns the config object
 * @returns The config object
 */
const loadConfigFile = ({ showSpinner = false }) => {
	let config = {};
	let spinner;
	if (showSpinner) {
		spinner = ora({
			text: "Loading config...",
			discardStdin: false,
		}).start();
	}

	if (fs.existsSync("./config.json")) {
		config = JSON.parse(fs.readFileSync("./config.json"));
	}

	spinner?.succeed("Config loaded!");

	return config;
};

const calculateProfit = (oldVal, newVal) => ((newVal - oldVal) / oldVal) * 100;

const toDecimal = (number, decimals) =>
	parseFloat(number / 10 ** decimals).toFixed(decimals);

const toNumber = (number, decimals) => number * 10 ** decimals;

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

const checkRoutesResponse = (routes) => {
	if (Object.hasOwn(routes, "routesInfos")) {
		if (routes.routesInfos.length === 0) {
			logExit(1, {
				message: "No routes found or something is wrong with RPC / Jupiter! ",
			});
			process.exit(1);
		}
	} else {
		logExit(1, {
			message: "Something is wrong with RPC / Jupiter! ",
		});
		process.exit(1);
	}
};

module.exports = {
	createTempDir,
	storeItInTempAsJSON,
	createConfigFile,
	loadConfigFile,
	verifyConfig,
	calculateProfit,
	toDecimal,
	toNumber,
	updateIterationsPerMin,
	checkRoutesResponse,
};
