import { GlobalState } from "@arb-protocol/core";
import boxen from "../lib/boxen";
import { Bot } from "../core";
import chalk from "chalk";
import gradient from "gradient-string";

const GRADIENT_4 = ["#00c4fd", "#fbc417", "#ff713c", "#d52465"];
const GRADIENT_3 = ["#00c4fd", "#fbc417", "#ff713c"];
const GRADIENT_2 = ["#00c4fd", "#fbc417"];
const GRADIENT_1 = ["#A48BF9", "#00c4fd"];

let step = 0;

const formatTrailingZeros = (string?: string) => {
	if (!string) return "";
	const match = string.match(/^(.*[^0])(0+)$/);

	let result = string;
	if (match) {
		const [_, prefix, suffix] = match;
		result = `${prefix}${suffix ? "".padEnd(suffix.length, " ") : ""}`;
	}
	return result;
};

export const AggregatorBox = (bot: Bot, state: GlobalState) => {
	// Aggregator name
	const aggregatorId = bot.aggregators[0]?.id || "Unknown";
	const aggState = state.stats.aggregators[aggregatorId];

	// arrows animation
	step === 0 ? (step = 1) : (step = 0);
	let output = "";

	// Aggregator status
	const computedRoutes = aggState?.calls?.computeRoutes?.value ?? 0;

	output +=
		"Route computation requests: " +
		chalk.hex("#A48BF9")(computedRoutes) +
		chalk.dim(" (total)") +
		"\n\n";

	const hops = state.strategies.current.hops;

	if (hops) {
		// count duplicates
		const duplicates = hops.reduce((acc, hop) => {
			acc[hop] = (acc[hop] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		output += chalk.bold("CURRENT HOPS ") + chalk.dim("x" + hops.length) + "\n";
		output += Object.entries(duplicates).map(([hop, count]) => {
			return ` ${hop} ` + chalk.dim("x") + chalk.hex("#00c4fd")(count);
		});
		output += "\n\n";
	}

	const errors = aggState?.errors;
	// Errors
	output += chalk.bold("ERRORS") + "\n";

	output += errors?.missingData?.value ? chalk.hex("#d52465")("▌") : chalk.hex("#A48BF9")("▌");
	const missingData = "Missing Data: " + (errors?.missingData?.value ?? 0);
	output += missingData.padEnd(20, " ");

	output += errors?.rpc429?.value ? chalk.hex("#d52465")("▌") : chalk.hex("#A48BF9")("▌");
	const rpc429 = "RPC 429: " + (errors?.rpc429?.value ?? 0);
	output += rpc429.padEnd(20, " ");
	output += "\n";

	output += errors?.rpcOther?.value ? chalk.hex("#d52465")("▌") : chalk.hex("#A48BF9")("▌");
	const rpcOther = "RPC Other: " + (errors?.rpcOther?.value ?? 0);
	output += rpcOther.padEnd(20, " ");

	output += errors?.unknown?.value ? chalk.hex("#d52465")("▌") : chalk.hex("#A48BF9")("▌");
	const unknown = "Unknown: " + (errors?.unknown?.value ?? 0);
	output += unknown.padEnd(20, " ");
	output += "\n";

	// Limiters
	output += "\n";
	output += chalk.bold("LIMITERS") + "\n";

	if (state.limiters.aggregators.errorsRate.enabled) {
		const isActive = state.limiters.aggregators.errorsRate.active;

		output += isActive ? chalk.hex("#d52465")("▌") : chalk.hex("#00c4fd")("▌");
		output += "Errors Rate: ";
		output += state.limiters.aggregators.errorsRate.current ?? 0;
		output += " /";
		output += state.limiters.aggregators.errorsRate.max ?? 0;
		output += chalk.dim("err");
		output += " ~ ";
		output += chalk.dim(
			((state.limiters.aggregators.errorsRate.timeWindowMs ?? 0) / 1000).toString() + "s"
		);
		output += "      ";
		isActive && (output += chalk.bgHex("#d52465")(" ACTIVE "));
		const timeLeft = state.limiters.aggregators.errorsRate.cooldownUntilRel - performance.now();

		if (timeLeft > 0) {
			const cooldownMs = state.limiters.aggregators.errorsRate.cooldownMs ?? 0;

			const currentGradient =
				timeLeft > 0
					? timeLeft < cooldownMs / 4
						? GRADIENT_1
						: timeLeft < cooldownMs / 2
						? GRADIENT_2
						: timeLeft < cooldownMs * 0.75
						? GRADIENT_3
						: GRADIENT_4
					: GRADIENT_1;

			output += gradient(currentGradient)(
				" COOLDOWN " +
					Math.ceil(
						(state.limiters.aggregators.errorsRate.cooldownUntilRel - performance.now()) / 1000
					) +
					"s "
			);
		}
	}

	output += "\n";

	return boxen(output, {
		title: `Aggregator · ${aggregatorId} ·`,
		titleAlignment: "left",
		padding: 1,
		float: "left",
		borderStyle: "round",
		width: 70,
		height: 16,
	});
};
