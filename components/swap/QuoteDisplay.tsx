import React from "react";
import { Box, Card, CardContent, Typography, Grid, List, ListItem, ListItemAvatar, Avatar, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { QuoteResponse } from "@/types/okx-quote";
import { convertAmount } from "@/lib/swap/solana-swap";

interface QuoteDisplayProps {
  data: QuoteResponse;
}

const QuoteDisplay: React.FC<QuoteDisplayProps> = ({ data }) => {
  if (!data || data.code !== "0" || !data.data.length) {
    return <Typography variant="h6" color="error">No quote data available</Typography>;
  }

  const quote = data.data[0];

  return (
    <Box p={3}>
      {/* From & To Token Information */}
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">From Token</Typography>
              <Typography variant="body1"><strong>Symbol:</strong> {quote.fromToken.tokenSymbol}</Typography>
              <Typography variant="body1"><strong>Contract:</strong> {quote.fromToken.tokenContractAddress}</Typography>
              <Typography variant="body1"><strong>Amount:</strong> {quote.fromTokenAmount}</Typography>
              <Typography variant="body1"><strong>Unit Price:</strong> ${quote.fromToken.tokenUnitPrice}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6">To Token</Typography>
              <Typography variant="body1"><strong>Symbol:</strong> {quote.toToken.tokenSymbol}</Typography>
              <Typography variant="body1"><strong>Contract:</strong> {quote.toToken.tokenContractAddress}</Typography>
              <Typography variant="body1"><strong>Amount:</strong> {quote.toTokenAmount}</Typography>
              <Typography variant="body1"><strong>Unit Price:</strong> ${quote.toToken.tokenUnitPrice}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* DEX 路由信息 */}
      <Typography variant="h5" mt={3}>DEX 路由</Typography>
      <List>
        {quote.dexRouterList.map((router, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Router: ${router.router}`} secondary={`Router Percent: ${router.routerPercent}%`} />
          </ListItem>
        ))}
      </List>

      {/* DEX 报价对比表格 */}
      <Typography variant="h5" mt={3}>DEX 报价对比</Typography>
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
            {quote.quoteCompareList.map((dex, index) => (
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
    </Box>
  );
};

export default QuoteDisplay;
