'use server';

import fetch from "node-fetch";
import { getHeaders } from "./okx-request";
import { HttpsProxyAgent } from "https-proxy-agent";
import { SwapResponse } from "@/types/okx-swap";

// const proxyAgent = new HttpsProxyAgent("http://127.0.0.1:7890");

export async function getSwapData(params: any): Promise<SwapResponse | null> {
    try {
        const timestamp = new Date().toISOString();
        const requestPath = "/api/v5/dex/aggregator/swap";
        const queryString = "?" + new URLSearchParams({ ...params }).toString();

        const headers = getHeaders(timestamp, "GET", requestPath, queryString);

        const response = await fetch(`https://www.okx.com${requestPath}${queryString}`, {
            method: "GET",
            headers,
            // agent: proxyAgent,
        });

        if (!response.ok) {
            console.error(`Error: Received status ${response.status} from OKX API`);
            return null;
        }

        const data: SwapResponse = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch OKX quote:", error);
        return null; // 返回 null 避免抛出未捕获错误
    }
}
