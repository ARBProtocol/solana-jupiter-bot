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
import { Config as BotConfig } from "@arb-protocol/core";

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

	let welcomeMsg = ["Welcome to Arb-Solana-Bot v2.0.0-alpha.3 Config Wizard!\n"];
	welcomeMsg.push("This wizard will help you generate a config.json file\n");
	welcomeMsg.push("Due to problems found during testing, ");
	welcomeMsg.push("only the ping-pong strategy is currently available... Sorry!\n");
	welcomeMsg.push("Arbitrage strategy and more coming soon... Stay tuned!");
	intro(welcomeMsg.join("\n     "));

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
			placeholder: "0.5",
			validate: (value) => {
				if (value.length === 0) return "Please enter a slippage";
				const slippage = parseFloat(value);
				if (isNaN(slippage)) return "Please enter a valid number";
				if (slippage < 0) return "Please enter a positive number";
				if (slippage > 100) return "Please enter a number less than 100";
			},
		});

		if (isCancel(slippage)) {
			cancel("Operation cancelled");
			return process.exit(0);
		}

		if (!slippage) {
			cancel("Slippage is invalid");
			return process.exit(1);
		}
	} else slippage = "0";

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
		message: "What is the profit threshold? / Execute tx when expected profit is above {x} %",
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
	let priorityFeeMicroLamports: number | undefined;
	let pendingTransactionsLimiter = 1;
	let executionRateLimiter = {
		max: 1,
		timeWindowMs: 20_000,
	};
	let iterationsRateLimiter = {
		max: 1,
		timeWindowMs: 5000,
	};

	if (experienceLevel !== "beginner") {
		features = await multiselect({
			message: "What features do you want to setup?",
			options: [
				{ value: "backOff", label: "Back off - wait on failure, shutdown on max failure count" },
				{ value: "priorityFeeMicroLamports", label: "Priority fee in µLamports" },
				{ value: "pendingTransactionsLimiter", label: "Pending transactions limiter" },
				{ value: "executionRateLimiter", label: "Execution rate limiter" },
				{ value: "iterationsRateLimiter", label: "Iterations rate" },
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

		// Priority fee
		if (features.includes("priorityFeeMicroLamports")) {
			const priorityFeeMicroLamportsValue = await text({
				message: "What is the priority fee in µLamports?",
				placeholder: "500",
				validate: (value) => {
					if (value.length === 0) return "Please enter a priority fee";
					const priorityFeeMicroLamportsValue = parseInt(value);
					if (isNaN(priorityFeeMicroLamportsValue)) return "Please enter a valid number";
					if (priorityFeeMicroLamportsValue < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(priorityFeeMicroLamports)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}

			if (typeof priorityFeeMicroLamportsValue === "string") {
				priorityFeeMicroLamports = parseInt(priorityFeeMicroLamportsValue);
			}
		}

		// Pending transactions limiter
		if (features.includes("pendingTransactionsLimiter")) {
			const pendingTransactionsLimiterValue = await text({
				message: "What is the pending transactions limit (at the same time)?",
				placeholder: "1",
				validate: (value) => {
					if (value.length === 0) return "Please enter a pending transactions limit";
					const pendingTransactionsLimiterValue = parseInt(value);
					if (isNaN(pendingTransactionsLimiterValue)) return "Please enter a valid number";
					if (pendingTransactionsLimiterValue < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(pendingTransactionsLimiterValue)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}

			if (typeof pendingTransactionsLimiterValue === "string") {
				pendingTransactionsLimiter = parseInt(pendingTransactionsLimiterValue);
			}
		}

		// Execution rate limiter
		if (features.includes("executionRateLimiter")) {
			const executionRateLimiterTimeWindowMs = await text({
				message: "What is the execution rate limit time window (in seconds)?",
				placeholder: "20",
				validate: (value) => {
					if (value.length === 0) return "Please enter a execution rate limit time window";
					const executionRateLimiterTimeWindowMs = parseInt(value);
					if (isNaN(executionRateLimiterTimeWindowMs)) return "Please enter a valid number";
					if (executionRateLimiterTimeWindowMs < 0) return "Please enter a positive number";
				},
			});

			const executionRateLimiterMax = await text({
				message: `What is the execution rate limit (max per ${
					executionRateLimiterTimeWindowMs as string
				} sec)?`,
				placeholder: "1",
				validate: (value) => {
					if (value.length === 0) return "Please enter a execution rate limit";
					const executionRateLimiterMax = parseInt(value);
					if (isNaN(executionRateLimiterMax)) return "Please enter a valid number";
					if (executionRateLimiterMax < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(executionRateLimiterTimeWindowMs) || isCancel(executionRateLimiterMax)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}

			if (
				typeof executionRateLimiterTimeWindowMs === "string" &&
				typeof executionRateLimiterMax === "string"
			) {
				executionRateLimiter = {
					max: parseInt(executionRateLimiterMax),
					timeWindowMs: parseInt(executionRateLimiterTimeWindowMs) * 1000,
				};
			}
		}

		if (features.includes("iterationsRateLimiter")) {
			const iterationsRateLimiterTimeWindowMs = await text({
				message: "What is the iterations rate time window (in seconds)?",
				placeholder: "5",
				validate: (value) => {
					if (value.length === 0) return "Please enter a iterations rate time window";
					const iterationsRateLimiterTimeWindowMs = parseInt(value);
					if (isNaN(iterationsRateLimiterTimeWindowMs)) return "Please enter a valid number";
					if (iterationsRateLimiterTimeWindowMs < 0) return "Please enter a positive number";
				},
			});

			const iterationsRateLimiterMax = await text({
				message: `What is the iterations rate limit (max per ${
					iterationsRateLimiterTimeWindowMs as string
				} sec)?`,
				placeholder: "1",
				validate: (value) => {
					if (value.length === 0) return "Please enter a iterations rate limit";
					const iterationsRateLimiterMax = parseInt(value);
					if (isNaN(iterationsRateLimiterMax)) return "Please enter a valid number";
					if (iterationsRateLimiterMax < 0) return "Please enter a positive number";
				},
			});

			if (isCancel(iterationsRateLimiterTimeWindowMs) || isCancel(iterationsRateLimiterMax)) {
				cancel("Operation cancelled");
				return process.exit(0);
			}

			if (
				typeof iterationsRateLimiterTimeWindowMs === "string" &&
				typeof iterationsRateLimiterMax === "string"
			) {
				iterationsRateLimiter = {
					max: parseInt(iterationsRateLimiterMax),
					timeWindowMs: parseInt(iterationsRateLimiterTimeWindowMs) * 1000,
				};
			}
		}
	}

	// Arb Protocol BuyBack
	const arbProtocolBuyBack = await confirm({
		message:
			"[Arb Protocol BuyBack]\n" +
			"·   Support Arb Protocol by $ARB accumulation ONLY on profitable trades?".padStart(8, " "),
	});

	if (isCancel(arbProtocolBuyBack)) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	let arbProtocolBuyBackProfitPercent: number | undefined;
	if (arbProtocolBuyBack) {
		const arbProtocolBuyBackValue = await text({
			message:
				"[Arb Protocol BuyBack]\n" +
				"·   How much % of profit do you want to BuyBack into $ARB? (experimental)",
			initialValue: "5",
			validate: (value) => {
				if (value.length === 0) return "Please enter a valid number";
				const arbProtocolBuyBackValue = parseInt(value);
				if (isNaN(arbProtocolBuyBackValue)) return "Please enter a valid number";
				if (arbProtocolBuyBackValue <= 0) return "Please enter a positive number";
			},
		});

		if (isCancel(arbProtocolBuyBackValue)) {
			cancel("Operation cancelled");
			return process.exit(0);
		}

		if (typeof arbProtocolBuyBackValue === "string") {
			arbProtocolBuyBackProfitPercent = parseInt(arbProtocolBuyBackValue);
		}
	}

	const confirmConfig = await confirm({
		message: "Confirm config?",
	});

	if (isCancel(confirmConfig) || !confirmConfig) {
		cancel("Operation cancelled");
		return process.exit(0);
	}

	type Config = Omit<BotConfig, "rpcURLs" | "rpcWSSs" | "wallets"> & {
		$schema: string;
		tui: { allowClearConsole: boolean };
		strategy: {
			id: string;
			amount: number;
			executeAboveExpectedProfitPercent: number;
			priorityFeeMicroLamports?: number;
			slippage: {
				bps: number;
				enableAutoSlippage: boolean;
			};
			tokens: string[];
		};
	};

	const config: Config = {
		$schema: "./src/config.schema.json",
		strategy: {
			id: "ping-pong",
			amount: parseFloat(tradeAmount),
			executeAboveExpectedProfitPercent: parseFloat(profitThreshold),
			slippage: {
				bps: parseInt((parseFloat(slippage) * 100).toFixed(0)),
				enableAutoSlippage: slippageStrategy === "auto",
			},
			tokens: [tokenA.address, tokenB.address],
			priorityFeeMicroLamports:
				features?.includes("priorityFeeMicroLamports") && priorityFeeMicroLamports
					? priorityFeeMicroLamports
					: undefined,
		},
		maxConcurrent: 1,
		tui: {
			allowClearConsole: true,
		},
		limiters: {
			transactions: {
				pending: {
					enabled: true,
					max: pendingTransactionsLimiter,
				},
				executionRate: {
					enabled: true,
					max: executionRateLimiter?.max,
					timeWindowMs: executionRateLimiter?.timeWindowMs,
				},
			},
			iterationsRate: {
				enabled: true,
				max: iterationsRateLimiter?.max,
				timeWindowMs: iterationsRateLimiter?.timeWindowMs,
			},
		},
	};

	if (arbProtocolBuyBack && arbProtocolBuyBackProfitPercent) {
		config.arbProtocolBuyBack = {
			enabled: true,
			profitPercent: arbProtocolBuyBackProfitPercent,
		};
	}

	fs.writeFileSync("./config.json", JSON.stringify(config, null, 2), "utf8");

	outro("Config generated, happy trading!");
};
