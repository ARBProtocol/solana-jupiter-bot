const { loadConfigFile } = require("../../utils");
const baseStrategy = require("./baseStrategy");

const pingpongStrategy = require("./strategies/pingpong");
const arbitrageStrategy = require("./strategies/arbitrage");

const strategyFactory = () => {
	const config = loadConfigFile({ showSpinner: true });

	let childStrategy;
	switch (config.tradingStrategy) {
		case "pingpong":
			childStrategy = pingpongStrategy;
			break;
		case "arbitrage":
			childStrategy = arbitrageStrategy;
			break;
		default:
			throw new Error("Invalid trading strategy");
	}

	return baseStrategy({ config, childStrategy });
};

module.exports = strategyFactory;
