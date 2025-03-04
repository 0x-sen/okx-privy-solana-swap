import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { DexRouter, QuoteCompare, SwapData, SwapResponse, Transaction } from "@/types/okx-swap";
import { Token } from "@/types/okx-quote";

interface SwapDisplayProps {
  data: SwapResponse;
}

const TokenCard: React.FC<{ title: string; token: Token; amount: string }> = ({ title, token, amount }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body1"><strong>Symbol:</strong> {token.tokenSymbol}</Typography>
        <Typography variant="body1"><strong>Contract:</strong> {token.tokenContractAddress}</Typography>
        <Typography variant="body1"><strong>Amount:</strong> {amount}</Typography>
        <Typography variant="body1"><strong>Unit Price:</strong> ${parseFloat(token.tokenUnitPrice).toFixed(6)}</Typography>
      </CardContent>
    </Card>
  );
};

const DexRouterItem: React.FC<{ router: DexRouter }> = ({ router }) => {
  return (
    <ListItem>
      <ListItemText
        primary={`Router: ${router.router}`}
        secondary={`Router Percent: ${router.routerPercent}%`}
      />
      <List>
        {router.subRouterList.map((subRouter, i) => (
          <ListItem key={i}>
            <ListItemText
              primary={`Sub Router ${i + 1}: ${subRouter.dexProtocol.map((d) => d.dexName).join(", ")}`}
              secondary={
                <>
                  <Typography variant="body2"><strong>From:</strong> {subRouter.fromToken.tokenSymbol}</Typography>
                  <Typography variant="body2"><strong>To:</strong> {subRouter.toToken.tokenSymbol}</Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </ListItem>
  );
};

const QuoteCompareTable: React.FC<{ quotes: QuoteCompare[] }> = ({ quotes }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>DEX</TableCell>
            <TableCell align="right">Amount Out</TableCell>
            <TableCell align="right">Trade Fee</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {quotes.map((dex, index) => (
            <TableRow key={index}>
              <TableCell>
                <ListItemAvatar>
                  <Avatar src={dex.dexLogo} alt={dex.dexName} />
                </ListItemAvatar>
                {dex.dexName}
              </TableCell>
              <TableCell align="right">{dex.amountOut}</TableCell>
              <TableCell align="right">{dex.tradeFee}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TransactionDetails: React.FC<{ tx: Transaction }> = ({ tx }) => {
  return (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="body1"><strong>From:</strong> {tx.from}</Typography>
        <Typography variant="body1"><strong>To:</strong> {tx.to}</Typography>
        <Typography variant="body1"><strong>Gas:</strong> {tx.gas}</Typography>
        <Typography variant="body1"><strong>Gas Price:</strong> {tx.gasPrice}</Typography>
        <Typography variant="body1"><strong>Min Receive Amount:</strong> {tx.minReceiveAmount}</Typography>
        <Typography variant="body1"><strong>Slippage:</strong> {tx.slippage}%</Typography>
        <Typography variant="body1"><strong>Transaction Data:</strong> <small>{tx.data.slice(0, 50)}...</small></Typography>
      </CardContent>
    </Card>
  );
};


const SwapDisplay: React.FC<SwapDisplayProps> = ({ data }) => {
  if (!data || data.code !== "0" || !data.data.length) {
    return <Typography variant="h6" color="error">No swap data available</Typography>;
  }

  const swap: SwapData = data.data[0];

  return (
    <Box p={3}>
      {/* From & To Token Information */}
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <TokenCard title="From Token" token={swap.routerResult.fromToken} amount={swap.routerResult.fromTokenAmount} />
        </Grid>
        <Grid item xs={6}>
          <TokenCard title="To Token" token={swap.routerResult.toToken} amount={swap.routerResult.toTokenAmount} />
        </Grid>
      </Grid>

      {/* DEX 路由信息 */}
      <Typography variant="h5" mt={3}>🔗 DEX 路由信息</Typography>
      <List>
        {swap.routerResult.dexRouterList.map((router, index) => (
          <DexRouterItem key={index} router={router} />
        ))}
      </List>

      {/* DEX 报价对比表格 */}
      <Typography variant="h5" mt={3}>📊 DEX 报价对比</Typography>
      <QuoteCompareTable quotes={swap.routerResult.quoteCompareList} />

      {/* 交易详情 */}
      <Typography variant="h5" mt={3}>🔍 交易详情</Typography>
      <TransactionDetails tx={swap.tx} />
    </Box>
  );
};

export default SwapDisplay;
