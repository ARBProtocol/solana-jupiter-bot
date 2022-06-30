const fs = require("fs");

exports.handleExit = (config, cache) => {
	try {
		// write cache to file
		fs.writeFileSync("./temp/cache.json", JSON.stringify(cache, null, 2));

		// write blockedAMMs to file
		fs.writeFileSync(
			"./temp/blockedAMMs.json",
			JSON.stringify(cache.blockedAMMs, null, 2)
		);

		// write trade history to file
		fs.writeFileSync(
			"./temp/tradeHistory.json",
			JSON.stringify(cache.tradeHistory, null, 2)
		);

		// write config to file
		delete cache.tradeHistory;
		delete cache.blockedAMMs;
		fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
	} catch (error) {
		console.log(error);
	}
};
