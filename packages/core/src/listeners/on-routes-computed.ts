import { PublicBot } from "src/bot";
import { shiftAndPush } from "src/utils";

/**
 * This listener is used to count the number of times the bot has computed routes per second.
 * Results are stored in the `computedRoutesPerSecond` chart (state).
 */
export const onRoutesComputed = (bot: PublicBot) => {
	let counter = 0;

	const eventHandler = () => counter++;

	bot.onStatusChange("aggregator:computingRoutesSuccess", eventHandler);
	bot.onStatusChange("aggregator:computingRoutesError", eventHandler);

	// every second update computedRoutesPerSecond chart
	setInterval(() => {
		const prevCounter = counter;
		counter = 0;
		bot.store.setState((state) => {
			state.chart.computedRoutesPerSecond.values = shiftAndPush(
				state.chart.computedRoutesPerSecond.values,
				prevCounter
			);
			state.chart.computedRoutesPerSecond.updatedAtRel = performance.now();
		});
	}, 1000);
};
