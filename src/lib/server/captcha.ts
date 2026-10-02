import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { createMathExpr } from "svg-captcha";
import { getStore } from "./store";

/**
 * Arithmetic CAPTCHA, generated and checked entirely on our own server (no third-party service).
 *
 * The sum is drawn by svg-captcha as vector outlines, so the numbers are not readable text in
 * the page. The answer never leaves the server: the browser only receives a signed token
 *   id.expiry.authSig.answerSig
 * where answerSig = HMAC(secret, id.expiry.answer). Each token can be tried once, so a
 * question cannot be brute-forced or replayed.
 */

const TTL_MS = 30 * 60 * 1000;

export type CaptchaChallenge = { svg: string; token: string };
export type CaptchaResult = "ok" | "wrong" | "expired" | "invalid";

const sign = (secret: Buffer, value: string) => createHmac("sha256", secret).update(value).digest("base64url");

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export async function createChallenge(): Promise<CaptchaChallenge> {
  const secret = await getStore().getSecret();
  const { text, data } = createMathExpr({
    mathMin: 1,
    mathMax: 9,
    mathOperator: "+",
    width: 120,
    height: 46,
    fontSize: 48,
    noise: 2,
    color: false,
  });
  const id = randomBytes(12).toString("base64url");
  const expires = Date.now() + TTL_MS;
  const token = [id, expires, sign(secret, `auth:${id}.${expires}`), sign(secret, `answer:${id}.${expires}.${text}`)].join(".");
  return { svg: data, token };
}

export async function verifyChallenge(token: string, answer: string): Promise<CaptchaResult> {
  const [id, expiresRaw, authSig, answerSig, extra] = token.split(".");
  if (!id || !expiresRaw || !authSig || !answerSig || extra !== undefined) return "invalid";
  const expires = Number(expiresRaw);
  if (!Number.isSafeInteger(expires)) return "invalid";

  const store = getStore();
  const secret = await store.getSecret();
  // Reject forged tokens before touching the database.
  if (!safeEqual(sign(secret, `auth:${id}.${expires}`), authSig)) return "invalid";
  if (Date.now() > expires) return "expired";
  // One attempt per question, whatever the outcome.
  if (!(await store.consumeToken(id))) return "expired";

  const normalized = answer.trim().replace(/^0+(?=\d)/, "");
  if (!/^\d{1,3}$/.test(normalized)) return "wrong";
  return safeEqual(sign(secret, `answer:${id}.${expires}.${normalized}`), answerSig) ? "ok" : "wrong";
}
