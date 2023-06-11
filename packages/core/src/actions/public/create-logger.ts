import pino from "pino";
import { createTempDir } from "src/utils";

export const createLogger = (logPath: string) => {
	createTempDir();
	return pino(
		{
			level: process.env.LOG_LEVEL || "info",
			formatters: {
				level: (label) => ({
					level: label,
				}),
			},
			enabled: Boolean(process.env.LOG_ENABLED),
			base: null,
		},
		pino.destination(logPath)
	);
};

export type Logger = ReturnType<typeof createLogger>;
