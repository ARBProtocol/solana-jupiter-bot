import { TokenInfo } from "src/types/token";
import { createArray, parseError, thingToMulti } from "../utils";
import Decimal from "decimal.js";
import { Strategy } from "src/types/strategy";

export type PingPongStrategyConfig = {
	inToken?: {
		initialOutAmount: Decimal;
		recentOutAmount: Decimal;
		token: TokenInfo;
		profit: number;
	};
	outToken?: {
		initialOutAmount: Decimal;
		recentOutAmount: Decimal;
		token: TokenInfo;
		profit: number;
	};
	amount: number;
	slippage: number;
	/**
	 * Auto slippage will try to prevent losses by setting the slippage threshold
	 * to the previous out amount of the current out token. This will not guarantee that
	 * tx will not lead to losses though.
	 */
	enableAutoSlippage: boolean;
	/**
	 * If enabled, the bot will compound the profit of the previous trade
	 */
	enableCompounding: boolean;
	executeAboveExpectedProfitPercent: number;
	priorityFeeMicroLamports?: number;
	lock?: boolean;
	shouldReset?: boolean;
	autoReset?: {
		enabled: boolean;
		timeWindowMs: number;
	};
};

export const PingPongStrategy: Strategy<PingPongStrategyConfig> = {
	id: "ping-pong",
	name: "Ping Pong",
	description: "Ping Pong Strategy WOW",
	version: "0.0.1",
	config: {
		amount: 0,
		slippage: 50,
		executeAboveExpectedProfitPercent: 1,
		lock: false,
		enableAutoSlippage: false,
		enableCompounding: false,
	},
	uiHook: {},
	// dependencies: {
	// 	minTokens: 2,
	// 	maxTokens: 2,
	//  supportedAggregators: ["jupiter", "prism"]
	// },
	setConfig(initialConfig) {
		this.config = initialConfig;
	},
	async init(bot) {
		if (!this.config.tokensInfo) {
			throw new Error("PingPongStrategy:init: tokensInfo not provided");
		}
		if (!this.config.tokensInfo[0] || !this.config.tokensInfo[1]) {
			throw new Error("PingPongStrategy:init: not enough tokens provided");
		}

		const initialTradeAmount = thingToMulti.fromUiValue(
			this.config.amount,
			this.config.tokensInfo[0].decimals
		);

		if (!initialTradeAmount) {
			const msg = "PingPongStrategy:init:error invalid amount";
			bot.logger.error(
				{
					amount: this.config.amount,
					decimals: this.config.tokensInfo[0].decimals,
				},
				msg
			);
			throw new Error(msg);
		}

		const results = await bot.aggregators[0].computeRoutes({
			inToken: this.config.tokensInfo[0].address,
			outToken: this.config.tokensInfo[1].address,
			amount: initialTradeAmount.bigint,
			slippage: 0.5,
			runtimeId: "init",
		});

		if (!results.success) {
			throw new Error("PingPongStrategy:init:error: " + results.error);
		}

		this.config.inToken = {
			initialOutAmount: initialTradeAmount.uiValue.decimal,
			recentOutAmount: initialTradeAmount.uiValue.decimal,
			token: this.config.tokensInfo[0],
			profit: 0,
		};

		const amountOut = results.routes[0]?.amountOut;
		if (!amountOut) {
			throw new Error("PingPongStrategy:init: amountOut not provided");
		}
		const outAmountAsDecimal = thingToMulti.fromBlockchainValue(
			amountOut,
			this.config.tokensInfo[1].decimals
		)?.uiValue.decimal;

		if (!outAmountAsDecimal) {
			const msg = "PingPongStrategy:init:error outAmountAsDecimal is undefined";
			bot.logger.error(msg);
			throw new Error(msg);
		}

		this.config.outToken = {
			initialOutAmount: outAmountAsDecimal,
			recentOutAmount: outAmountAsDecimal,
			token: this.config.tokensInfo[1],
			profit: 0,
		};
		if (!this.config.inToken || !this.config.outToken) {
			throw new Error("PingPongStrategy:init: not enough tokens provided");
		}

		// show profit threshold
		const profitThreshold = this.config.executeAboveExpectedProfitPercent;
		bot.store.setState((state) => {
			const ind = {
				values: createArray(
					state.chart.expectedProfitPercent.values.length,
					profitThreshold
				),
				label: "threshold",
				color: "darkgray",
			};
			state.chart.expectedProfitPercent.indicators = [ind];
		});

		// report priority fee
		if (this.config.priorityFeeMicroLamports) {
			bot.reportPriorityFeeMicroLamports(this.config.priorityFeeMicroLamports);
		}

		// report auto slippage
		bot.reportAutoSlippage(0, this.config.enableAutoSlippage);

		// report desired profit percent per trade
		bot.desiredProfitPercentPerTx(
			this.config.executeAboveExpectedProfitPercent
		);

		// bot set listener for shouldReset event
		bot.onStatusChange("strategy:shouldReset", () => {
			this.config.shouldReset = true;
		});
	},
	async run(runtimeId, bot, done) {
		let isDone = false;

		try {
			// Checks
			if (!this.config.tokensInfo) {
				throw new Error("PingPongStrategy:run: tokensInfo not provided");
			}

			if (
				!this.config.inToken ||
				!this.config.outToken ||
				!this.config.tokensInfo[0] ||
				!this.config.tokensInfo[1]
			) {
				throw new Error("PingPongStrategy:run: not enough tokens provided");
			}

			if (!this.config.amount) {
				throw new Error("PingPongStrategy:run: tradeAmount not provided");
			}

			const initialToken = this.config.tokensInfo[0];
			// check if lock is enabled
			if (this.config.lock) {
				bot.logger.info(
					"PingPongStrategy:run: lock enabled - waiting for unlock"
				);

				let i = 0;
				// wait for unlock
				await new Promise((resolve) => {
					setInterval(() => {
						if (!this.config.lock) {
							resolve(true);
						}
						bot.logger.info(
							`PingPongStrategy:run: waiting for unlock ... ${i++}`
						);
					}, 1000);
				});
			}

			// UI Hook
			this.uiHook.value = this.config.enableCompounding ? "Compounding ON" : "";

			const tradeAmount = thingToMulti.fromUiValue(
				this.config.inToken.token.address === this.config.tokensInfo[0].address
					? this.config.enableCompounding
						? this.config.inToken.recentOutAmount
						: this.config.amount
					: this.config.inToken.recentOutAmount.toNumber(),
				this.config.inToken.token.decimals
			);

			const slippage = this.config.slippage;

			if (!tradeAmount) {
				const msg = "PingPongStrategy:run:error tradeAmount not provided";
				bot.logger.error(
					{
						amount: this.config.enableCompounding
							? this.config.inToken.recentOutAmount
							: this.config.amount,
						inTokenRecentOutAmount: this.config.inToken.recentOutAmount,
						typeOfInTokenRecentOutAmount:
							typeof this.config.inToken.recentOutAmount,
						inToken: this.config.inToken.token,
						outToken: this.config.outToken.token,
						enableCompounding: this.config.enableCompounding,
					},
					msg
				);
				throw new Error(msg);
			}

			// get routes
			const start = performance.now();

			const results = await bot.aggregators[0].computeRoutes({
				inToken: this.config.inToken.token.address,
				outToken: this.config.outToken.token.address,
				amount: tradeAmount.bigint,
				slippage,
				runtimeId,
			});

			const end = performance.now();

			bot.logger.debug(
				{ runtimeId },
				`PingPongStrategy:run: computeRoutes took ${end - start} milliseconds`
			);
			//FIXME:
			isDone = true;

			// get best route
			if (!results.success || !Array.isArray(results.routes)) {
				throw new Error("PingPongStrategy:run: no routes found");
			}

			const bestRoute = results.routes[0];

			if (!bestRoute) {
				throw new Error("PingPongStrategy:run: no routes found");
			}

			const outAmountMulti = thingToMulti.fromBlockchainValue(
				bestRoute.amountOut,
				this.config.outToken.token.decimals
			);

			if (!outAmountMulti) {
				const msg = "PingPongStrategy:run:error outAmountMulti undefined";
				bot.logger.error(msg);
				throw new Error(msg);
			}

			/**
			 * Check if route isn't outdated because during the time of computing routes
			 * inToken or outToken could be already changed
			 */
			if (
				bestRoute.inToken !== this.config.inToken?.token.address ||
				bestRoute.outToken !== this.config.outToken?.token.address
			) {
				// prevent unexpected behavior
				bot.logger.debug(
					{ runtimeId },
					"PingPongStrategy:run: done - route outdated"
				);

				return done(this);
			}

			if (this.config.shouldReset) {
				this.config.shouldReset = false;
				this.config.outToken.recentOutAmount = outAmountMulti.uiValue.decimal;
			}

			// calculate change
			const expectedProfitPercent = outAmountMulti.uiValue.decimal
				.minus(this.config.outToken.recentOutAmount)
				.div(
					this.config.outToken.recentOutAmount.equals(new Decimal(0))
						? new Decimal(1)
						: this.config.outToken.recentOutAmount
				)
				.times(100);

			const prevExpectedProfitPercent =
				bot.store.getState().strategies.current.expectedProfitPercent;

			const isSellSide =
				this.config.outToken.token.address === initialToken.address;

			if (
				this.config.autoReset?.enabled &&
				performance.now() - prevExpectedProfitPercent.positiveValueAtRel >
					this.config.autoReset?.timeWindowMs &&
				expectedProfitPercent.toNumber() < 0 &&
				!isSellSide
			) {
				bot.logger.info(
					{ runtimeId },
					`PingPongStrategy:run: done - expectedProfitPercent < 0 for more than ${
						this.config.autoReset.timeWindowMs / 1000
					}s, resetting`
				);
				//reset
				this.config.outToken.recentOutAmount = outAmountMulti.uiValue.decimal;
			}

			bot.reportExpectedProfitPercent(expectedProfitPercent.toNumber());

			bot.logger.debug(
				{
					tradeAmount: tradeAmount,
					recentInAmount: this.config.inToken.recentOutAmount.toString(),
					currentOutAmount: outAmountMulti.uiValue.decimal,
					recentOutAmount: this.config.outToken.recentOutAmount,
					expectedProfitPercent: expectedProfitPercent.toNumber(),
					inToken: this.config.inToken.token.symbol,
					outToken: this.config.outToken.token.symbol,
					runtimeId,
				},
				`PingPongStrategy:run: expectedProfitPercent ${expectedProfitPercent.toNumber()}`
			);

			if (results.routes.length === 0 || !results.routes[0]) {
				throw new Error("PingPongStrategy:run: no routes found");
			}

			const shouldExecute =
				bot.store.getState().strategies.current.shouldExecute;
			if (
				expectedProfitPercent.toNumber() >
					this.config.executeAboveExpectedProfitPercent ||
				shouldExecute
			) {
				if (shouldExecute) {
					bot.store.setState((state) => {
						state.status.value = "execute:shouldExecute";
					});
					bot.logger.info(
						{ runtimeId },
						"PingPongStrategy:run:shouldExecute user forced execution"
					);
				}

				const previousOutAmount = this.config.outToken.recentOutAmount;

				// report priority fee
				if (this.config.priorityFeeMicroLamports) {
					bot.reportPriorityFeeMicroLamports(
						this.config.priorityFeeMicroLamports
					);
				}

				const initialToken = this.config.tokensInfo[0];

				// auto slippage
				let customSlippageThreshold: bigint | undefined;

				if (this.config.enableAutoSlippage) {
					const previousOutAmount = thingToMulti.fromUiValue(
						this.config.outToken.recentOutAmount,
						this.config.outToken.token.decimals
					);

					if (!previousOutAmount) {
						const msg =
							"PingPongStrategy:run:error previousOutAmount is undefined";
						bot.logger.error(msg);
						throw new Error(msg);
					}
					customSlippageThreshold = previousOutAmount.bigint;

					bot.reportAutoSlippage(
						previousOutAmount.number,
						this.config.enableAutoSlippage
					);

					bot.logger.debug(
						{ runtimeId },
						`PingPongStrategy:run: customSlippageThreshold set to ${customSlippageThreshold}`
					);
				}

				// execute trade
				const result = await bot.aggregators[0].execute({
					runtimeId,
					originalRoutes: results.originalRoutes,
					inToken: this.config.inToken.token.address,
					outToken: this.config.outToken.token.address,
					amount: tradeAmount.bigint,
					slippage:
						shouldExecute && expectedProfitPercent.toNumber() < 0
							? 1
							: slippage,
					priorityFeeMicroLamports: this.config.priorityFeeMicroLamports,
					customSlippageThreshold,
					calculateProfit: ({ outAmount, outToken }) => {
						bot.logger.debug(
							{
								runtimeId,
								initialTokenA: initialToken.address,
								outTokenA: outToken.address,
								outTokenSymbol: outToken.symbol,
							},
							"PingPongStrategy:run:calculateProfit: initialToken.address !== outToken.address"
						);

						if (initialToken.address !== outToken.address) {
							const unrealizedProfitPercent = outAmount.uiValue.decimal
								.minus(previousOutAmount)
								.div(previousOutAmount)
								.times(100);

							bot.reportUnrealizedProfitPercent(
								unrealizedProfitPercent.toNumber()
							);

							const unrealizedProfit =
								outAmount.uiValue.decimal.minus(previousOutAmount);

							const unrealizedProfitMulti = thingToMulti.fromUiValue(
								unrealizedProfit,
								outToken.decimals
							);

							const profit = thingToMulti.fromUiValue(0, 0);
							bot.logger.debug(
								{
									profit: profit?.number,
									unrealizedProfit,
									previousOutAmount,
								},
								"PingPongStrategy:run:calculateProfit: profit and unrealizedProfit"
							);

							if (!profit || !unrealizedProfitMulti) {
								const msg =
									"PingPongStrategy:run:calculateProfit profit or unrealizedProfit is undefined";
								bot.logger.error(msg);
								throw new Error(msg);
							}

							return {
								profit: profit,
								profitPercent: 0,
								unrealizedProfit: unrealizedProfitMulti,
								unrealizedProfitPercent: unrealizedProfitPercent.toNumber(),
							};
						}

						const profit = outAmount.uiValue.decimal.minus(previousOutAmount);

						const profitMulti = thingToMulti.fromUiValue(
							profit,
							outToken.decimals
						);

						const profitPercent = outAmount.uiValue.decimal
							.minus(previousOutAmount)
							.div(previousOutAmount)
							.times(100);

						bot.reportUnrealizedProfitPercent(0);

						bot.logger.debug(
							{
								profit,
								previousOutAmount,
								profitMulti: profitMulti?.number,
							},
							"PingPongStrategy:run:calculateProfit: profit"
						);

						return {
							profit: profitMulti,
							profitPercent: profitPercent.toNumber(),
							unrealizedProfit: thingToMulti.fromUiValue(0, 0),
							unrealizedProfitPercent: 0,
						};
					},
				});

				if (result.status === "success") {
					if (!result.outAmount) {
						const msg = "PingPongStrategy:run: result.outAmount is undefined";
						bot.logger.error(msg);
						throw new Error(msg);
					}

					const outAmountMulti = thingToMulti.fromBlockchainValue(
						result.outAmount,
						this.config.outToken.token.decimals
					);

					if (!outAmountMulti) {
						const msg = "PingPongStrategy:run: outAmountMulti is undefined";
						bot.logger.error(msg);
						throw new Error(msg);
					}

					// report tx profit
					this.config.outToken.recentOutAmount = outAmountMulti.uiValue.decimal;

					// set lock
					this.config.lock = true;
					bot.logger.debug({ runtimeId }, "PingPongStrategy:run: locking");
					// swap sides

					const prevInToken = this.config.inToken;
					const prevOutToken = this.config.outToken;

					bot.logger.debug(
						{ runtimeId },
						"PingPongStrategy:run: swapping sides"
					);

					this.config.inToken = prevOutToken;
					this.config.outToken = prevInToken;

					// reset price chart
					bot.store.setState((state) => {
						state.chart.price.values = createArray(
							state.chart.price.values.length,
							0
						);
						state.chart.price.updatedAtRel = performance.now();
					});

					// reset lock
					this.config.lock = false;
					bot.logger.debug({ runtimeId }, "PingPongStrategy:run: unlocking");
				}
			}

			bot.logger.debug(
				{ runtimeId, lookupPerformance: results.meta.lookupPerformance },
				`PingPongStrategy:run: done isDone? ${isDone}`
			);

			if (!isDone) {
				console.error("PingPongStrategy:run: isDone is false");
				// @ts-expect-error FIXME:
				console.error(this?.runtime?.id);
				bot.logger.error(
					{ runtimeId },
					"PingPongStrategy:run: isDone is false"
				);
				process.exit(1);
			}
		} catch (error) {
			const parsedError = parseError(error);
			bot.logger.error(
				{
					stack: parsedError?.stack,
					runtimeId,
				},
				`PingPongStrategy:run:error ${parsedError?.message}`
			);
		} finally {
			done(this);
		}
	},
};
