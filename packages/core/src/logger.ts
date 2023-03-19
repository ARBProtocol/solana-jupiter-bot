/* eslint-disable turbo/no-undeclared-env-vars */

import pino from "pino";

export const logger = pino(
	{
		level: process.env.LOG_LEVEL || "info",
		formatters: {
			level: (label) => ({
				level: label,
			}),
		},
		enabled: Boolean(process.env.DEBUG),
		base: null,
	},
	pino.destination(`./temp/bot.log`)
);
