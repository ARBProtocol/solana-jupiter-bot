import fs from "fs";

export const writeJsonToTempDir = (
	fileName: string | number,
	data: unknown
) => {
	try {
		const path = `./temp/${fileName}.json`;
		fs.writeFileSync(path, JSON.stringify(data, null, 2));
	} catch (error) {
		console.log(error);
	}
};
