import fs from "fs";
import {
	intro,
	outro,
	confirm,
	select,
	spinner,
	isCancel,
	cancel,
	text,
	multiselect,
} from "@clack/prompts";
import { TOKEN_LIST_URL } from "@jup-ag/core";
import axios from "axios";
import { ConfigRequired } from "@arb-protocol/core";

type Token = {
	address: string;
	chainId: number;
	decimals: number;
	name: string;
	symbol: string;
	logoURI: string;
	tags: string[];
};

export const runWizard = async () => {
	console.log();

	intro("Welcome to Arb-Solana-Bot Config Wizard!");

	const loadingTokens = spinner();
	loadingTokens.start("Loading tokens...");

	const jupiterTokens = await axios
		.get(TOKEN_LIST_URL["mainnet-beta"])
		.then((res) => res.data as Token[]);

	if (!jupiterTokens || jupiterTokens.length === 0) {
		console.log("No tokens found");
		return process.exit(0);
	}

	loadingTokens.stop(`Loaded ${jupiterTokens.length} tokens`);

	const experienceLevel = await select({
		message: "What is your experience level?",
		options: [
			{ value: "beginner", label: "Beginner" },
			{ value: "intermediate", label: "Intermediate" },
		],
	});

	if (isCancel(experienceLevel)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	const tokenASymbol = await text({
		message: "What is the token A?",
		placeholder: "ARB",
		validate: (value) => {
			if (value.length === 0) return "Please enter a token";
			const token = jupiterTokens.find(
				(token) =>
					token.symbol === value || token.symbol.toLocaleLowerCase() === value.toLocaleLowerCase()
			);
			if (!token) {
				const possibleTokens = jupiterTokens.filter((token) =>
					token.symbol.toLocaleLowerCase().includes(value.toLocaleLowerCase())
				);
				if (possibleTokens.length === 0) return "Token not found";
				return `Did you mean ${possibleTokens.map((token) => token.symbol).join(", ")}?`;
			}
		},
	});

	if (isCancel(tokenASymbol)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	const tokenA = jupiterTokens.find(
		(token) =>
			token.symbol === tokenASymbol ||
			token.symbol.toLocaleLowerCase() === (tokenASymbol as string).toLocaleLowerCase()
	);

	const tokenBSymbol = await text({
		message: "What is the token B?",
		placeholder: "ARB",
		validate: (value) => {
			if (value.length === 0) return "Please enter a token";
			const token = jupiterTokens.find(
				(token) =>
					token.symbol === value || token.symbol.toLocaleLowerCase() === value.toLocaleLowerCase()
			);
			if (!token) {
				const possibleTokens = jupiterTokens.filter((token) =>
					token.symbol.toLocaleLowerCase().includes(value.toLocaleLowerCase())
				);
				if (possibleTokens.length === 0) return "Token not found";
				return `Did you mean ${possibleTokens.map((token) => token.symbol).join(", ")}?`;
			}
		},
	});

	const tokenB = jupiterTokens.find(
		(token) =>
			token.symbol === tokenBSymbol ||
			token.symbol.toLocaleLowerCase() === (tokenBSymbol as string).toLocaleLowerCase()
	);

	if (!tokenA || !tokenB) throw new Error("Some tokens are invalid");

	const slippageStrategy = await select({
		message: "What is the slippage strategy?",
		options: [
			{ value: "fixed", label: "Fixed %" },
			{ value: "auto", label: "Auto - try to prevent loss" },
		],
	});

	let slippage;
	if (slippageStrategy === "fixed") {
		slippage = await text({
			message: "What is the slippage?",
			placeholder: "0.5 %",
			validate: (value) => {
				if (value.length === 0) return "Please enter a slippage";
				const slippage = parseFloat(value);
				if (isNaN(slippage)) return "Please enter a valid number";
				if (slippage < 0) return "Please enter a positive number";
				if (slippage > 100) return "Please enter a number less than 100";
			},
		});
	}

	const tradeAmount = await text({
		message: "What is the trade amount?",
		placeholder: "0.69",
		validate: (value) => {
			if (value.length === 0) return "Please enter a trade amount";
			const tradeAmount = parseFloat(value);
			if (isNaN(tradeAmount)) return "Please enter a valid number";
			if (tradeAmount < 0) return "Please enter a positive number";
		},
	});

	if (isCancel(tradeAmount)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	const profitThreshold = await text({
		message: "What is the profit threshold? / Execute tx when profit is above {x} %",
		placeholder: "0.42",
		validate: (value) => {
			if (value.length === 0) return "Please enter a profit threshold";
			const profitThreshold = parseFloat(value);
			if (isNaN(profitThreshold)) return "Please enter a valid number";
			if (profitThreshold < 0) return "Please enter a positive number";
		},
	});

	if (isCancel(profitThreshold)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	let backOffTime, backOffShutdownOnCount, features;

	if (experienceLevel !== "beginner") {
		features = await multiselect({
			message: "What features do you want to enable?",
			options: [
				{ value: "backOff", label: "Back off - wait on failure, shutdown on max failure count" },
			],
			required: false,
		});

		if (isCancel(features)) {
			cancel("Operation cancelled");
			return process.exit(0);
		}

		if (features.includes("backOff")) {
			backOffTime = await text({
				message:
					"[BackOff Feature 1/2] What is the back off time? / Wait {x} seconds before retrying",
				placeholder: "60",
				validate: (value) => {
					if (value.length === 0) return "Please enter a back off time";
					const backOffTime = parseInt(value);
					if (isNaN(backOffTime)) return "Please enter a valid number";
					if (backOffTime < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(backOffTime)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}

			backOffShutdownOnCount = await text({
				message:
					"[BackOff Feature 2/2] What is the shutdown on count? / Shutdown after {x} failures",
				placeholder: "3",
				validate: (value) => {
					if (value.length === 0) return "Please enter a back off shutdown on count";
					const backOffShutdownOnCount = parseInt(value);
					if (isNaN(backOffShutdownOnCount)) return "Please enter a valid number";
					if (backOffShutdownOnCount < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(backOffShutdownOnCount)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}
		}
	}

	const confirmConfig = await confirm({
		message: "Confirm config?",
	});

	if (isCancel(confirmConfig)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	type Config = Omit<ConfigRequired, "privateKey" | "ammsToExclude" | "rpcURL"> & {
		$schema: string;
	};

	const config: Config = {
		$schema: "./src/config.schema.json",
		tokens: {
			tokenA: { address: tokenA?.address },
			tokenB: { address: tokenB?.address },
		},
		strategy: {
			id: "ping-pong",
			tradeAmount: parseFloat(tradeAmount),
			rules: { execute: { above: { potentialProfit: parseFloat(profitThreshold) } } },
		},
		backOff: {
			enabled: features?.includes("backOff"),
			ms: (backOffTime && parseInt(backOffTime) * 1000) || undefined,
			shutdownOnCount: (backOffShutdownOnCount && parseInt(backOffShutdownOnCount)) || undefined,
		},
	};

	fs.writeFileSync("./config.json", JSON.stringify(config, null, 2), "utf8");

	outro("Config generated");
};

// main().catch(console.error);
