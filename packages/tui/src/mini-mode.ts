import { GlobalState } from "@arb-protocol/core";

/**
 * Returns the mini mode one line output
 */
export const miniMode = (state: GlobalState) => {
	const status = `${state.status.value} (${((Date.now() - state.status.updatedAt) / 1000).toFixed(
		2
	)}s)`;
	// const time = `${
	// 	state.isStarted.updatedAt ? (Date.now() - state.isStarted.updatedAt) / 1000 : "-"
	// } s`;
	// const iteration = `${state.iteration.value}`;
	// const asset = ` ${state.bot.currentInToken?.symbol} / ${state.bot.currentOutToken?.symbol}`;
	// const price = `${state.bot.price.current.decimal.toFixed(9)}`;
	// const inAmount = `${state.routes.currentRoute.input.amount.decimal}`;
	// const outAmount = `${state.routes.currentRoute.output.amount.decimal}`;
	// const slippage = `${
	// 	state.config.strategy.rules?.slippage?.enableAutoSlippage
	// 		? `AUTO (${
	// 				state.config.strategy.rules?.slippage?.bps
	// 					? state.config.strategy.rules?.slippage?.bps / 100 + " %"
	// 					: ""
	// 		  }%)`
	// 		: state.config.strategy.rules?.slippage?.bps
	// 		? (state.config.strategy.rules?.slippage?.bps / 100).toFixed(2) + " %"
	// 		: ""
	// }`;

	// return `${time} |   I: ${iteration} |   ${status} | ${asset} |  ${inAmount} -> ${outAmount} |   ${price} |  S: ${slippage} `;
	return `${status} TODO: FIX THIS MINI MODE`;
};
// TODO!
