export interface QuoteResponse {
  code: string;
  data: QuoteData[];
  msg: string;
}

export interface QuoteData {
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
