import { ReserveData } from "../../../../domain/reserve";
interface ReserveDataWithPadding extends ReserveData {
    _padding: Uint8Array;
    _future_padding: Uint8Array;
}
export declare const reserveLayout: import("@solana/buffer-layout").Structure<ReserveDataWithPadding>;
export {};
