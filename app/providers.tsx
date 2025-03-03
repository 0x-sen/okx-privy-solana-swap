'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});



const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // MUI 默认蓝色
    },
    secondary: {
      main: '#dc004e', // MUI 默认粉色
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        "appearance": {
          "accentColor": "#6A6FF5",
          "theme": "#FFFFFF",
          "showWalletLoginFirst": false,
          "logo": "https://auth.privy.io/logos/privy-logo.png",
          "walletChainType": "ethereum-and-solana",
          "walletList": [
            "detected_wallets",
            "metamask",
            "phantom"
          ]
        },
        "loginMethods": [
          "wallet",
          "email",
        ],
        "fundingMethodConfig": {
          "moonpay": {
            "useSandbox": true
          }
        },
        "embeddedWallets": {
          "createOnLogin": "all-users",
          "requireUserPasswordOnCreate": false,
          "ethereum": {
            "createOnLogin": "off"
          },
          "solana": {
            "createOnLogin": "users-without-wallets"
          }
        },
        "mfa": {
          "noPromptOnMfaRequired": false
        },
        externalWallets: {
          solana: { connectors: solanaConnectors },
        },
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </PrivyProvider>
  );
}
