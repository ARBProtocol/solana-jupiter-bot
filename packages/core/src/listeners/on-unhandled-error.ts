import { UnhandledError } from "../errors";

export const setupUnhandledErrorHandlers = () => {
	process.on("unhandledRejection", (error) => {
		UnhandledError.handle(error, "Top-level unhandledRejection");
		process.exit(1);
	});
};
