import { GlobalStore } from "src/store";
import { BotStatus } from "src/types/bot-status";

export const createOnStatusChange =
	(store: GlobalStore) =>
	(
		observedStatus: BotStatus | "*",
		callback: ({
			store,
			status,
			prevStatus,
		}: {
			store: GlobalStore;
			status: BotStatus;
			prevStatus: BotStatus;
		}) => void
	) => {
		const isWildCard = observedStatus === "*";
		store.subscribe(
			(state) => state.status.value,
			(status, prevStatus) => {
				if (
					isWildCard ||
					(status === observedStatus && prevStatus !== observedStatus)
				) {
					callback({ store, status, prevStatus });
				}
			}
		);
	};
