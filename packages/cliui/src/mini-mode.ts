import { GlobalState } from "@arb-protocol/core";

/**
 * Returns the mini mode one line output
 */
export const miniMode = (state: GlobalState) => {
	const status = `${state.bot.status.value} (${(
		(performance.now() - state.bot.status.updatedAt) /
		1000
	).toFixed(2)}s)`;
	const time = `${state.bot?.startedAt ? (Date.now() - state.bot?.startedAt) / 1000 : "-"} s`;
	const iteration = `${state.bot.iterationCount}`;
	const asset = ` ${state.bot.currentInToken?.symbol} / ${state.bot.currentOutToken?.symbol}`;
	const price = `${state.bot.price.current.decimal.toFixed(9)}`;
	const inAmount = `${state.routes.currentRoute.input.amount.decimal}`;
	const outAmount = `${state.routes.currentRoute.output.amount.decimal}`;
	const slippage = `${
		state.config.strategy.rules?.slippage?.enableAutoSlippage
			? `AUTO (${
					state.config.strategy.rules?.slippage?.bps
						? state.config.strategy.rules?.slippage?.bps / 100 + " %"
						: ""
			  }%)`
			: state.config.strategy.rules?.slippage?.bps
			? (state.config.strategy.rules?.slippage?.bps / 100).toFixed(2) + " %"
			: ""
	}`;

	return `${time} |   I: ${iteration} |   ${status} | ${asset} |  ${inAmount} -> ${outAmount} |   ${price} |  S: ${slippage} `;
};
// TODO!
