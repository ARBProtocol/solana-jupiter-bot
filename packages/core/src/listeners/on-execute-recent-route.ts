import { PublicBot } from "src/bot";
import { thingToMulti } from "src/utils";

// TODO: handle errors, show some info to the user in the UI
export const onExecuteRecentRoute = (bot: PublicBot) => {
	bot.logger.info("listeners:loading:onExecuteRecentRoute");

	bot.onStatusChange("execute:recentRoute", async () => {
		bot.logger.info("listener:onExecuteRecentRoute called!");

		// check if there is any aggregator available
		if (bot.aggregators.length === 0 || !bot.aggregators[0]) {
			bot.logger.error(
				"listener:onExecuteRecentRoute: no aggregator available"
			);
			return;
		}

		const recentStrategyInfo = bot.store.getState().strategies.current;
		// check if there is a recent runtimeId and it is not 'init'
		if (
			!recentStrategyInfo ||
			recentStrategyInfo.runtimeId === "init" ||
			!recentStrategyInfo.inAmount ||
			!recentStrategyInfo.inToken ||
			!recentStrategyInfo.outToken ||
			!recentStrategyInfo.slippage
		) {
			bot.logger.error(
				"listener:onExecuteRecentRoute: recent strategy info is not available or missing data"
			);
			return;
		}

		// execute the recent route
		bot.aggregators[0].execute({
			runtimeId: recentStrategyInfo.runtimeId,
			inToken: recentStrategyInfo.inToken.address,
			outToken: recentStrategyInfo.outToken.address,
			amount: recentStrategyInfo.inAmount.bigint,
			slippage: recentStrategyInfo.slippage,
			calculateProfit: ({ outAmount }) => {
				// FIXME: this fake calculation is not correct

				if (!recentStrategyInfo.outToken) {
					const msg =
						"listener:onExecuteRecentRoute: recentStrategyInfo.outToken is not available";
					bot.logger.error(msg);
					throw new Error(msg);
				}
				const profit = thingToMulti.fromBlockchainValue(
					outAmount.number,
					recentStrategyInfo.outToken.decimals
				);

				if (!profit) {
					const msg = "listener:onExecuteRecentRoute: profit is not defined";
					bot.logger.error(msg);
					throw new Error(msg);
				}

				return {
					profitPercent: profit.uiValue.number,
				};
			},
		});
	});
};
