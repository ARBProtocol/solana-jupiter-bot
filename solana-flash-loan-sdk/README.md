![NPM](https://img.shields.io/npm/l/@texture-finance/solana-flash-loan-sdk)

# Flash Loan SDK

## Usage:
SDK can call FlashBorrow and FlashRepay instructions of FLashLoan contract

## Install 
```shell
npm i @texture-finance/solana-flash-loan-sdk
```
or 
```shell
yarn add @texture-finance/solana-flash-loan-sdk
```

## Live example
```shell
git clone https://github.com/texture-finance/flash-loan-sdk-ts
npm i
npm run example
```

## Code examples

Print all reserves:
```typescript
/**
 * get all reserves by program id
 */
const FLASH_LOAN_PROGRAM_ID = new PublicKey('fLaesa4r3XHTsKxxdW9gknBFpFAD9sDMK8KivYSQcX7');
accountService.getAllReserves(FLASH_LOAN_PROGRAM_ID).then((reserves: Reserve[]) => {
    reserves.map((reserve: Reserve) => {
        console.log('============================================');
        console.log(reserve.pubkey.toBase58());
        console.log('fee', reserve.fee(LAMPORTS_PER_SOL * 10));
        console.log('available liquidity', reserve.availableLiquidity());
    })
});

```

Connect to wallet and send transaction with flash loan instructions:
```typescript

Promise.all([
    accountService.getReserveInfo(WSOL_RESERVE),
    walletAdapter.connect(),
]).then(async ([reserve]: [Reserve, void]) => {
    if (reserve && walletAdapter.publicKey) {
        const amount = BigInt(LAMPORTS_PER_SOL * 0.01);

        const [token] = PublicKey.findProgramAddressSync(
            [walletAdapter.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), NATIVE_MINT.toBuffer()],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const tx = new Transaction();
        
        tx.add(
            reserve.flashBorrow(amount, token),
            reserve.flashRepay(amount, token, walletAdapter.publicKey),
        );

        tx.feePayer = walletAdapter.publicKey;
        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = latestBlockhash.blockhash;

        const signed = await walletAdapter.signTransaction(tx)
        const signature = await connection.sendRawTransaction(signed.serialize(), {
            preflightCommitment: 'confirmed',
        });
        console.log('signature', signature);
    }
});
```