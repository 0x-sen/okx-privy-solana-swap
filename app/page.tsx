'use client';

import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import styles from "./page.module.css";
import { Box, Button, Typography } from "@mui/material";
import { getQuote } from "@/lib/swap/solana-quote";
import { useCallback, useState } from "react";
import QuoteDisplay from "@/components/swap/QuoteDisplay";
import { QuoteResponse } from "@/types/okx-quote";
import { calculateRetryDelay, getTransactionStatus, testSwap } from "@/lib/swap/solana-swap";
import { SwapResponse } from "@/types/okx-swap";
import { getSwapData } from "@/lib/swap/solana-swap-data";
import SwapDisplay from "@/components/swap/SwapDisplay";
import base58 from "bs58";
import { ComputeBudgetProgram, Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '',
  "confirmed",
);
const MAX_RETRIES = 3;
const COMPUTE_UNITS = 300000;
export default function Home() {
  const { login, user, logout } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [quoteData, setQuoteData] = useState<QuoteResponse | null>(null)
  const [swapData, setSwapData] = useState<SwapResponse | null>(null)
  const handleQuote = useCallback(async () => {
    const quote = await getQuote({
      chainId: '501',
      amount: '1000000',
      fromTokenAddress: 'So11111111111111111111111111111111111111112',
      toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      slippage: '0.1',
    });
    setQuoteData(quote)
  }, [])
  const handleSwapByWallet = useCallback(async () => {
    const quoteParams = {
      chainId: '501',
      amount: '1000000',
      fromTokenAddress: 'So11111111111111111111111111111111111111112',
      toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      slippage: "0.5",
      userWalletAddress: '3oVzPG3zkN5TA7ewaHPgNu4AdwupRGujdmhGXjdSAJCZ',
    } as Record<string, string>;
    const swapData = await getSwapData(quoteParams)
    setSwapData(swapData)

    const transactionData = swapData?.data[0]?.tx?.data;
    console.log('transactionData', transactionData);

    if (!transactionData || typeof transactionData !== 'string') {
      throw new Error("Invalid transaction data");
    }
    let retryCount = 0;
    let txId;
    console.log("\nExecuting swap transaction...");
    while (retryCount < MAX_RETRIES) {
      try {
        if (!transactionData) {
          throw new Error("Invalid swap data structure");
        }
        const recentBlockHash = await connection.getLatestBlockhash();
        const decodedTransaction = base58.decode(transactionData);
        let tx;
        try {
          tx = VersionedTransaction.deserialize(decodedTransaction);
          console.log("Successfully created versioned transaction");
          tx.message.recentBlockhash = recentBlockHash.blockhash;
        } catch (e) {
          console.log("Versioned transaction failed, trying legacy:", e);
          tx = Transaction.from(decodedTransaction);
          console.log("Successfully created legacy transaction");
          tx.recentBlockhash = recentBlockHash.blockhash;
        }
        // const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
        //   units: COMPUTE_UNITS
        // });
        // const feePayer = solanaWeb3.Keypair.fromSecretKey(
        //   base58.decode(userPrivateKey)
        // );
        console.log('tx', tx);
        console.log('solanaWallets', solanaWallets);
        tx = await solanaWallets?.[0].signTransaction(tx);
        console.log('signTx', tx);

        txId = await connection.sendRawTransaction(tx.serialize(), {
          skipPreflight: false,
          maxRetries: MAX_RETRIES
        });
        console.log('txId', txId);

        const confirmation = await connection.confirmTransaction({
          signature: txId,
          blockhash: recentBlockHash.blockhash,
          lastValidBlockHeight: recentBlockHash.lastValidBlockHeight
        }, 'confirmed');

        if (confirmation?.value?.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        console.log("\nSwap completed successfully!");
        console.log("Transaction ID:", txId);
        console.log("Explorer URL:", `https://solscan.io/tx/${txId}`);
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);

        if (txId) {
          const status = await getTransactionStatus(txId);
          console.log(`Transaction status: ${status}`);

          switch (status) {
            case 'finalized':
            case 'confirmed':
              console.log("Transaction confirmed successfully, no retry needed.");
              process.exit(0);
            case 'processed':
              console.log("Transaction processed but not confirmed, waiting longer...");
              await new Promise(resolve => setTimeout(resolve, 5000)); // Extra wait for confirmation
              break;
            case 'dropped':
              console.log("Transaction dropped, will retry with new blockhash");
              break;
            case 'unknown':
              console.log("Transaction status unknown, proceeding with retry");
              break;
          }
        }

        retryCount++;

        if (retryCount === MAX_RETRIES) {
          throw error;
        }

        const delay = calculateRetryDelay(retryCount);
        console.log(`Waiting ${delay}ms before retry ${retryCount + 1}/${MAX_RETRIES}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }, [swapData])
  const handleSwapByPrivy = useCallback(async () => {
    const quoteParams = {
      chainId: '501',
      amount: '1000000',
      fromTokenAddress: 'So11111111111111111111111111111111111111112',
      toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      slippage: "0.5",
      userWalletAddress: 'CPs3Fgw2xcRM7o9XFRuFhrQwjV9MokqRwh7z3Lsmnje5',
    } as Record<string, string>;
    const swapData = await getSwapData(quoteParams)
    setSwapData(swapData)
    const transactionData = swapData?.data[0]?.tx?.data;
    if (!transactionData || typeof transactionData !== 'string') {
      throw new Error("Invalid transaction data");
    }

    // Show estimated output and price impact
    const decodedTransaction = base58.decode(transactionData);

    let tx;

    try {
      tx = VersionedTransaction.deserialize(decodedTransaction);
    } catch (e) {
      tx = Transaction.from(decodedTransaction);
    }
    const fromTokenMint = new PublicKey(swapData.data[0].routerResult.fromToken.tokenContractAddress);
    const toTokenMint = new PublicKey(swapData.data[0].routerResult.toToken.tokenContractAddress);
    const owner = new PublicKey('CPs3Fgw2xcRM7o9XFRuFhrQwjV9MokqRwh7z3Lsmnje5');
    const fromAta = await getAssociatedTokenAddress(fromTokenMint, owner);
    const toAta = await getAssociatedTokenAddress(toTokenMint, owner);
    console.log('fromAta', fromAta);
    console.log('toAta', toAta);

    const transaction = new Transaction()
    try {
      const fromInfo = await getAccount(connection, fromAta);
      console.log("✅ fromAta ATA exists:", fromAta.toBase58(), fromInfo);
    } catch (error) {
      console.log("⚠️ fromAta ATA does not exist, creating...");
      transaction.add(
        createAssociatedTokenAccountInstruction(owner, fromAta, owner, fromTokenMint)
      );
    }
    try {
      const toInfo = await getAccount(connection, toAta);
      console.log("✅ toAta ATA exists:", toAta.toBase58(), toInfo);
    } catch (error) {
      console.log("⚠️ toAta ATA does not exist, creating...");
      transaction.add(
        createAssociatedTokenAccountInstruction(owner, toAta, owner, toTokenMint)
      );
    }
    console.log('all - ready');

    const signTX = await solanaWallets?.[2].sendTransaction(
      tx,
      connection,
    );
    const status = await connection.getSignatureStatus(signTX);
    console.log("status", status);

  }, [swapData])
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <div
            className={styles.primary}
            onClick={() => logout()}
          >
            Logout
          </div>
          <div
            className={styles.primary}
            onClick={() => login()}
          >
            Login
          </div>
          <div>
            {/* @ts-ignore */}
            <p>{user?.linkedAccounts?.[2]?.address || ''}</p>
          </div>
        </div>
        <Box>
          <Typography> fromTokenAddress: So11111111111111111111111111111111111111112</Typography>
          <Typography> toTokenAddress: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</Typography>
          <Typography> amount: 1000000</Typography>
          <Typography> chainId: 501</Typography>
          <Typography> slippage: 0.1</Typography>
        </Box>
        <Button variant="contained" onClick={handleQuote}>get quote</Button>
        {quoteData ? <QuoteDisplay data={quoteData} /> : null}
        {swapData ? <SwapDisplay data={swapData} /> : null}
        <Button variant="contained" onClick={handleSwapByPrivy}>Swap By Privy</Button>
        <Button variant="contained" onClick={handleSwapByWallet}>Swap By Wallet</Button>
      </main>
    </div>
  );
}
