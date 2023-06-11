import fs from "fs";
import { parseError } from "./parse-error";
import { logger } from "src/logger";

export const writeJsonToTempDir = (
	fileName: string | number,
	data: unknown
) => {
	try {
		const path = `./temp/${fileName}.json`;
		fs.writeFileSync(path, JSON.stringify(data, null, 2));
	} catch (error) {
		const parsedError = parseError(error);
		logger.error(
			{
				message: parsedError?.message,
				stack: parsedError?.stack,
			},
			"writeJsonToTempDir:error"
		);
	}
};
