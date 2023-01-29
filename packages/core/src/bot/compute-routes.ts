import { Jupiter } from "../services/aggregators/jupiter";
import { Store, Token } from "../store";
import { Queue } from "./queue";
import { GetStatus, SetStatus } from "./bot";
import {
	JSBI,
	JSBItoNumber,
	NumberToJSBI,
	shiftAndPush,
	sleep,
	toDecimal,
} from "../utils";

const rateLimiter = async (store: Store, setStatus: SetStatus) => {
	const { lastIterationTimestamp, rateLimit, rateLimitPer } =
		store.getState().bot;

	if (rateLimit !== 0) {
		const now = performance.now();
		const timeSinceLastIteration =
			lastIterationTimestamp === 0
				? rateLimitPer
				: now - lastIterationTimestamp;
		if (timeSinceLastIteration < rateLimitPer) {
			setStatus("rateLimiterActive");
			const timeToWait = rateLimitPer - timeSinceLastIteration;
			await sleep(timeToWait);
			setStatus("idle");
		}
	}
};

export const computeRoutes = async ({
	store,
	getStatus,
	setStatus,
	jupiter,
	queue,
	inToken,
	outToken,
	tradeAmount,
	slippageBps,
}: {
	store: Store;
	getStatus: GetStatus;
	setStatus: SetStatus;
	jupiter: Jupiter | null;
	queue: Queue;
	inToken: Token;
	outToken: Token;
	tradeAmount: JSBI | number;
	slippageBps: number;
}) => {
	try {
		if (getStatus() !== "idle") throw new Error("computeRoutes: bot is busy");

		await rateLimiter(store, setStatus);

		setStatus("computingRoutes");

		if (queue.getCount() > queue.getMaxAllowed()) {
			throw new Error("computeRoutes: queue is full");
		}

		if (!jupiter) {
			throw new Error("computeRoutes: Jupiter instance does not exist");
		}

		// increase queue count
		queue.increase();

		// increase iteration count
		store.setState((state) => {
			state.bot.iterationCount++;
		});

		const amount =
			typeof tradeAmount === "number" ? NumberToJSBI(tradeAmount) : tradeAmount;

		// check if inToken and outToken are valid
		if (!inToken?.publicKey) {
			throw new Error("computeRoutes: inToken publicKey is null");
		}
		if (!outToken?.publicKey) {
			throw new Error("computeRoutes: outToken publicKey is null");
		}

		// const amount = store.getState().config.strategy.tradeAmount.jsbi;
		// const slippageBps = store.getState().config.strategy.rules?.slippage.bps;

		const lookupTimeStart = performance.now();

		const routes = await jupiter.computeRoutes({
			forceFetch: true,
			inputMint: inToken.publicKey,
			outputMint: outToken.publicKey,
			amount,
			slippageBps, // 1bps = 0.01%
		});

		const lookupTime = performance.now() - lookupTimeStart;

		// update lookupTime chart
		store.setState((state) => {
			state.chart.lookupTime.values = shiftAndPush(
				state.chart.lookupTime.values,
				lookupTime
			);
		});

		if (!routes) throw new Error("computeRoutes: routes is null");
		if (!routes.routesInfos || routes.routesInfos.length === 0)
			throw new Error("computeRoutes: routesInfos is null");

		if (routes.cached) {
			console.warn("computeRoutes: routes are cached!");
		}

		// store best route
		store.setState((state) => {
			if (routes.routesInfos[0]) {
				state.routes.currentRoute.raw = routes.routesInfos[0] || null;

				if ("inAmount" in routes.routesInfos[0]) {
					const { inAmount } = routes.routesInfos[0];
					state.routes.currentRoute.input.amount.jsbi = inAmount;

					const decimals = inToken.decimals;

					if (!decimals) throw new Error("computeRoutes: decimals is null");

					const asNumber = JSBItoNumber(inAmount);

					const asDecimal = toDecimal(asNumber, decimals);

					state.routes.currentRoute.input.amount.decimal = asDecimal;
				}

				if ("outAmount" in routes.routesInfos[0]) {
					const { outAmount } = routes.routesInfos[0];
					state.routes.currentRoute.output.amount.jsbi = outAmount;

					const decimals = outToken.decimals;

					if (!decimals) throw new Error("computeRoutes: decimals is null");

					const asNumber = JSBItoNumber(outAmount);

					const asDecimal = toDecimal(asNumber, decimals);

					state.routes.currentRoute.output.amount.decimal = asDecimal;
				}
			}
		});

		setStatus("routesComputed");
		setStatus("idle");

		return routes;
	} catch (e: Error | any) {
		setStatus("routesError");
		if (typeof e === "object" && "message" in e) {
			if (e.message.match(/Account info [\w\d]+ missing/)) {
				throw new Error(`Some data is missing from the RPC
			- If error persists, please try to use another RPC

			CURRENT RPC: ${store.getState().config.rpcURL}
			CURRENT RPC WS: ${store.getState().config.rpcWSS}
			
			IMPORTANT!
			NEVER SHARE YOUR PRIVATE KEY WITH ANYONE!`);
			}
		}

		const error = e as Error;
		const parsedError = `${error?.stack}`;

		// todo: more robust error handling for every AMM, so the user can see which AMM is failing
		const isGooseFxError = parsedError.includes("goosefx");
		if (isGooseFxError) {
			console.error(
				"It's probably a GooseFX error, try to exclude it in the config and try again"
			);
		}
		console.error(error);
		throw error;
	} finally {
		store.setState((state) => {
			state.bot.lastIterationTimestamp = performance.now();
		});
		// decrease queue count
		queue.decrease();
	}
};

export type ComputeRoutes = typeof computeRoutes;
