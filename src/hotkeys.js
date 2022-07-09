const keypress = require("keypress");

const cache = require("./cache");
const { logError, handleExit } = require("./exit");

const listenHotkeys = () => {
	keypress(process.stdin);

	process.stdin.on("keypress", function (ch, key) {
		// console.log('got "keypress"', key);
		if (key && key.ctrl && key.name == "c") {
			// eslint-disable-next-line no-undef
			clearInterval(botInterval);
			handleExit();
			logError({ message: "Exited by user!" });
			process.stdin.setRawMode(false);
			process.exitCode = 0;
		}

		// [E] - forced execution
		if (key && key.name === "e") {
			cache.hotkeys.e = true;
		}

		// [R] - revert back swap
		if (key && key.name === "r") {
			cache.hotkeys.r = true;
		}

		// [P] - switch profit chart visibility
		if (key && key.name === "p") {
			cache.ui.showProfitChart = !cache.ui.showProfitChart;
		}

		// [L] - switch performance chart visibility
		if (key && key.name === "l") {
			cache.ui.showPerformanceOfRouteCompChart =
				!cache.ui.showPerformanceOfRouteCompChart;
		}

		// [H] - switch trade history visibility
		if (key && key.name === "t") {
			cache.ui.showTradeHistory = !cache.ui.showTradeHistory;
		}

		// [I] - incognito mode (hide RPC)
		if (key && key.name === "i") {
			cache.ui.hideRpc = !cache.ui.hideRpc;
		}

		// [H] - switch help visibility
		if (key && key.name === "h") {
			cache.ui.showHelp = !cache.ui.showHelp;
		}

		// [S] - simulation mode switch
		if (key && key.name === "s") {
			cache.tradingEnabled = !cache.tradingEnabled;
		}
	});

	process.stdin.setRawMode(true);
	process.stdin.resume();
};

module.exports = listenHotkeys;
