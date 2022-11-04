/* eslint-disable turbo/no-undeclared-env-vars */
import * as dotenv from "dotenv";

import { createBot, loadPlugin } from "@arb-protocol/core";
import { startCLIUI } from "@arb-protocol/cliui";

export const setup = async () => {
	try {
		// load .env file
		dotenv.config();

		// create bot
		const bot = createBot({
			privateKey: process.env.SOLANA_WALLET_PRIVATE_KEY as string,
			rpcURL: process.env.DEFAULT_RPC as string,
			// rpcWSS: (process.env.DEFAULT_RPC_WSS as string) || undefined,
			tokens: {
				tokenA: {
					address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
				},
				tokenB: {
					address: "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", //BTC
				},
				// tokenB: {
				// 	address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
				// },
			},
			strategy: {
				tradeAmount: 100000000,
			},
		});

		if (!bot) throw new Error("Bot failed to start");

		// start cliui
		const { onKeyPress } = startCLIUI(bot);

		onKeyPress("z", () => console.log("You pressed z, test ok!"));
		// start bot
		await bot.start();

		// load plugin with loader
		loadPlugin(bot, "getCounterPlugin2", (bot) => ({
			countState: bot.store.getState().counter.count,
		}));

		bot.store.setState((prev) => {
			prev.counter.count += 2;
		});

		const routes = await bot.computeRoutes();

		if (!routes) throw new Error("No routes found");

		const bestRoute = routes.routesInfos[0];

		if (!bestRoute) throw new Error("No best route found");

		console.log("outAmount", bestRoute.outAmount);

		const initialOutAmount = bestRoute.outAmount;

		// store the initial out amount
		bot.store.setState((prev) => {
			prev.bot.initialOutAmount.tokenB = initialOutAmount;
		});

		// loop
		const condition = true;
		while (condition) {
			if (bot.getStatus() === "idle" && bot.queue.getCount() === 0) {
				// compute routes
				const routes = await bot.computeRoutes();
				if (!routes) throw new Error("No routes found");

				const bestRoute = routes.routesInfos[0];

				if (!bestRoute) throw new Error("No best route found");

				// log difference between initial out amount and current out amount
				const initialOutAmount = bot.store.getState().bot.initialOutAmount.tokenB;
				const initialOutAmountAsNumber = bot.utils.JSBItoNumber(initialOutAmount);

				const currentOutAmount = bestRoute.outAmount;
				const currentOutAmountAsNumber = bot.utils.JSBItoNumber(currentOutAmount);

				const diff = bot.utils.JSBI.subtract(currentOutAmount, initialOutAmount);

				const diffPercent = bot.utils.JSBI.divide(
					bot.utils.JSBI.multiply(diff, bot.utils.JSBI.BigInt(100)),
					initialOutAmount
				);

				// as numbers
				const diffPercentAsNumber = bot.utils.JSBItoNumber(diffPercent);
				const diffAsNumber = bot.utils.JSBItoNumber(diff);

				// hold on for 2 seconds
				await bot.utils.sleep(2000);

				// date
				const date = new Date();
				console.log("date: ", date.toLocaleString());
				console.log("initialOutAmount", initialOutAmountAsNumber);
				console.log("currentOutAmount", currentOutAmountAsNumber);

				console.log("diff", diffAsNumber);
				console.log("diffPercent", diffPercentAsNumber);

				// if diff is greater than 0.01% of initial out amount
				if (diffPercentAsNumber > 1) {
					console.log("diffPercent > 1 !!!!!!!!!");
				}
			}
		}

		// swap
		// const result = await bot.swap(bestRoute);
		// console.log({ result });

		// log iteration count

		return bot;
	} catch (error) {
		console.error(error);
	}
};
