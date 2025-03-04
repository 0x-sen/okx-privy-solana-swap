export interface SwapResponse {
  code: string;
  data: SwapData[];
  msg: string;
}

export interface SwapData {
  routerResult: RouterResult;
  tx: Transaction;
}

export interface RouterResult {
  chainId: string;
  dexRouterList: DexRouter[];
  estimateGasFee: string;
  fromToken: Token;
  fromTokenAmount: string;
  priceImpactPercentage: string;
  quoteCompareList: QuoteCompare[];
  toToken: Token;
  toTokenAmount: string;
  tradeFee: string;
}

export interface DexRouter {
  router: string;
  routerPercent: string;
  subRouterList: SubRouter[];
}

export interface SubRouter {
  dexProtocol: DexProtocol[];
  fromToken: Token;
  toToken: Token;
}

export interface DexProtocol {
  dexName: string;
  percent: string;
}

export interface Token {
  decimal: string;
  isHoneyPot: boolean;
  taxRate: string;
  tokenContractAddress: string;
  tokenSymbol: string;
  tokenUnitPrice: string;
}

export interface QuoteCompare {
  amountOut: string;
  dexLogo: string;
  dexName: string;
  tradeFee: string;
}

export interface Transaction {
  data: string;
  from: string;
  gas: string;
  gasPrice: string;
  maxPriorityFeePerGas: string;
  minReceiveAmount: string;
  signatureData: string[];
  slippage: string;
  to: string;
  value: string;
}
