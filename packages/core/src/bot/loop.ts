import { Bot } from "./bot";

export const loop = async (
	bot: Omit<Bot, "loadPlugin">,
	strategy: () => Promise<void>,
	{ iterations }: { iterations?: number } = {}
) => {
	const onComputeRoutesError = async () => {
		console.count("onComputeRoutesError");
		console.log("🔥 onComputeRoutesError FROM SUBSCRIBER <----------------");

		console.log(
			`No best route found, backOff for ${
				bot.store.getState().bot.backOff.ms / 1000
			} seconds`
		);
		await bot.backOff();
	};

	bot.onStatus("routesError", onComputeRoutesError);

	let condition = true;
	while (condition) {
		// if bot is busy, wait
		const status = bot.getStatus();
		if (status !== "idle") {
			console.log(`bot is busy, waiting... (${status})`);
			await bot.utils.sleep(1);
			continue;
		}

		try {
			await strategy();
		} catch (e) {
			// console.log("error in strategy", e);
		}

		if (iterations) {
			iterations--;
			if (iterations === 0) {
				condition = false;
			}
		}
	}
};
