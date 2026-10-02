"use server";

import { randomUUID } from "node:crypto";
import { CAPTCHA_ANSWER_FIELD, captchaAnswerError, firstNameOf } from "@/lib/forms";
import { INQUIRY_FIELD_NAMES, validateInquiry, type InquiryFields, type InquiryState } from "@/lib/inquiry";
import { storeSubmission, submittedFrom } from "@/lib/server/inquiries";

/** General enquiries from the contact, service and career pages. */
export async function submitInquiry(_previous: InquiryState, formData: FormData): Promise<InquiryState> {
  const fields = Object.fromEntries(
    INQUIRY_FIELD_NAMES.map((name) => [name, String(formData.get(name) ?? "").trim()]),
  ) as InquiryFields;

  const errors = validateInquiry(fields);
  const captcha = captchaAnswerError(String(formData.get(CAPTCHA_ANSWER_FIELD) ?? ""));
  if (Object.keys(errors).length > 0 || captcha) {
    return { status: "error", message: "Please check the highlighted fields.", errors: { ...errors, ...(captcha && { captcha }) } };
  }

  const failure = await storeSubmission(formData, {
    kind: fields.topic === "Careers" ? "career" : "enquiry",
    topic: fields.topic,
    name: fields.name,
    email: fields.email,
    phone: fields.phone ? `${fields.countryCode} ${fields.phone}` : "",
    message: fields.message,
    details: {},
    page: submittedFrom(formData),
  });

  if (failure) {
    return {
      status: "error",
      message: failure.message,
      ...(failure.captcha && { errors: { captcha: failure.captcha } }),
      captchaReset: randomUUID(),
    };
  }
  return { status: "success", firstName: firstNameOf(fields.name) };
}
