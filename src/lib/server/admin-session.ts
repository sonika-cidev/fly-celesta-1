import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getStore } from "./store";

/**
 * Single-password admin access for the inquiry inbox.
 * ADMIN_PASSWORD (12+ characters) is set in the hosting environment; a successful login
 * sets a signed, HTTP-only session cookie scoped to /admin. Changing the password signs
 * every session out.
 */

const COOKIE = "fc_admin";
const COOKIE_PATH = "/admin";
const SESSION_SECONDS = 12 * 60 * 60;
export const MIN_PASSWORD_LENGTH = 12;

// Trimmed: stray spaces or line breaks pasted into a hosting dashboard shouldn't change the password.
const configuredPassword = () => (process.env.ADMIN_PASSWORD ?? "").trim();

/** Lets the sign-in page say exactly what to fix when the password isn't usable. */
export function adminPasswordStatus(): "missing" | "too-short" | "ok" {
  const { length } = configuredPassword();
  if (length === 0) return "missing";
  return length < MIN_PASSWORD_LENGTH ? "too-short" : "ok";
}

export const adminConfigured = () => adminPasswordStatus() === "ok";

const digest = (value: string) => createHash("sha256").update(value).digest();

export function passwordMatches(input: string) {
  if (!adminConfigured()) return false;
  // Compare fixed-length digests so the check takes the same time whatever is typed.
  return timingSafeEqual(digest(input), digest(configuredPassword()));
}

const passwordFingerprint = () => digest(`fly-celesta-admin:${configuredPassword()}`).toString("base64url");

async function signature(payload: string) {
  const secret = await getStore().getSecret();
  return createHmac("sha256", secret).update(`session:${payload}.${passwordFingerprint()}`).digest("base64url");
}

export async function startSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `v1.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${await signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: COOKIE_PATH,
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, path: COOKIE_PATH, maxAge: 0 });
}

export async function hasSession() {
  // Read the cookie first: it marks the page as per-request even when no password is configured yet.
  const value = (await cookies()).get(COOKIE)?.value;
  if (!adminConfigured() || !value) return false;
  const [version, expires, sig, extra] = value.split(".");
  if (version !== "v1" || !expires || !sig || extra !== undefined) return false;
  if (!/^\d+$/.test(expires) || Number(expires) < Date.now() / 1000) return false;
  try {
    const expected = Buffer.from(await signature(`v1.${expires}`));
    const actual = Buffer.from(sig);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
