"use client";

import { useActionState, useState, type FormEvent } from "react";
import { login } from "../actions";
import styles from "../admin.module.css";

type LoginState = { error?: string };

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  // Checked here first so an empty password never reaches the server
  const [missing, setMissing] = useState(false);
  const error = missing ? "Enter the password." : state.error;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (!password) {
      e.preventDefault();
      setMissing(true);
      e.currentTarget.querySelector<HTMLInputElement>("#admin-password")?.focus();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className={styles.loginForm}>
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
        onChange={() => setMissing(false)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "admin-login-error" : undefined}
        className={styles.input}
      />
      {error && (
        <p id="admin-login-error" className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.primary} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
