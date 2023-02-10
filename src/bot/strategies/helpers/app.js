const appHelpers = {
	handleHotkeyForceExecutionPress: (base) => {
		const cache = base.data.cache;

		if (cache.hotkeys.e) {
			console.log("[E] PRESSED - EXECUTION FORCED BY USER!");
			cache.hotkeys.e = false;
		}
	},

	handleHotkeyRevertBackSwapPress: (base) => {
		if (base.data.cache.hotkeys.r) {
			console.log("[R] PRESSED - REVERT BACK SWAP!");
			base.data.currentCycle.route.otherAmountThreshold = 0;
		}
	},

	measurePerformance: (func) => {
		const start = performance.now();
		func();
		return performance.now() - start;
	},
};

module.exports = appHelpers;
