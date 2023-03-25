import { intro, outro, confirm, select, spinner, isCancel, cancel, text } from "@clack/prompts";

const main = async () => {
	console.log();
	intro("Welcome to Arb-Solana-Bot Config Wizard!");

	const experienceLevel = await select({
		message: "What is your experience level?",
		options: [
			{ value: "beginner", label: "Beginner" },
			{ value: "intermediate", label: "Intermediate" },
			{ value: "god", label: "I've created this bot" },
		],
	});

	if (isCancel(experienceLevel)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}
};
