import { PublicBot } from "src/bot";
import { TokenInfo, TokenMintAddress } from "./token";

export type BaseStrategyConfig = {
	tokens?: TokenMintAddress[];
	tokensInfo?: TokenInfo[];
};

export type Strategy<T extends Record<string, unknown>> = {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	readonly version: string;
	status?: string;
	init?(bot: PublicBot): PromiseLike<void>;
	run(
		runtimeId: string,
		bot: PublicBot,
		done: (strategy: Strategy<T>) => void
	): PromiseLike<void>;
	config: BaseStrategyConfig & T;
	/**
	 * UI Hook
	 * @description
	 * Used to render the strategy's useful details.
	 * This will be rendered in the bot's UI in the strategy info area.
	 *
	 * `Word wrap IS NOT supported.`
	 */
	uiHook: {
		value?: string;
	};
	dependencies?: {
		minTokens?: number;
		maxTokens?: number;
		minWallets?: number;
		maxWallets?: number;
	};
	setConfig(initialConfig: BaseStrategyConfig & T): void;
};

export type Strategies = [
	Strategy<Record<string, unknown>>,
	...Strategy<Record<string, unknown>>[]
];

export interface RunningStrategy extends Strategy<Record<string, unknown>> {
	runtime: {
		id: string;
		active?: boolean;
		scheduled?: boolean;
		scheduledAt?: number;
		done?: boolean;
		doneAt?: number;
		result?: unknown[];
		reported?: boolean;
		reportedAt?: number;
	};
}

type Prettify<T> = {
	[P in keyof T]: T[P];
};

// TODO: infer types

export type UnknownStrategy = Prettify<Strategy<Record<string, unknown>>>;
