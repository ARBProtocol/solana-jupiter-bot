import create from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";

import { GlobalState } from "./initial-state";
import produce from "immer";

export const createStore = (initialState: GlobalState) => {
	const store = create(subscribeWithSelector(() => initialState));

	const setStateWithImmer = (fn: (state: GlobalState) => void) => {
		store.setState((state) => {
			return produce(state, fn);
		});
	};

	return {
		...store,
		setState: setStateWithImmer,
	};
};

export type Store = ReturnType<typeof createStore>;

export const createCustomStore = <T>(initialState: T) => {
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
