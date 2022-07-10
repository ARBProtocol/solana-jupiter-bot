const chalk = require("chalk");
const fs = require("fs");
const cache = require("./cache");

const logExit = (code = 0, error) => {
	code === 0 && console.log(chalk.black.bgMagentaBright.bold(error.message));

	if (code === 1) {
		error?.message &&
			console.log(
				chalk.black.bgRedBright.black("ERROR: " + chalk.bold(error.message))
			);
		error?.stack && console.log(chalk.redBright(error.stack));

		if (cache.isSetupDone) {
			console.log(
				chalk.black.bgYellowBright(
					"Closing connections... ",
					chalk.bold("WAIT! ")
				)
			);
			console.log(chalk.yellowBright.bgBlack("Press [Ctrl]+[C] to force exit"));
		}
	}
};

const handleExit = () => {
	try {
		console.log("Exiting on time: ", new Date().toLocaleString());
		// write cache to file
		fs.writeFileSync("./temp/cache.json", JSON.stringify(cache, null, 2));

		// write trade history to file
		fs.writeFileSync(
			"./temp/tradeHistory.json",
			JSON.stringify(cache.tradeHistory, null, 2)
		);
	} catch (error) {
		console.log(error);
	}
};

module.exports = { logExit, handleExit };
