import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { ReserveLiquidity } from "./reserveLiquidity";
import { ReserveLpTokens } from "./reserveLpTokens";
import { ReserveConfig } from "./reserveConfig";
export interface ReserveData {
    version: number;
    last_update: bigint;
    lending_market: PublicKey;
    liquidity: ReserveLiquidity;
    lp_tokens_info: ReserveLpTokens;
    config: ReserveConfig;
}
declare enum FeeCalculation {
    Exclusive = 0,
    Inclusive = 1
}
export declare class Reserve {
    private readonly data;
    readonly pubkey: PublicKey;
    constructor(data: ReserveData, pubkey: PublicKey);
    fee(amount: number, feeCalculation?: FeeCalculation): number;
    availableLiquidity(): number;
    flashBorrow(amount: bigint, destination: PublicKey): TransactionInstruction;
    flashRepay(amount: bigint, source: PublicKey, authority: PublicKey): TransactionInstruction;
    private instruction;
    private static meta;
}
export {};
