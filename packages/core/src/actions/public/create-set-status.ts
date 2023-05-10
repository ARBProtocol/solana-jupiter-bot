import { GlobalStore } from "src/store";
import { BotStatus } from "src/types/bot-status";

export const createSetStatus = (store: GlobalStore) => (status: BotStatus) => {
	store.setState((state) => {
		state.status = {
			value: status,
			updatedAt: performance.now(),
		};
	});
};

export type SetStatus = ReturnType<typeof createSetStatus>;
