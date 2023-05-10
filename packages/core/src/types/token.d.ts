export type TokenMintAddress = string;

export type TokenInfo = {
	address: TokenMintAddress;
	decimals: number;
	symbol?: string;
	name?: string;
};
