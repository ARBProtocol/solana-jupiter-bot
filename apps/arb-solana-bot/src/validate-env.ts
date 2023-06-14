import { z } from "@arb-protocol/core";
import chalk from "chalk";
import fs from "fs";
import { fromZodError } from "zod-validation-error";
import * as dotenv from "dotenv";

const EnvSchema = z.object({
	DEFAULT_RPC: z
		.string()
		.regex(
			/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/
		),
	SOLANA_WALLET_PRIVATE_KEY: z.string(),
	ROUTE_COMPUTATION_TIMEOUT_MS: z.coerce.number().min(1000).max(120000).optional(),
	TUI_FPS: z.coerce.number().min(1).max(14).default(5),
});

export const validateEnv = async () => {
	// load .env file
	dotenv.config();

	if (!fs.existsSync("./.env")) {
		console.log(`
		No .env file found!
		# What to do?
		- copy .env.example to .env
		- fill in the values correctly
		`);
		process.exit(1);
	}

	try {
		const result = EnvSchema.parse(process.env);

		return result;
	} catch (error) {
		console.log(chalk.red("Invalid environment variables!/n Check details below:\n\n"));
		// @ts-expect-error
		const validationError = fromZodError(error);

		validationError.details.forEach((detail) => {
			console.log(chalk.yellow(detail.path.join(".") + ": " + chalk.red(detail.message)));
		});
		console.log("\n\n");
		process.exit(1);
	}
};
