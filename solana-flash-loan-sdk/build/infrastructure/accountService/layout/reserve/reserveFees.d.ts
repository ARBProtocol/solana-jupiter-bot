import { ReserveFees } from "../../../../domain/reserve";
interface ReserveFeesWithPadding extends ReserveFees {
    _padding: Uint8Array;
}
export declare const reserveFeesLayout: import("@solana/buffer-layout").Structure<ReserveFeesWithPadding>;
export {};
