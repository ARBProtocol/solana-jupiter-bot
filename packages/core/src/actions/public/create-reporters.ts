import { GlobalStore } from "src/store";
import { Logger } from "./create-logger";
import { shiftAndPush } from "src/utils";
import { z } from "zod";

export const createReporters = (store: GlobalStore, logger: Logger) => {
	const reporters = {
		reportExpectedProfitPercent: (expectedProfitPercent: number) => {
			logger.info(`expectedProfitPercent: ${expectedProfitPercent}`);

			// validate expectedProfitPercent
			const validated = z.number().finite().safeParse(expectedProfitPercent);

			if (!validated.success) {
				const msg = `expectedProfitPercent:validation:error: ${validated.error.message}`;
				console.error(`
				ERROR  ${validated.error.message}
				CAUSE: expectedProfitPercent:validation

				You're reporting an invalid expectedProfitPercent value.

				Value received: ${expectedProfitPercent}
				Value expected: number

				`);
				logger.error(msg);
				process.exit(1);
			}

			logger.info(`expectedProfitPercent:validated: ${validated.data}`);

			store.setState((state) => {
				state.strategies.current.expectedProfitPercent = expectedProfitPercent;
				// update chart
				state.chart.expectedProfitPercent.values = shiftAndPush(
					state.chart.expectedProfitPercent.values,
					expectedProfitPercent
				);
				state.chart.expectedProfitPercent.updatedAtRel = performance.now();
			});
		},
		reportUnrealizedProfitPercent: (unrealizedProfitPercent: number) => {
			logger.info(`unrealizedProfitPercent: ${unrealizedProfitPercent}`);

			// validate unrealizedProfitPercent
			const validated = z.number().finite().safeParse(unrealizedProfitPercent);

			if (!validated.success) {
				const msg = `unrealizedProfitPercent:validation:error: ${validated.error.message}`;
				console.error(`
				ERROR  ${validated.error.message}
				CAUSE: unrealizedProfitPercent:validation

				You're reporting an invalid unrealizedProfitPercent value.

				Value received: ${unrealizedProfitPercent}
				Value expected: number

				`);
				logger.error(msg);
				process.exit(1);
			}

			logger.info(`unrealizedProfitPercent:validated: ${validated.data}`);

			store.setState((state) => {
				state.strategies.current.unrealizedProfitPercent =
					unrealizedProfitPercent;
			});
		},
		reportPriorityFeeMicroLamports: (priorityFeeMicroLamports: number) => {
			logger.info(`priorityFeeMicroLamports: ${priorityFeeMicroLamports}`);

			// validate priorityFeeMicroLamports
			const validated = z
				.number()
				.finite()
				.nonnegative()
				.safeParse(priorityFeeMicroLamports);

			if (!validated.success) {
				const msg = `priorityFeeMicroLamports:validation:error: ${validated.error.message}`;
				console.error(`
				ERROR  ${validated.error.message}
				CAUSE: priorityFeeMicroLamports:validation

				You're reporting an invalid priorityFeeMicroLamports value.

				Value received: ${priorityFeeMicroLamports}
				Value expected: number

				`);
				logger.error(msg);
				process.exit(1);
			}

			logger.info(`priorityFeeMicroLamports:validated: ${validated.data}`);

			store.setState((state) => {
				state.strategies.current.priorityFeeMicroLamports =
					priorityFeeMicroLamports;
			});
		},
		reportAutoSlippage: (autoSlippage: number, isEnabled = true) => {
			logger.info(`autoSlippage: ${autoSlippage}`);

			// validate autoSlippage
			const validated = z
				.number()
				.finite()
				.nonnegative()
				.safeParse(autoSlippage);

			if (!validated.success) {
				const msg = `autoSlippage:validation:error: ${validated.error.message}`;
				console.error(`
				ERROR  ${validated.error.message}
				CAUSE: autoSlippage:validation

				You're reporting an invalid autoSlippage value.

				Value received: ${autoSlippage}
				Value expected: number

				`);
				logger.error(msg);
				process.exit(1);
			}

			logger.info(`autoSlippage:validated: ${validated.data}`);

			store.setState((state) => {
				state.strategies.current.autoSlippage = autoSlippage;
				state.strategies.current.autoSlippageEnabled = isEnabled;
			});
		},
		desiredProfitPercentPerTx: (desiredProfitPercentPerTx: number) => {
			logger.info(`desiredProfitPercentPerTx: ${desiredProfitPercentPerTx}`);

			// validate desiredProfitPercentPerTx
			const validated = z
				.number()
				.finite()
				.nonnegative()
				.safeParse(desiredProfitPercentPerTx);

			if (!validated.success) {
				const msg = `desiredProfitPercentPerTx:validation:error: ${validated.error.message}`;
				console.error(`
				ERROR  ${validated.error.message}
				CAUSE: desiredProfitPercentPerTx:validation

				You're reporting an invalid desiredProfitPercentPerTx value.

				Value received: ${desiredProfitPercentPerTx}
				Value expected: number

				`);
				logger.error(msg);
				process.exit(1);
			}

			logger.info(`desiredProfitPercentPerTx:validated: ${validated.data}`);

			store.setState((state) => {
				state.strategies.current.desiredProfitPercentPerTx =
					desiredProfitPercentPerTx;
			});
		},
	};

	return reporters;
};
