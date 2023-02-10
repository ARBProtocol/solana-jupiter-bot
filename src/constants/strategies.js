const chalk = require("chalk");

const TRADING_STRATEGIES = Object.freeze([
	{ label: "Ping Pong", value: "pingpong" },
	{ label: "Arbitrage", value: "arbitrage" },
	{ label: chalk.gray("coming soon..."), value: "null" },
]);

module.exports = TRADING_STRATEGIES;
