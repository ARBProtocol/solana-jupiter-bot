import boxen from "boxen";
import { GlobalState } from "../core";
import millify from "millify";

export const InfoBox = (state: GlobalState) => {
	const now = performance.now();
	const { lastIterationTimestamp, rateLimitPer } = state.bot;

	const iterationsPerValue =
		lastIterationTimestamp === 0 ? 0 : rateLimitPer / (now - lastIterationTimestamp);

	const arbProtocolBalance = millify(state.wallet.arbProtocolBalance.toNumber());

	const textBox = boxen(
		`
HODL: ${arbProtocolBalance} ARB !
STATUS: ${state.bot.status.value} (${(
			(performance.now() - state.bot.status.updatedAt) /
			1000
		).toFixed(2)}s ago)
RUNNING FOR: ${state.bot?.startedAt ? (Date.now() - state.bot?.startedAt) / 1000 : "-"} s
ITERATION: ${state.bot.iterationCount}
RATE LIMITER: ~ ${iterationsPerValue.toFixed()} / ${state.bot.rateLimit} per  ${
			state.bot.rateLimitPer
		} ms 
SWAP RATE LIMITER: ${state.swaps.rateLimiter.value} / ${state.swaps.rateLimiter.perMs / 1000}s  (${
			state.swaps.rateLimiter.max
		}) (active: ${state.swaps.rateLimiter.isActive})
QUEUE: ${state.bot.queue.count}/${state.bot.queue.maxAllowed}
ASSET: ${state.bot.currentInToken?.symbol} / ${state.bot.currentOutToken?.symbol}
PRICE: ${state.bot.price.current.decimal.toFixed(9)}
IN AMOUNT: ${state.routes.currentRoute.input.amount.decimal}
OUT AMOUNT: ${state.routes.currentRoute.output.amount.decimal}
TRADE AMOUNT: ${state.config.strategy.tradeAmount.number}
SUCCESS: ${state.swaps.success} / FAIL: ${state.swaps.fail} / TOTAL: ${
			state.swaps.total
		} / SUCCESS RATE: ${state.swaps.successRate}
LAST SWAP TIME: ${(state.swaps.swapTime / 1000).toFixed(2)} s
`,
		{
			title: "Info",
			titleAlignment: "left",
			padding: 1,
			float: "left",
			borderStyle: "round",
		}
	);

	return textBox;
};
