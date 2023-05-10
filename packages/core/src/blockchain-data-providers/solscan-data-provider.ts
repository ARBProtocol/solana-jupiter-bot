import { BlockchainDataProvider } from "src/actions/public/create-blockchain-data-providers";
import { sleep } from "src/utils";

export const SOLSCAN_API_BASE_URL = "https://public-api.solscan.io";

let requestCount = 0;

export const SolscanDataProvider: BlockchainDataProvider = {
	id: "solscan",
	name: "Solscan",
	url: "https://solscan.io/",
	getTransactionInfo: async (
		{ txId, inTokenMint, outTokenMint, walletAddress },
		axios
	) => {
		try {
			console.log(
				"txInfo getTransactionInfo SolscanDataProvider, requestCount: ",
				requestCount
			);
			const url = SOLSCAN_API_BASE_URL + "/transaction/" + txId;
			let inAmount = null;
			let outAmount = null;
			const result: Event[] = [];

			requestCount++;
			const response = await axios.get(url);
			if (response.status === 429) {
				console.log("txInfo getTransactionInfo SolscanDataProvider 429");
				sleep(5000);
				return null;
			}
			const txInfo: SolscanTxResult = response.data;

			if (
				!txInfo ||
				typeof txInfo !== "object" ||
				!("inputAccount" in txInfo)
			) {
				console.log("txInfo is null");
				return null;
			}

			if ("unknownTransfers" in txInfo) {
				console.log("txInfo.unknownTransfers", txInfo.unknownTransfers);
				txInfo.unknownTransfers.forEach((transfer) => {
					const tokenRelatedEvents = transfer.event.filter(
						({ tokenAddress }) => {
							return (
								tokenAddress === inTokenMint || tokenAddress === outTokenMint
							);
						}
					);

					result.push(...tokenRelatedEvents);
				});
			}

			if ("innerInstructions" in txInfo && txInfo.innerInstructions) {
				console.log("txInfo.innerInstructions", txInfo.innerInstructions);
				txInfo.innerInstructions.forEach((instruction) => {
					const tokenRelatedEvents = instruction.parsedInstructions.filter(
						(instruction) => {
							const extra = instruction.extra;
							if (extra) {
								const tokenAddress = extra.tokenAddress;

								return (
									tokenAddress === inTokenMint || tokenAddress === outTokenMint
								);
							}
						}
					);

					result.push(
						...tokenRelatedEvents.map(
							(instruction) => instruction.extra as Event
						)
					);
				});
			}

			if (result.length === 0) {
				console.log("txInfo result is empty");
				return null;
			}

			inAmount = Number(
				result.find((event) => event.sourceOwner === walletAddress)?.amount
			);

			outAmount = Number(
				result.find((event) => event.destinationOwner === walletAddress)?.amount
			);

			console.log(
				"txInfo getTransactionInfo SolscanDataProvider",
				inAmount,
				outAmount
			);

			return { inAmount, outAmount };
		} catch (error) {
			console.log("txInfo getTransactionInfo SolscanDataProvider error", error);
			return null;
		}
	},
};

interface SolscanTxResult {
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
	tokenBalanes?: TokenBalance[];
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

interface UnknownTransfer {
	programId: string;
	event: Event[];
}

interface InnerInstruction {
	index: number;
	parsedInstructions: InnerInstructionParsedInstruction[];
}

interface InnerInstructionParsedInstruction {
	programId: string;
	type: string;
	data?: string;
	dataEncode?: string;
	name: string;
	params: PurpleParams;
	program?: string;
	extra?: Event;
}

interface Event {
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

interface PurpleParams {
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

interface InputAccount {
	account: string;
	signer: boolean;
	writable: boolean;
	preBalance: number;
	postBalance: number;
}

interface SolscanTxResultParsedInstruction {
	programId: string;
	type: string;
	data: string;
	dataEncode: string;
	name: string;
	params: FluffyParams;
}

interface FluffyParams {
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

interface TokenBalance {
	account: string;
	amount: Amount;
	token: Token;
}

interface Amount {
	postAmount: string;
	preAmount: string;
}

interface Token {
	decimals: number;
	tokenAddress: string;
	name?: string;
	symbol?: string;
	icon?: string;
}
