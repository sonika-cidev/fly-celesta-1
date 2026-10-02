import "server-only";
import { after } from "next/server";
import { site } from "@/data/site";
import { CAPTCHA_ANSWER_FIELD, CAPTCHA_TOKEN_FIELD, PAGE_FIELD } from "@/lib/forms";
import { verifyChallenge, type CaptchaResult } from "./captcha";
import { getStore, StoreUnavailableError, type Inquiry, type InquiryKind, type NewInquiry } from "./store";

export type SubmissionFailure = {
  /** Shown above the submit button. */
  message: string;
  /** Shown under the security question. */
  captcha?: string;
};

const CAPTCHA_MESSAGES: Record<Exclude<CaptchaResult, "ok">, string> = {
  wrong: "Incorrect answer — please solve the new sum.",
  expired: "That question expired — please solve the new sum.",
  invalid: "Please solve the security question.",
};

const contactFallback = `call ${site.phone} or email ${site.email}`;

/** The page a form was sent from, as reported by the browser (informational only). */
export function submittedFrom(formData: FormData) {
  const page = String(formData.get(PAGE_FIELD) ?? "");
  return page.startsWith("/") ? page.slice(0, 200) : "";
}

/**
 * Checks the security question, then stores the inquiry for the admin panel.
 * Resolves null when stored; otherwise a message for the visitor. Either way the
 * question has been used up, so the form must show a new one.
 */
export async function storeSubmission(formData: FormData, inquiry: NewInquiry): Promise<SubmissionFailure | null> {
  try {
    const result = await verifyChallenge(
      String(formData.get(CAPTCHA_TOKEN_FIELD) ?? ""),
      String(formData.get(CAPTCHA_ANSWER_FIELD) ?? ""),
    );
    if (result !== "ok") return { message: "Please check the highlighted fields.", captcha: CAPTCHA_MESSAGES[result] };

    const saved = await getStore().insertInquiry(inquiry);
    after(() => notify(saved));
    return null;
  } catch (error) {
    if (error instanceof StoreUnavailableError) {
      // Never confirm a request that isn't stored anywhere.
      console.error("[inquiries] DATABASE_URL is not set — inquiry not stored");
      return { message: `Online requests aren't connected yet. Please ${contactFallback}.` };
    }
    console.error("[inquiries] could not store inquiry", error);
    return { message: `We couldn't send your request just now. Please try again, or ${contactFallback}.` };
  }
}

/**
 * Optional: forwards each stored inquiry as JSON to INQUIRY_WEBHOOK_URL (e.g. a Zapier/Make
 * webhook that emails the team). The admin panel remains the record of every inquiry.
 */
async function notify(inquiry: Inquiry) {
  const url = process.env.INQUIRY_WEBHOOK_URL || process.env.CHARTER_REQUEST_WEBHOOK_URL;
  if (!url) return;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...inquiry, createdAt: inquiry.createdAt.toISOString(), source: "flycelesta website" }),
    });
    if (!response.ok) console.error(`[inquiries] webhook responded with ${response.status}`);
  } catch (error) {
    console.error("[inquiries] webhook failed", error);
  }
}

export function listInquiries(options: { kind?: InquiryKind; limit: number; offset: number }) {
  return getStore().listInquiries(options);
}
