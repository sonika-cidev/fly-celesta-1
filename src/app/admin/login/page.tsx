import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { MIN_PASSWORD_LENGTH, adminPasswordStatus, hasSession } from "@/lib/server/admin-session";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const metadata = { title: "Sign in" };

// Rendered per request, so a password added after deployment takes effect immediately.
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await hasSession()) redirect("/admin");
  const passwordStatus = adminPasswordStatus();

  return (
    <main className={styles.loginWrap}>
      <div className={styles.loginCard}>
        <Logo width={150} />
        <h1 className={`serif ${styles.loginTitle}`}>
          Inquiry <em>inbox</em>
        </h1>
        <p className={styles.loginText}>Sign in to view enquiries and charter requests sent from the website.</p>
        {passwordStatus === "ok" ? (
          <LoginForm />
        ) : passwordStatus === "too-short" ? (
          <p className={styles.notice} role="alert">
            The <code>ADMIN_PASSWORD</code> environment variable is too short. Use at least {MIN_PASSWORD_LENGTH} characters, then restart
            or redeploy the site.
          </p>
        ) : (
          <p className={styles.notice} role="alert">
            Admin sign-in isn&rsquo;t set up yet. Add an <code>ADMIN_PASSWORD</code> environment variable (at least {MIN_PASSWORD_LENGTH}{" "}
            characters) and restart or redeploy the site.
          </p>
        )}
      </div>
    </main>
  );
}
