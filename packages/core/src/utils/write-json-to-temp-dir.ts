import fs from "fs";
import { createLogger } from "src/actions/public/create-logger";
import { parseError } from "./parse-error";

export const writeJsonToTempDir = (
	fileName: string | number,
	data: unknown
) => {
	try {
		const path = `./temp/${fileName}.json`;
		fs.writeFileSync(path, JSON.stringify(data, null, 2));
	} catch (error) {
		const parsedError = parseError(error);
		createLogger("./bot.log").error(
			{
				message: parsedError?.message,
				stack: parsedError?.stack,
			},
			"writeJsonToTempDir:error"
		);
	}
};
