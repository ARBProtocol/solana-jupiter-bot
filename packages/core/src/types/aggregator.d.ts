import Piscina from "piscina";
import { TokenInfo } from "./token";
import { Multi } from "src/utils";
import { Config } from "./config";

// TODO: add generic exclude Amms

export type AbsolutePath = string;
export type AggregatorWorker = AbsolutePath;
export type Aggregators = [AggregatorWorker, ...AggregatorWorker[]];
export type RuntimeAggregators = [RuntimeAggregator, ...RuntimeAggregator[]];

export type AggregatorRoute = {
	readonly inToken: string;
	readonly outToken: string;
	readonly amountIn: bigint;
	readonly amountOut: bigint;
	readonly slippage: number;
	readonly hops: string[];
};

export type AggregatorComputeRoutesMethod<TAgg, TRoutes = void> = ({
	inToken,
	outToken,
	aggregator,
	amount,
	slippage,
	runtimeId,
	done,
}: {
	inToken: string;
	outToken: string;
	amount: bigint;
	slippage: number;
	aggregator: TAgg;
	runtimeId: string;
	done: () => void;
}) => Promise<ComputeRoutesSuccess<TRoutes> | ComputeRoutesError>;

export type ComputeRoutesSuccess<TRoutes> = {
	success: true;
	meta: {
		runtimeId: string;
		lookupPerformance: number;
	};
	routes: AggregatorRoute[];
	originalRoutes?: TRoutes;
};

export type ComputeRoutesError = {
	success: false;
	error:
		| { unknown: true; message?: string }
		| {
				missingData?: true;
				rpc503?: true;
				rpc429?: true;
				rpc500?: true;
		  };
};

export type SuccessfulTransaction = {
	meta: {
		runtimeId: string;
		executePerformance: number;
	};
	txId: string;
	inTokenAddress?: string;
	outTokenAddress?: string;
	inAmount?: bigint;
	outAmount?: bigint;
	status: "success";
};

export type FailedTransaction = {
	meta: {
		runtimeId: string;
		executePerformance: number;
		error:
			| { unknown: true }
			| {
					insufficientFunds?: true;
					slippageToleranceExceeded?: true;
					rpc503?: true;
					rpc429?: true;
					rpc500?: true;
					_pendingLimiter?: true;
					_executionRateLimiter?: true;
			  };
	};
	txId?: string;
	status:
		| "failed"
		| "limitedByPendingLimiter"
		| "limitedByExecutionRateLimiter";
};

export type AggregatorInitSuccess = {
	success: true;
	aggregatorId: string;
};

export type AggregatorInitError = {
	success: false;
	error:
		| {
				rpc503?: true;
				rpc429?: true;
				rpc500?: true;
				missingData?: true;
				message?: string;
		  }
		| { unknown: true; message?: string };
};

export type AggregatorInitMethod = (
	config: Config
) => Promise<AggregatorInitSuccess | AggregatorInitError>;

export interface Aggregator<TAgg, TRoutes = undefined> {
	id: string;
	tokens: TokenInfo[];
	init: AggregatorInitMethod;
	// TODO: (if aggregator not providing getTokens then bot should fetch tokens from public lists)
	getTokens?: () => Promise<TokenInfo[]>;
	computeRoutes: AggregatorComputeRoutesMethod<TAgg, TRoutes>;
	execute: ({
		runtimeId,
		originalRoutes,
		priorityFeeMicroLamports,
		customSlippageThreshold,
	}: {
		runtimeId: string;
		originalRoutes?: TRoutes;
		priorityFeeMicroLamports?: number;
		customSlippageThreshold?: bigint;
	}) => Promise<SuccessfulTransaction | FailedTransaction>;
	/**
	 * This instance should live inside the worker thread
	 * */
	instance?: TAgg | null;
}

export type RuntimeAggregator = {
	id: string;
	isInitialized: boolean;
	worker: null | Piscina;
	tokens: TokenInfo[];
	init: (config: Config) => Promise<void>;
	getTokens: () => Promise<TokenInfo[]>;
	computeRoutes: ({
		inToken,
		outToken,
		amount,
		slippage,
		runtimeId,
		done,
	}: {
		inToken: string;
		outToken: string;
		amount: bigint;
		slippage: number;
		runtimeId: string;
		done?: (result: unknown) => void;
	}) => ReturnType<AggregatorComputeRoutesMethod<unknown, unknown>>;
	execute: (
		{
			runtimeId,
			originalRoutes,
			inToken,
			outToken,
			amount,
			slippage,
			priorityFeeMicroLamports,
			customSlippageThreshold,
			calculateProfit,
		}: {
			runtimeId: string;
			originalRoutes?: unknown;
			inToken: string;
			outToken: string;
			amount: bigint;
			slippage: number;
			priorityFeeMicroLamports?: number;
			customSlippageThreshold?: bigint;
			/**
			 * @description
			 * This function is called from the core **AFTER** the transaction is executed. It should return the current profit for this transaction.
			 * Reported profit is needed for the core but it is also available in the return of the `execute` method. So, you can use it in the strategy if you want.
			 */
			calculateProfit: ({
				inAmount,
				outAmount,
				inToken,
				outToken,
			}: {
				inAmount: Multi;
				outAmount: Multi;
				inToken: TokenInfo;
				outToken: TokenInfo;
			}) => {
				profit?: Multi;
				profitPercent?: number;
				unrealizedProfit?: Multi;
				unrealizedProfitPercent?: number;
			};
		},
		{
			_internalRequest,
			_isArbAccTx,
		}: {
			_internalRequest?: boolean;
			_isArbAccTx?: boolean;
		} | void
	) => Promise<
		| (SuccessfulTransaction & {
				profit?: Multi;
				profitPercent?: number;
				unrealizedProfit?: Multi;
				unrealizedProfitPercent?: number;
		  })
		| FailedTransaction
	>;
};

export interface RuntimeAggregatorMeta {
	readonly inToken: TokenInfo;
	readonly outToken: TokenInfo;
	readonly amountIn: Multi;
	readonly amountOut: Multi;
	readonly slippage: number;
	readonly performance: number;
	readonly price: number;
}
