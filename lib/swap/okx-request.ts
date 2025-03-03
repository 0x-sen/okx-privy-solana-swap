import CryptoJS from 'crypto-js';

export function getHeaders(timestamp: string, method: string, requestPath: string, queryString = "") {
    const apiKey = process.env.NEXT_PUBLIC_OKX_API_KEY;
    const secretKey = process.env.NEXT_PUBLIC_OKX_SECRET_KEY;
    const apiPassphrase = process.env.NEXT_PUBLIC_OKX_API_PASSPHRASE;
    const projectId = process.env.NEXT_PUBLIC_OKX_PROJECT_ID;

    if (!apiKey || !secretKey || !apiPassphrase || !projectId) {
        throw new Error("Missing required environment variables");
    }

    const stringToSign = timestamp + method + requestPath + queryString;
    return {
        "Content-Type": "application/json",
        "OK-ACCESS-KEY": apiKey,
        "OK-ACCESS-SIGN": CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA256(stringToSign, secretKey)
        ),
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": apiPassphrase,
        "OK-ACCESS-PROJECT": projectId,
    };
}

