/* eslint-disable turbo/no-undeclared-env-vars */
// TODO: fix getting LOG_LEVEL from .env, maybe consume it during bot creation and store it in zustand (?)
import pino from "pino";

export const logger = pino(
	{ level: process.env.LOG_LEVEL || "info" },
	pino.destination(`./temp/bot.log`)
);
