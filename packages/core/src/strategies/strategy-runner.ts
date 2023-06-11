import EventEmitter from "node:events";
import { PublicBot } from "src/bot";
// import { Server } from "socket.io";
import { sleep } from "src/utils";
import { ulid } from "ulidx";
import { RunningStrategy, Strategy, UnknownStrategy } from "src/types/strategy";

export const StrategyRunner = (bot: PublicBot, maxConcurrent: number) => {
	const emitter = new EventEmitter();

	// const io = new Server(1337);

	const scheduledStrategies: {
		value: RunningStrategy[];
		length: number;
		push: (strategy: RunningStrategy) => void;
		shift: () => RunningStrategy | undefined;
		get: () => RunningStrategy[];
		purge: () => void;
	} = {
		value: [],
		length: 0,
		push(strategy) {
			this.value.push(strategy);
			this.length++;
			bot.store.setState((state) => {
				state.strategies.stats.scheduled++;
			});
			bot.setStatus("bot:scheduled");
			bot.logger.debug(
				`strategyRunner:scheduledStrategies:push +1 current:${this.length}`
			);
			emitter.emit("strategy:scheduled");
		},
		shift() {
			const value = this.value.shift();
			this.length--;
			bot.store.setState((state) => {
				state.strategies.stats.scheduled--;
			});
			bot.logger.debug(
				`strategyRunner:scheduledStrategies:removed -1 current: ${this.length}`
			);

			emitter.emit("strategy:running");
			return value;
		},
		get() {
			return this.value;
		},
		purge() {
			this.value = [];
			this.length = 0;
		},
	};

	const finishedStrategies: RunningStrategy[] = [];

	const liveStrategies = {
		value: 0,
		increment() {
			bot.store.setState((state) => {
				state.strategies.stats.running++;
				state.stats.global.iterations.value++;
				state.stats.global.iterations.updatedAtRel = performance.now();
			});
			this.value++;
		},
		decrement() {
			bot.store.setState((state) => {
				state.strategies.stats.running--;
			});
			this.value--;
		},
		get() {
			return this.value;
		},
	};
	let cancelled = false;
	// eslint not picking up ||= operator
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let running = false;

	const shouldSchedule = () => {
		return !cancelled && scheduledStrategies.length < maxConcurrent * 2;
	};

	const shouldRun = () => {
		return (
			!cancelled &&
			liveStrategies.value < maxConcurrent &&
			scheduledStrategies.length > 0 &&
			bot.limiters.iterationsRate.shouldAllow(performance.now()) &&
			bot.store.getState().limiters.aggregators.errorsRate.active === false
		);
	};

	const shouldReport = () => {
		return !cancelled && finishedStrategies.length > 0;
	};

	// check if there are any strategies to run
	if (bot.strategies.length === 0 || !bot.strategies[0]) {
		const msg = "strategyRunner: no strategies to run!";
		console.error(msg);
		bot.logger.error(msg);
		process.exit(1);
	}

	// TODO: instead of this run on all strategies
	const originalStrategy = bot.strategies[0];

	const scheduler = () => {
		if (shouldSchedule()) {
			bot.logger.debug(
				`strategyRunner:scheduler: scheduledStrategies: ${
					scheduledStrategies.length
				} liveStrategies: ${
					liveStrategies.value
				} cancelled: ${cancelled} limiter: ${
					bot.store.getState().limiters.iterationsRate.active
				}`
			);

			// mockup (should schedule all strategies)
			if (!originalStrategy) {
				const msg = "strategyRunner:scheduler: strategy is undefined";
				bot.logger.error(msg);
				throw new Error(msg);
			}
			const activeStrategies: UnknownStrategy[] = [originalStrategy];

			// TODO: maybe allow managing active strategies
			// const activeStrategies = bot.strategies.filter(
			// 	(strategy) => strategy.runtime.active
			// );

			if (activeStrategies.length === 0 || !activeStrategies[0]) {
				bot.logger.error("strategyRunner:scheduler: no active strategies");
				return;
			}

			// make copy of strategy
			const scheduledStrategy = { ...activeStrategies[0] } as RunningStrategy;

			//  mark strategy as scheduled
			bot.logger.debug(
				`strategyRunner:scheduler: scheduling strategy - ${scheduledStrategy?.id}`
			);

			// attach runtime
			scheduledStrategy.runtime = {
				id: ulid(),
				scheduled: true,
				scheduledAt: performance.now(),
			};

			// schedule strategy
			scheduledStrategies.push(scheduledStrategy);
		}
	};

	async function launcher() {
		if (shouldRun()) {
			running ||= true;
			liveStrategies.increment();

			const strategy = scheduledStrategies.shift();

			bot.logger.debug(
				`strategyRunner:launcher:run +1 current: ${liveStrategies.value}`
			);

			if (!strategy) {
				const msg = "strategyRunner:launcher: strategy is undefined";
				console.error(msg);
				bot.logger.error(msg);
				process.exit(1);
				return;
			}

			if (
				!strategy.runtime ||
				!strategy.runtime.id ||
				!strategy.runtime.scheduledAt
			) {
				const msg =
					"strategyRunner:launcher: strategy.runtime is undefined or missing properties";
				console.error(msg);
				bot.logger.error(msg);
				process.exit(1);
			}

			bot.logger.debug(
				`strategyRunner:launcher: strategy started, ID: ${
					strategy.id
				} at ITERATION: ${
					bot.store.getState().stats.global.iterations.value
				} after ${performance.now() - strategy.runtime.scheduledAt} ms`
			);

			/**
			 * run strategy without waiting for it to finish,
			 * this is to allow for multiple strategies to run at the same time
			 */
			strategy.run(strategy.runtime.id, bot, finisher);

			bot.setStatus("bot:launched");
		}
	}

	const finisher = <T>(
		strategy:
			| Strategy<T extends Record<string, unknown> ? T : never>
			| RunningStrategy
	) => {
		bot.setStatus("bot:finished");
		if ("runtime" in strategy === false) {
			const msg = "strategyRunner:finisher: strategy.runtime is undefined";
			console.error(msg);
			bot.logger.error(msg);
			process.exit(1);
		}

		const runningStrategy = strategy as RunningStrategy;

		//TODO: do we still need this?
		// console.log("finisher, strategy: ", strategy);
		bot.logger.debug(
			`strategyRunner:finisher: started after ${
				runningStrategy.runtime.scheduledAt
					? runningStrategy.runtime.scheduledAt - performance.now()
					: "unknown "
			}ms`
		);

		liveStrategies.decrement();

		emitter.emit("strategy:finished");
		bot.logger.debug("strategyRunner:finisher: done");
	};

	/// handle finished strategies (reporting, etc.)

	const reporter = () => {
		bot.logger.debug("strategyRunner:reporter: started");
		bot.store.setState((state) => {
			state.strategies.stats.completed++;
		});

		//TODO: do we still need this?

		bot.logger.debug("strategyRunner:reporter: done");
	};

	const canceller = () => {
		if (bot.store.getState().status.value === "bot:stopping") return;

		bot.logger.info(
			"strategyRunner:canceller: called! waiting for strategies..."
		);
		cancelled = true;
		bot.setStatus("bot:stopping");

		// purge scheduled strategies
		scheduledStrategies.purge();

		// wait for all strategies to finish with max timeout of 10 seconds
		const timeout = 5 * 1000;
		const start = Date.now();
		const interval = 100;
		const check = () => {
			if (liveStrategies.value === 0) {
				bot.logger.info("strategyRunner:canceller: all strategies finished");
				bot.setStatus("bot:stopped");
				bot.setStatus("!shutdown");
				return;
			}
			if (Date.now() - start > timeout) {
				bot.logger.info(
					"strategyRunner:canceller: timeout reached, cancelling..."
				);
				return;
			}
			setTimeout(check, interval);
		};

		check();

		setTimeout(() => {
			if (scheduledStrategies.length === 0) {
				bot.logger.info(
					"strategyRunner:canceller: no more scheduled strategies, exiting..."
				);
				process.exit(0);
			}
		}, 30000);
	};

	async function run() {
		// Stop the bot on stop request
		bot.onStatusChange("bot:stop", canceller);

		bot.logger.info("strategyRunner:run: started");
		running = true;

		//TODO: finish WS integration
		// io.on("connection", (socket) => {
		// 	bot.logger.info("strategyRunner:socket: client connected");
		// 	socket.on("disconnect", () => {
		// 		bot.logger.info("strategyRunner:socket: client disconnected");
		// 	});
		// });

		// emitter.on("strategy:scheduled", () => {
		// 	// io.emit("strategy:scheduled", {
		// 	// 	sentAt: Date.now(),
		// 	// });
		// 	launcher();
		// });
		// emitter.on("strategy:launched", finisher);
		// emitter.on("message", (message) => {
		// 	console.log("message", message);
		// 	// scheduler();
		// });
		emitter.on("strategy:finished", () => {
			// io.emit("strategy:finished");
			scheduler();
			reporter();
		});

		if (maxConcurrent === 0 || maxConcurrent > 10) {
			bot.logger.error(
				"strategyRunner:maxConcurrent is not set or is too high"
			);
			throw new Error("strategyRunner:maxConcurrent is not set or is too high");
		}

		// run scheduler for the first time
		for (let i = 0; i < maxConcurrent; i++) {
			await sleep(1500);
			scheduler();
		}

		setInterval(launcher, 100);

		// run scheduler every time a limiter is released
		bot.store.subscribe(
			(state) => state.limiters.iterationsRate.active === false,
			scheduler
		);
	}

	return {
		run,
		cancel: canceller,
	};
};
