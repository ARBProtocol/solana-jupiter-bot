import axios, { AxiosStatic } from "axios";
import { sleep } from "src/utils";

export type TransactionInfo = {
	inAmount: number;
	outAmount: number;
	error?: string;
};

export type BlockchainDataProvider = {
	id: string;
	name: string;
	url: string;
	getTransactionInfo: (
		{
			txId,
			inTokenMint,
			outTokenMint,
			walletAddress,
		}: {
			txId: string;
			inTokenMint: string;
			outTokenMint: string;
			walletAddress: string;
		},
		axios: AxiosStatic
	) => Promise<TransactionInfo | null>;
};

export type RuntimeBlockchainDataProvider = {
	id: string;
	name: string;
	url: string;
	getTransactionInfo: ({
		txId,
		inTokenMint,
		outTokenMint,
		walletAddress,
	}: {
		txId: string;
		inTokenMint: string;
		outTokenMint: string;
		walletAddress: string;
	}) => Promise<TransactionInfo | null>;
};

export const createBlockchainDataProviders = (
	blockchainDataProviders: BlockchainDataProvider[]
) => {
	const providers: RuntimeBlockchainDataProvider[] = [];

	for (const provider of blockchainDataProviders) {
		providers.push({
			id: provider.id,
			name: provider.name,
			url: provider.url,
			getTransactionInfo: async ({
				txId,
				inTokenMint,
				outTokenMint,
				walletAddress,
			}) => {
				let txInfo: TransactionInfo | null = null;
				let retries = 0;
				const maxRetries = 5;
				const retryDelay = 3000;

				const tryGetTransactionInfo = async () => {
					console.log("txInfo tryGetTransactionInfo, retries: ", retries);
					txInfo = await provider.getTransactionInfo(
						{
							txId,
							inTokenMint,
							outTokenMint,
							walletAddress,
						},
						axios
					);

					if (txInfo === null && retries < maxRetries) {
						console.log(
							"txInfo tryGetTransactionInfo, retrying, retries: " + retries
						);
						retries++;
						setTimeout(tryGetTransactionInfo, retryDelay * retries);
					}
				};

				await sleep(5000);
				await tryGetTransactionInfo();

				console.log("txInfo tryGetTransactionInfo, txInfo: ", txInfo);

				return txInfo;
			},
		});
	}

	if (providers.length === 0) {
		throw new Error("No blockchain data providers provided");
	}

	return providers;
};
