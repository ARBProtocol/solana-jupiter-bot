import { Store } from "../store";
import { SetStatus } from "./bot";

export const performanceTest = (store: Store, setStatus: SetStatus) => {
	console.count("performanceTest");
	setStatus("testingPerformance");
	const start = performance.now();
	for (let i = 0; i < 100; i++) {
		store.setState((state) => {
			state.bot.iterationCount++;
		});
	}
	// reset iteration count
	store.setState((state) => {
		state.bot.iterationCount = 0;
	});
	const end = performance.now();
	console.log(`Perf Test: ~${(end - start).toFixed()}ms`);
	setStatus("idle");
};
