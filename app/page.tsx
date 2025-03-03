'use client';

import { usePrivy } from "@privy-io/react-auth";
import styles from "./page.module.css";
import { Button } from "@mui/material";
import { test } from "@/lib/swap/solana-quote";

export default function Home() {
  const { login, user, logout } = usePrivy();
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
            <p>{user?.wallet?.address}</p>
          </div>
        </div>
        <Button onClick={() => test()}>test</Button>
      </main>
    </div>
  );
}
