import { PublicKey } from "@solana/web3.js";
export interface ReserveLiquidity {
    mint_pubkey: PublicKey;
    mint_decimals: bigint;
    supply_pubkey: PublicKey;
    available_amount: bigint;
}
