import { GlobalState } from "@arb-protocol/core";
import boxen from "boxen";

let output = "";
export const StatusBox = (state: GlobalState) => {
	output = "";

	output += `Bot Status: ${state.bot.status.value}\n`;
	// PROGRESS BAR BASED ON state.bot.status.updatedAt and performance.now()
	const max = 10 * 1000; // 10 seconds
	// if prorgess is 100% then repeat 50 times
	// 1 repeat = 1/50 = 0.02
	// 0.02 * 1000 = 20
	// DOnt use Data.now(), use performance.now()
	const repeat = Math.floor(((performance.now() - state.bot.status.updatedAt) / max) * 70);

	output += "▇".repeat(repeat) + "\n";
	output += `RUNNING FOR: ${
		state.bot?.startedAt ? (Date.now() - state.bot?.startedAt) / 1000 : "-"
	} s"\n`;
	output += `ITERATION: ${state.bot.iterationCount}\n`;
	output += " ".repeat(60);

	const box = boxen(output, {
		title: "Status",
		titleAlignment: "left",
		padding: 1,
		float: "left",
		borderStyle: "round",
	});

	return box;
};
