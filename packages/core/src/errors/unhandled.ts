import { parseError } from "src/utils";
import { createLogger } from "../actions/public/create-logger";
import { BaseError } from "./base";

export class UnhandledError extends BaseError {
	override name = "UnhandledError";

	constructor(details?: string) {
		const message = details
			? `An unhandled error occurred: ${details}`
			: "An unhandled error occurred.";
		super(message);
	}

	static handle(error: unknown, details?: string): void {
		const parsedError = parseError(error);
		const logger = createLogger("./bot.log");
		logger.error("UNHANDLED ERROR: " + parsedError?.message);

		if (parsedError?.stack) {
			logger.error(parsedError.stack);
		}

		const unhandledError = new UnhandledError(details);
		unhandledError.cause = error instanceof Error ? error : undefined;
		unhandledError.walk((err) => {
			console.error(err);
			return false;
		});
	}
}
