import { Store } from "../store";

export const createQueue = (store: Store) => {
	const getQueueCount = () => {
		return store.getState().bot.queue.count;
	};

	const getMaxAllowed = () => {
		return store.getState().bot.queue.maxAllowed;
	};

	const increaseQueueCount = () => {
		store.setState((state) => {
			state.bot.queue.count += 1;
		});
	};

	const decreaseQueueCount = () => {
		store.setState((state) => {
			state.bot.queue.count -= 1;
		});
	};

	const queue = {
		getCount: getQueueCount,
		getMaxAllowed: getMaxAllowed,
		increase: increaseQueueCount,
		decrease: decreaseQueueCount,
	};

	return queue;
};

export type Queue = ReturnType<typeof createQueue>;
