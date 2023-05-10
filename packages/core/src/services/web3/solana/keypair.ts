import bs58 from "bs58";
import { Keypair } from "./web3";

export const createKeypair = (privateKey: string) => {
	if (!privateKey) {
		throw new Error("createKeypair: privateKey is null");
	}

	const decodedPrivateKey = bs58.decode(privateKey);
	const keypair = Keypair.fromSecretKey(decodedPrivateKey);

	return keypair;
};

// function that takes private key and returns a wallet address (public key)
