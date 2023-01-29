import { Store } from "../store";
import { setToken } from "./tokens";
import { createArray, JSBItoNumber, NumberToJSBI, numberToMin } from "../utils";
import { SetStatus, ConfigRequired } from "./bot";
import { createKeypair } from "../services/web3";

export const loadConfig = (
	store: Store,
	setStatus: SetStatus,
	config: ConfigRequired
) => {
	try {
		// set bot status to "loadingConfig"
		setStatus("loadingConfig");

		// set RPC
		store.setState((state) => {
			state.config.rpcURL = config.rpcURL;
			if (config.rpcWSS) {
				state.config.rpcWSS = config.rpcWSS;
			}
		});

		// set wallet
		const keypair = createKeypair(config.privateKey);
		store.setState((state) => {
			state.config.privateKey = config.privateKey;

			state.wallet.privateKey = config.privateKey;
			state.wallet.publicKey = keypair.publicKey;
			state.wallet.address = keypair.publicKey.toString();

			// todo: set wallet funds
		});

		/**
		 * STRATEGY
		 */
		// set tokens
		setStatus("loadingStrategy");
		setToken(store, config.tokens.tokenA.address);

		if (config.tokens.tokenB) {
			setToken(store, config.tokens.tokenB.address);
		}

		// get token decimals
		const tokens = store.getState().bot.tokens;
		if (!tokens) throw new Error("loadConfig: tokens are not set");

		// set input token
		store.setState((state) => {
			state.bot.currentInToken = tokens[config.tokens.tokenA.address];
		});

		const currentInToken = store.getState().bot.currentInToken;

		if (!currentInToken || !currentInToken.decimals) {
			throw new Error(
				`Token ${currentInToken?.address} ${currentInToken?.symbol} decimals not found`
			);
		}

		// set trade amount
		const tradeAmount =
			typeof config.strategy.tradeAmount === "number"
				? NumberToJSBI(
						numberToMin(config.strategy.tradeAmount, currentInToken.decimals)
				  )
				: config.strategy.tradeAmount;

		const tradeAmountNumber =
			typeof config.strategy.tradeAmount === "number"
				? numberToMin(config.strategy.tradeAmount, currentInToken.decimals)
				: JSBItoNumber(config.strategy.tradeAmount);

		// set rules
		const rules = {
			execute: {},
			slippage: {
				bps: 0,
			},
		};

		// if execute above profit is set, set the threshold on the potential profit chart
		const executeAbovePotentialProfit =
			config.strategy.rules?.execute?.above?.potentialProfit;

		if (executeAbovePotentialProfit) {
			store.setState((state) => {
				if (!state.chart.potentialProfit.indicators) {
					state.chart.potentialProfit.indicators = [];
				}
				state.chart.potentialProfit.indicators.push({
					values: createArray(120, executeAbovePotentialProfit),
					label: "threshold",
					color: "darkgray",
				});
			});
		}

		if (config.strategy.rules) {
			if (config.strategy.rules.execute) {
				rules.execute = config.strategy.rules.execute;
			}
			if (config.strategy.rules.slippage) {
				rules.slippage = config.strategy.rules.slippage;
			}
		}

		store.setState((state) => {
			state.config.strategy = {
				...state.config.strategy,
				tradeAmount: {
					jsbi: tradeAmount,
					number: tradeAmountNumber,
				},
				rules,
			};
			setStatus("strategyLoaded");
			setStatus("idle");
		});

		// set ammsToExclude
		store.setState((state) => {
			state.config.ammsToExclude = config.ammsToExclude;
		});

		// set backOff
		store.setState((state) => {
			state.bot.backOff.enabled = config.backOff?.enabled ?? true;
			state.bot.backOff.shutdownOnCount = config.backOff?.shutdownOnCount;
			state.bot.backOff.ms = config.backOff?.ms ?? 2000;
		});

		setStatus("configLoaded");
	} catch (error) {
		setStatus("configError");
		console.error("loadConfig error", error);
		setStatus("!shutdown");
	} finally {
		setStatus("idle");
	}
};
