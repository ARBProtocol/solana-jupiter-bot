import { CreateBotParams, createBot } from "./create-bot";
import { createPublicActions } from "../actions/public";
import { createStarter } from "../actions/public/create-starter";
import { logger } from "src/logger";

export const createPublicBot = (config: CreateBotParams) => {
	try {
		{
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
		logger.error(`createPublicBot ${error}`);
		throw error;
	}
};

export type PublicBot = ReturnType<typeof createBot> &
	ReturnType<typeof createPublicActions>;
