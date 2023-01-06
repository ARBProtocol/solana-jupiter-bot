import boxen from "boxen";
import { GlobalState } from "./core";
import { UI } from "./cliui";

export const InfoBox = (ui: UI, state: GlobalState) => {
	const now = performance.now();
	const { lastIterationTimestamp, rateLimitPer } = state.bot;

	const iterationsPerValue =
		lastIterationTimestamp === 0 ? 0 : rateLimitPer / (now - lastIterationTimestamp);

	const textBox = boxen(
		`
STATUS: ${state.bot.status}
RUNNING FOR: ${state.bot?.startedAt ? (Date.now() - state.bot?.startedAt) / 1000 : "-"} s
ITERATION: ${state.bot.iterationCount}
RATE LIMITER: ~ ${iterationsPerValue.toFixed()} / ${state.bot.rateLimit} per  ${
			state.bot.rateLimitPer
		} ms 
SWAP RATE LIMITER: ${state.swaps.rateLimiter.value} / ${state.swaps.rateLimiter.perMs / 1000}s  (${
			state.swaps.rateLimiter.max
		}) (active: ${state.swaps.rateLimiter.isActive})
QUEUE: ${state.bot.queue.count}/${state.bot.queue.maxAllowed}
ASSET: ${state.config.tokens?.tokenA?.symbol} ${state.wallet.funds.tokenA} / ${
			state.config.tokens?.tokenB?.symbol
		} ${state.wallet.funds.tokenB}
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

	ui.div(textBox);

	return ui;
};
