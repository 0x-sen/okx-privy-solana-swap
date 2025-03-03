// swap.ts
// import base58 from "bs58";
import BN from "bn.js";
import * as solanaWeb3 from "@solana/web3.js";
import { Connection, GetVersionedTransactionConfig } from "@solana/web3.js";
import cryptoJS from "crypto-js";
import { getHeaders } from "./okx-request";

// Constants
const SOLANA_CHAIN_ID = "501";
const COMPUTE_UNITS = 300000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 10000; // 10 seconds

const connection = new Connection(`${process.env.NEXT_PUBLIC_RPC_URL}`, {
    confirmTransactionInitialTimeout: 5000
});

type TransactionStatus = 'confirmed' | 'finalized' | 'processed' | 'dropped' | 'unknown';

async function getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
        const confirmedTx: GetVersionedTransactionConfig = {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        };

        const finalizedTx: GetVersionedTransactionConfig = {
            maxSupportedTransactionVersion: 0,
            commitment: 'finalized'
        };


        if (finalizedTx) return 'finalized';
        if (confirmedTx) return 'confirmed';

        // Check if transaction is still in memory pool
        const signatureStatus = await connection.getSignatureStatus(txId);
        if (signatureStatus.value === null) {
            return 'dropped';
        }

        return 'unknown';
    } catch (error) {
        console.error('Error checking transaction status:', error);
        return 'unknown';
    }
}

async function isTransactionConfirmed(txId: string) {
    const status = await getTransactionStatus(txId);
    return status === 'confirmed' || status === 'finalized';
}

function calculateRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
    const jitter = Math.random() * 1000; // Random delay between 0-1000ms
    return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
}

async function getTokenInfo(fromTokenAddress: string, toTokenAddress: string) {
    const timestamp = new Date().toISOString();
    const requestPath = "/api/v5/dex/aggregator/quote";
    const params = {
        chainId: SOLANA_CHAIN_ID,
        fromTokenAddress,
        toTokenAddress,
        amount: "1000000", // small amount just to get token info
        slippage: "0.5",
    };

    const queryString = "?" + new URLSearchParams(params).toString();
    const headers = getHeaders(timestamp, "GET", requestPath, queryString);

    const response = await fetch(
        `https://www.okx.com${requestPath}${queryString}`,
        { method: "GET", headers }
    );

    if (!response.ok) {
        throw new Error(`Failed to get quote: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.code !== "0" || !data.data?.[0]) {
        throw new Error("Failed to get token information");
    }

    const quoteData = data.data[0];
    return {
        fromToken: {
            symbol: quoteData.fromToken.tokenSymbol,
            decimals: parseInt(quoteData.fromToken.decimal),
            price: quoteData.fromToken.tokenUnitPrice
        },
        toToken: {
            symbol: quoteData.toToken.tokenSymbol,
            decimals: parseInt(quoteData.toToken.decimal),
            price: quoteData.toToken.tokenUnitPrice
        }
    };
}

function convertAmount(amount: string, decimals: number) {
    try {
        if (!amount || isNaN(parseFloat(amount))) {
            throw new Error("Invalid amount");
        }
        const value = parseFloat(amount);
        if (value <= 0) {
            throw new Error("Amount must be greater than 0");
        }
        return new BN(value * Math.pow(10, decimals)).toString();
    } catch (err) {
        console.error("Amount conversion error:", err);
        throw new Error("Invalid amount format");
    }
}

