'use server';

import fetch from "node-fetch";
import { getHeaders } from "./okx-request";
import { HttpsProxyAgent } from "https-proxy-agent";
import { QuoteResponse } from "@/types/okx-quote";

// const proxyAgent = new HttpsProxyAgent("http://127.0.0.1:7890");

export async function getQuote(params: any): Promise<QuoteResponse | null> {
    try {
        const timestamp = new Date().toISOString();
        const requestPath = "/api/v5/dex/aggregator/quote";
        const queryString = "?" + new URLSearchParams({ ...params }).toString();

        const headers = getHeaders(timestamp, "GET", requestPath, queryString);

        const response = await fetch(`https://www.okx.com${requestPath}${queryString}`, {
            method: "GET",
            headers,
            // agent: proxyAgent, // 确保 proxyAgent 定义正确
        });

        // 检查 HTTP 响应状态码
        if (!response.ok) {
            console.error(`Error: Received status ${response.status} from OKX API`);
            return null;
        }

        const data: QuoteResponse = await response.json();
        return data;
    } catch (error: any) {
        console.error("Failed to fetch OKX quote:", error);
        return null; // 返回 null 避免抛出未捕获错误
    }
}
