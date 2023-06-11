import fs from "fs";

export const createTempDir = () => {
	try {
		const path = "./temp";
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	} catch (error) {
		console.error("createTempDir:error", error);
		process.exit(1);
	}
};
