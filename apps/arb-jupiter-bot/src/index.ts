console.log("Hello from arb-jupiter-bot");

import { setup } from "./setup";

const start = async () => {
	await setup();

	// test external plugin
	// const getCounterPlugin2Test = bot.getCounterPlugin2(bot).countState;
	// console.log({ getCounterPlugin2Test });
};

start();
