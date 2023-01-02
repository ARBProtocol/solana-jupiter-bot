import { Connection, PublicKey } from "@solana/web3.js";
import { Reserve } from "../../domain/reserve";
export declare class AccountService {
    private connection;
    constructor(connection: Connection);
    getAllReserves(programId?: PublicKey): Promise<Reserve[]>;
    getReserveInfo(reserveAddress: PublicKey): Promise<Reserve>;
    private getProgramAccounts;
    private getAccountInfo;
}
