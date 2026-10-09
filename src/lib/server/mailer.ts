import "server-only";
import { createTransport } from "nodemailer";
import { site } from "@/data/site";
import { KIND_LABEL, charterRows, formatReceived } from "@/lib/inquiry-display";
import type { Inquiry } from "./store";

/**
 * Emails each stored inquiry to the team through an SMTP server, configured in the environment:
 *
 *   SMTP_HOST      mail server, e.g. mail.example.com (nothing is sent without it)
 *   SMTP_CRYPTO    ssl (port 465), tls (STARTTLS, port 587) or none — defaults to ssl on 465, tls otherwise
 *   SMTP_PORT      only when the server uses a non-standard port
 *   SMTP_USER      login, usually the mailbox address
 *   SMTP_PASSWORD
 *   MAIL_TO        who receives the emails, comma-separated (defaults to SMTP_USER)
 *   MAIL_FROM      sender address (defaults to SMTP_USER); most servers only accept their own mailboxes
 *
 * A failure is logged and never reaches the visitor: the inquiry is already stored and listed in /admin.
 */

const env = (name: string) => (process.env[name] ?? "").trim();

function smtpSettings() {
  const host = env("SMTP_HOST");
  if (!host) return null;

  const crypto = env("SMTP_CRYPTO").toLowerCase();
  const port = Number.parseInt(env("SMTP_PORT"), 10) || (crypto === "ssl" || !crypto ? 465 : 587);
  // Port 465 always starts encrypted, whatever the setting calls it ("tls" is often used for it).
  const mode = port === 465 && crypto !== "none" ? "ssl" : crypto === "starttls" ? "tls" : crypto || "tls";
  if (mode !== "ssl" && mode !== "tls" && mode !== "none") {
    throw new Error(`SMTP_CRYPTO must be ssl, tls or none (got "${crypto}")`);
  }

  const user = env("SMTP_USER");
  const from = env("MAIL_FROM") || user;
  const to = env("MAIL_TO") || user;
  if (!from || !to) throw new Error("Set SMTP_USER, or MAIL_FROM and MAIL_TO");

  return { host, port, mode, user, password: process.env.SMTP_PASSWORD ?? "", from, to };
}

export async function emailInquiry(inquiry: Inquiry) {
  let settings: ReturnType<typeof smtpSettings>;
  try {
    settings = smtpSettings();
  } catch (error) {
    console.error(`[mail] inquiry #${inquiry.id} not emailed: ${(error as Error).message}`);
    return;
  }
  if (!settings) return;

  const { host, port, mode, user, password, from, to } = settings;
  const transport = createTransport({
    host,
    port,
    secure: mode === "ssl",
    requireTLS: mode === "tls",
    ignoreTLS: mode === "none",
    auth: user ? { user, pass: password } : undefined,
    // Give up well before the hosting platform would stop the process.
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    dnsTimeout: 15_000,
    socketTimeout: 30_000,
  });

  try {
    await transport.sendMail({
      from: from.includes("<") ? from : { name: `${site.name} website`, address: from },
      to,
      replyTo: inquiry.email || undefined,
      subject: subjectOf(inquiry),
      text: textOf(inquiry),
      html: htmlOf(inquiry),
    });
    console.info(`[mail] inquiry #${inquiry.id} emailed to ${to}`);
  } catch (error) {
    console.error(`[mail] could not email inquiry #${inquiry.id} through ${host}:${port} (${mode})`, error);
  } finally {
    transport.close();
  }
}

/* ----------------------------------------------------------------------- Message */

function subjectOf(inquiry: Inquiry) {
  const { from, to } = inquiry.details;
  if (inquiry.kind === "charter") return `New charter request: ${inquiry.name}${from && to ? ` (${from} → ${to})` : ""}`;
  if (inquiry.kind === "career") return `New career application: ${inquiry.name}`;
  return `New enquiry (${inquiry.topic}): ${inquiry.name}`;
}

function rowsOf(inquiry: Inquiry): [string, string][] {
  return (
    [
      ["Received", formatReceived(inquiry.createdAt)],
      ["Type", KIND_LABEL[inquiry.kind]],
      // A charter request's topic only repeats the aircraft, which is listed below.
      ["Topic", inquiry.kind === "charter" ? "" : inquiry.topic],
      ["Name", inquiry.name],
      ["Email", inquiry.email || "Not provided"],
      ["Phone", inquiry.phone],
      ...charterRows(inquiry),
      ["Sent from", inquiry.page],
      ["Reference", `#${inquiry.id}`],
    ] as [string, string][]
  ).filter(([, value]) => value);
}

const adminUrl = `${site.url}/admin`;

function textOf(inquiry: Inquiry) {
  return [
    `${KIND_LABEL[inquiry.kind]} from the ${site.name} website`,
    "",
    ...rowsOf(inquiry).map(([label, value]) => `${label}: ${value}`),
    ...(inquiry.message ? ["", "Message:", inquiry.message] : []),
    "",
    `All inquiries: ${adminUrl}`,
  ].join("\n");
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function htmlOf(inquiry: Inquiry) {
  const cell = (label: string, value: string) => {
    let html = escape(value);
    if (label === "Email" && inquiry.email) html = `<a href="mailto:${escape(inquiry.email)}">${html}</a>`;
    if (label === "Phone") html = `<a href="tel:${escape(value.replace(/[^\d+]/g, ""))}">${html}</a>`;
    return `<tr><th align="left" valign="top" style="padding:6px 16px 6px 0;color:#6b7280;font-weight:normal;white-space:nowrap">${escape(label)}</th><td style="padding:6px 0;color:#111827">${html}</td></tr>`;
  };
  const message = inquiry.message
    ? `<p style="margin:20px 0 6px;color:#6b7280">Message</p><p style="margin:0;padding:12px 14px;background:#f6f3ee;border-radius:6px;white-space:pre-wrap;color:#111827">${escape(inquiry.message)}</p>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;font:15px/1.5 Arial,Helvetica,sans-serif">
<h1 style="margin:0 0 16px;font-size:20px;color:#0f1d33">${escape(KIND_LABEL[inquiry.kind])} from the ${escape(site.name)} website</h1>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rowsOf(inquiry).map(([l, v]) => cell(l, v)).join("")}</table>
${message}
<p style="margin:24px 0 0"><a href="${adminUrl}" style="color:#9a7b3f">Open the inquiry inbox</a></p>
</body></html>`;
}
