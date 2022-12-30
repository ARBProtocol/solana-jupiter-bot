// global cache
const JSBI = require("jsbi")

const cache = {
	startTime: new Date(),
	queue: {},
	queueThrottle: 1,
	sideBuy: true,
	iteration: 0,
	iterationPerMinute: {
		start: performance.now(),
		value: 0,
		counter: 0,
	},
	initialBalance: {
		tokenA: JSBI.BigInt(0),
		tokenB: JSBI.BigInt(0),
	},

	currentBalance: {
		tokenA: JSBI.BigInt(0),
		tokenB: JSBI.BigInt(0),
	},
	currentProfit: {
		tokenA: JSBI.BigInt(0),
		tokenB: JSBI.BigInt(0),
	},
	lastBalance: {
		tokenA: JSBI.BigInt(0),
		tokenB: JSBI.BigInt(0),
	},
	profit: {
		tokenA: JSBI.BigInt(0),
		tokenB: JSBI.BigInt(0),
	},
	maxProfitSpotted: {
		buy: 0,
		sell: 0,
	},
	tradeCounter: {
		buy: { success: 0, fail: 0 },
		sell: { success: 0, fail: 0 },
	},
	ui: {
		defaultColor: process.env.UI_COLOR ?? "cyan",
		showPerformanceOfRouteCompChart: false,
		showProfitChart: true,
		showTradeHistory: true,
		hideRpc: false,
		showHelp: true,
		allowClear: true,
	},
	chart: {
		spottedMax: {
			buy: new Array(120).fill(0),
			sell: new Array(120).fill(0),
		},
		performanceOfRouteComp: new Array(120).fill(0),
	},
	hotkeys: {
		e: false,
		r: false,
	},
	tradingEnabled:
		process.env.TRADING_ENABLED === undefined
			? true
			: process.env.TRADING_ENABLED === "true",
	wrapUnwrapSOL:
		process.env.WRAP_UNWRAP_SOL === undefined
			? true
			: process.env.WRAP_UNWRAP_SOL === "true",
	swappingRightNow: false,
	fetchingResultsFromSolscan: false,
	fetchingResultsFromSolscanStart: 0,
	tradeHistory: [],
	performanceOfTxStart: 0,
	availableRoutes: {
		buy: 0,
		sell: 0,
	},
	isSetupDone: false,
};

module.exports = cache;
