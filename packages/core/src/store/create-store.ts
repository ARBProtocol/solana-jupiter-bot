import create from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
import produce from "immer";
import { GlobalState } from "src/types/global-state";

export const createStore = <T>(initialState: T) => {
	const store = create(subscribeWithSelector(() => initialState));

	const setStateWithImmer = (fn: (state: T) => void) => {
		store.setState((state) => {
			return produce(state, fn);
		});
	};

	return {
		...store,
		setState: setStateWithImmer,
	};
};

export type Store<T> = ReturnType<typeof createStore<T>>;

export type GlobalStore = Store<GlobalState>;
