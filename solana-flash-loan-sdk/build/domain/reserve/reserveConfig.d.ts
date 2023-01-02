import { PublicKey } from "@solana/web3.js";
import { ReserveFees } from "./reserveFees";
export interface ReserveConfig {
    fees: ReserveFees;
    deposit_limit: bigint;
    fee_receiver: PublicKey;
}
