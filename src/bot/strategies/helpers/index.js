const appHelpers = require("./app");
const exitHelpers = require("./exit");
const setupHelpers = require("./system/setup");
const tradeHelpers = require("./trade");
const transactionHelpers = require("./transaction");
const validationsHelpers = require("./system/validations");

const helpers = {
	app: appHelpers,
	exit: exitHelpers,
	setup: setupHelpers,
	trade: tradeHelpers,
	transaction: transactionHelpers,
	validate: validationsHelpers,
};

module.exports = helpers;
