"use client";

import { useActionState } from "react";
import { login } from "../actions";
import styles from "../admin.module.css";

type LoginState = { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className={styles.loginForm}>
      <label htmlFor="admin-password" className={styles.fieldLabel}>
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        aria-invalid={state.error ? true : undefined}
        aria-describedby={state.error ? "admin-login-error" : undefined}
        className={styles.input}
      />
      {state.error && (
        <p id="admin-login-error" className={styles.error} role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
