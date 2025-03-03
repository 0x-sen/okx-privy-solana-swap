'use client';

import { usePrivy } from "@privy-io/react-auth";
import styles from "./page.module.css";

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
      </main>
    </div>
  );
}
