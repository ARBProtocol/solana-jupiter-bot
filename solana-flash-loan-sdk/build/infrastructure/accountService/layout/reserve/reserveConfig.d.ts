import { ReserveConfig } from "../../../../domain/reserve";
interface ReserveConfigWithPadding extends ReserveConfig {
    _future_padding1: Uint8Array;
    _future_padding2: Uint8Array;
}
export declare const reserveConfigLayout: import("@solana/buffer-layout").Structure<ReserveConfigWithPadding>;
export {};
