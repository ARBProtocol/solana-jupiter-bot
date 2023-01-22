import axios from "axios";
import axiosRetry from "axios-retry";
import { sleep } from "../../utils";
import { SOLSCAN_API_BASE_URL } from "../constants";

const solscanApi = axios.create({
	baseURL: SOLSCAN_API_BASE_URL,
});

axiosRetry(solscanApi, {
	retries: 3,
	retryDelay: axiosRetry.exponentialDelay,
});

type GetTransaction = (
	txId: string,
	count?: number,
	max?: number
) => Promise<SolscanTxResult | undefined | GetTransaction>;

export const getTransaction: GetTransaction = async (
	txId,
	count = 0,
	max = 10
) => {
	console.log("🚀 ~ file: getTransaction.ts:26 ~ txId", txId, count, max);
	try {
		const url = SOLSCAN_API_BASE_URL + "/transaction/" + txId;
		const response = await solscanApi.get(url);
		const data: SolscanTxResult = response.data;

		if (typeof data === "object" && !("inputAccount" in data)) {
			await sleep(count * 1500);

			return getTransaction(txId, count + 1);
		}

		if (count > max) {
			return undefined;
		}

		return data;
	} catch (error) {
		if (error && typeof error === "object" && "message" in error) {
			await sleep(count * 1500);

			console.error("getTransaction", error?.message);
		}

		if (count > max) {
			return undefined;
		}

		return count > max ? undefined : getTransaction(txId, count + 1);
	}
};

export interface SolscanTxResult {
	blockTime?: number;
	slot?: number;
	txHash: string;
	fee?: number;
	status: string;
	lamport?: number;
	signer?: string[];
	logMessage?: string[];
	inputAccount?: InputAccount[];
	recentBlockhash?: string;
	innerInstructions?: InnerInstruction[];
	tokenBalanes?: TokenBalane[];
	parsedInstruction?: SolscanTxResultParsedInstruction[];
	confirmations?: null;
	version?: string;
	tokenTransfers?: unknown[];
	solTransfers?: unknown[];
	serumTransactions?: unknown[];
	raydiumTransactions?: unknown[];
	unknownTransfers: UnknownTransfer[];
	error?: string;
}
export interface UnknownTransfer {
	programId: string;
	event: Event[];
}

export interface InnerInstruction {
	index: number;
	parsedInstructions: InnerInstructionParsedInstruction[];
}

export interface InnerInstructionParsedInstruction {
	programId: string;
	type: string;
	data?: string;
	dataEncode?: string;
	name: string;
	params: PurpleParams;
	program?: string;
	extra?: Event;
}

export interface Event {
	source: string;
	destination: string;
	authority?: string;
	amount: string;
	tokenAddress?: string;
	decimals?: number;
	symbol?: string;
	icon?: string;
	sourceOwner?: string;
	destinationOwner?: string;
	type?: string;
}

export interface PurpleParams {
	Account0?: string;
	Account1?: string;
	Account2?: string;
	Account3?: string;
	Account4?: string;
	Account5?: string;
	Account6?: string;
	Account7?: string;
	Account8?: string;
	Account9?: string;
	Account10?: string;
	Account11?: string;
	Account12?: string;
	source?: string;
	destination?: string;
	authority?: string;
	amount?: string;
	account?: string;
	mint?: string;
	mintAuthority?: string;
	Account13?: string;
	Account14?: string;
	Account15?: string;
}

export interface InputAccount {
	account: string;
	signer: boolean;
	writable: boolean;
	preBalance: number;
	postBalance: number;
}

export interface SolscanTxResultParsedInstruction {
	programId: string;
	type: string;
	data: string;
	dataEncode: string;
	name: string;
	params: FluffyParams;
}

export interface FluffyParams {
	Account0?: string;
	Account1?: string;
	Account2?: string;
	Account3?: string;
	Account4?: string;
	Account5?: string;
	Account6?: string;
	Account7?: string;
	Account8?: string;
	Account9?: string;
	Account10?: string;
	Account11?: string;
	Account12?: string;
	Account13?: string;
	Account14?: string;
	Account15?: string;
	Account16?: string;
	Account17?: string;
	Account18?: string;
	Account19?: string;
	Account20?: string;
	Account21?: string;
	Account22?: string;
	Account23?: string;
	Account24?: string;
	Account25?: string;
	Account26?: string;
	Account27?: string;
	Account28?: string;
	Account29?: string;
	Account30?: string;
	Account31?: string;
	Account32?: string;
	Account33?: string;
	Account34?: string;
}

export interface TokenBalane {
	account: string;
	amount: Amount;
	token: Token;
}

export interface Amount {
	postAmount: string;
	preAmount: string;
}

export interface Token {
	decimals: number;
	tokenAddress: string;
	name?: string;
	symbol?: string;
	icon?: string;
}
