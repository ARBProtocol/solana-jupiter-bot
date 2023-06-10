import { createLogger } from "src/actions/public/create-logger";

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
		const logger = createLogger("./bot.log");
		const msg = "MAIN THREAD EXIT! CODE: " + code;
		console.error(msg);
		logger.error(msg);

		if (code !== 0) {
			const stack = new Error().stack;
			console.error(`TIME: ${new Date().toLocaleString()} (${Date.now()})`);
			console.error(`STACK TRACE:\n${stack}`);
			logger.error(
				{
					stack,
				},
				"STACK TRACE"
			);
		}
	});
};
