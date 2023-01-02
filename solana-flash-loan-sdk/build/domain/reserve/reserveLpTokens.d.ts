import { PublicKey } from "@solana/web3.js";
export interface ReserveLpTokens {
    mint_pubkey: PublicKey;
    mint_total_supply: bigint;
    supply_pubkey: PublicKey;
}
