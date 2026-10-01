"use server";

import { site } from "@/data/site";
import {
  CHARTER_FIELD_NAMES,
  validateCharter,
  type CharterFields,
  type CharterRequestState,
} from "@/lib/charter";

/**
 * Validates a charter request and forwards it as JSON to CHARTER_REQUEST_WEBHOOK_URL
 * (an email/CRM automation such as Zapier, Make or a custom endpoint).
 */
export async function submitCharterRequest(
  _previous: CharterRequestState,
  formData: FormData,
): Promise<CharterRequestState> {
  const fields = Object.fromEntries(
    CHARTER_FIELD_NAMES.map((name) => [name, String(formData.get(name) ?? "").trim()]),
  ) as CharterFields;

  // A day of slack so visitors ahead of or behind UTC can still pick their local "today".
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const errors = validateCharter(fields, yesterday);
  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Please check the highlighted fields.", errors };
  }

  const webhook = process.env.CHARTER_REQUEST_WEBHOOK_URL;
  const fallback = `Please call ${site.phone} or email ${site.email}.`;

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, submittedAt: new Date().toISOString(), source: "website: request a charter" }),
      });
      if (!response.ok) throw new Error(`Webhook responded with ${response.status}`);
    } catch (error) {
      console.error("[charter-request] delivery failed", error);
      return { status: "error", message: `We couldn't send your request just now. ${fallback}` };
    }
  } else if (process.env.NODE_ENV === "production") {
    // Never confirm a request that isn't going anywhere.
    console.error("[charter-request] CHARTER_REQUEST_WEBHOOK_URL is not set — request not delivered");
    return { status: "error", message: `Online requests aren't connected yet. ${fallback}` };
  } else {
    console.info("[charter-request] dev mode, not forwarded:", fields);
  }

  return { status: "success", firstName: fields.name.split(/\s+/)[0] };
}
