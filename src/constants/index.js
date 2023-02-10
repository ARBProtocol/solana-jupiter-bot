const CONFIG_INITIAL_STATE = require("./cache");
const ARB_PROTOCOL = require("./arb");
const CACHE_BASE = require("./cache");
const TRADING_STRATEGIES = require("./strategies");

const CONSTANTS = Object.freeze({
	ARB_PROTOCOL,
	CACHE_BASE,
	CONFIG_INITIAL_STATE,
	DISCORD_INVITE_URL: "https://discord.gg/wcxYzfKNaE",
	TRADING_STRATEGIES,
});

module.exports = CONSTANTS;
