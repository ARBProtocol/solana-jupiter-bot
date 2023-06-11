import { logger } from "src/logger";

export const setupExitHandlers = () => {
	process.on("SIGTERM", () => {
		console.log("SIGTERM");
		process.exit(0);
	});

	process.on("SIGINT", () => {
		console.log("SIGINT");
		process.exit(0);
	});

	process.on("exit", (code) => {
		const msg = "MAIN THREAD EXIT! CODE: " + code;
		console.error(msg);
		logger && logger.error(msg);

		if (code !== 0) {
			const stack = new Error().stack;
			console.error(`TIME: ${new Date().toLocaleString()} (${Date.now()})`);
			console.error(`STACK TRACE:\n${stack}`);
			logger &&
				logger.error(
					{
						stack,
					},
					"STACK TRACE"
				);
		}
	});
};
