console.clear();

const strategyFactory = require("./strategyFactory");
require("dotenv").config();

const { handleExit, logExit } = require("./exit");

const run = async () => {
	try {
		const strategy = strategyFactory();

		await strategy.init();
		await strategy.start();
	} catch (error) {
		logExit(error);
		process.exitCode = 1;
	}
};

run();
//
// handle exit
// process.on("exit", handleExit);
