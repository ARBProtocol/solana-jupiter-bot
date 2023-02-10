const ora = require("ora-classic");
const chalk = require("chalk");
const CONSTANTS = require("../constants");
const helpers = require("./strategies/helpers");
// const listenHotkeys = require("./strategies/helpers/system/listenHotkeys");

const baseStrategy = ({ config, childStrategy }) => {
	const base = {
		validations: {
			cache: false,
			config: false,
			tokens: false,
			jupiter: false,
		},
		spinner: null,
		jupiter: null,
		data: {
			cache: null,
			tokens: {
				tokenA: { name: "tokenA", value: null },
				tokenB: { name: "tokenB", value: null },
			},
			currentCycle: {
				i: null,
				date: null,
				route: null,
				simulatedProfit: null,
				tx: null,
				tradeEntry: null,
				performance: {
					routeLookup: null,
					tx: null,
				},
			},
		},
		helpers: {
			...helpers,
		},
	};

	const init = async () => {
		try {
			base.spinner.start("Loading tokens...");

			// Load token lists
			await base.helpers.setup.setTokens(base);

			// Setup Jupiter SDK & Check ARB in wallet
			await base.helpers.setup.setConnections(base);

			// Run strategy setup code
			childStrategy(base).setup(base);

			// Confirm strategy is OK to run
			base.helpers.validate.strategy(base);

			// Finalise setup
			base.data.cache.isSetupDone = true;
			startWatcher();
		} catch (error) {
			showSpinnerSetupFail(base.spinner);
			base.helpers.exit.logExit(1, error);
			process.exitCode = 1;
		}
	};

	const start = async () => {
		const queue = base.data.cache.queue;
		const i = base.data.currentCycle.i;

		try {
			// Setup Current Cycle data
			base.helpers.trade.startCurrentCycle(base);
			base.helpers.trade.updateIterationsPerMin(base);

			// Run strategy code
			childStrategy(base).execute(base);

			// Finalise Current Cycle
			// - Change trade side
			// - Set notSwapping
		} catch (error) {
			// Reset queue
			queue[i] = 1;
			console.log(error);
		} finally {
			delete queue[i];
		}
	};

	const watcher = async () => {
		if (base.helpers.trade.canStartCycle(base)) {
			await start();
		}
	};

	const startWatcher = async () => {
		global.botInterval = setInterval(
			() => watcher(),
			base.data.cache.config.minInterval
		);
	};

	base.spinner = createSpinner();
	prepareCache(base, config);

	return { init, start };
};

function createSpinner() {
	return ora({
		text: "",
		discardStdin: false,
		color: "magenta",
	});
}

function showSpinnerSetupFail(spinner) {
	spinner.fail(chalk.bold.redBright(`Setting up failed!\n 	${spinner.text}`));
}

function prepareCache(base, config) {
	base.data.cache = JSON.parse(JSON.stringify(CONSTANTS.CACHE_BASE));
	base.validations.cache = true;

	base.data.cache.config = config;
	base.validations.config = true;
}

module.exports = baseStrategy;
