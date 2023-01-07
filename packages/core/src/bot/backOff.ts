import { Store } from "../store";
import { sleep } from "../utils";
import { SetStatus } from "./bot";

export const backOff = async (store: Store, setStatus: SetStatus) => {
	const backOffState = store.getState().bot.backOff;
	if (!backOffState.enabled) return;

	// shutdown the bot if backOff count is greater than shutdownOnCount
	if (
		backOffState?.shutdownOnCount &&
		backOffState.count >= backOffState.shutdownOnCount
	) {
		// log backOff exceeded
		console.warn(`backOff reached max ${backOffState.shutdownOnCount} retries`);
		return setStatus("!shutdown");
	}

	// increase backOff counter
	store.setState((state) => {
		state.bot.backOff.count++;
	});

	setStatus("backOff");

	// trigger backOff
	await sleep(backOffState.ms);

	setStatus("idle");
};
