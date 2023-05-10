import { CreateBotParams, createBot } from "./create-bot";
import { createPublicActions } from "../actions/public";
import { createStarter } from "../actions/public/create-starter";

export const createPublicBot = (config: CreateBotParams) => {
	try {
		{
			console.log("createPublicBot:loading");

			const bot = {
				...createBot(config),
			};

			const publicBot = {
				...bot,
				...createPublicActions(config),
			};

			return {
				...publicBot,
				...createStarter(publicBot),
			};
		}
	} catch (error) {
		console.log("createPublicBot:error", error);
	}
};

export type PublicBot = ReturnType<typeof createBot> &
	ReturnType<typeof createPublicActions>;
