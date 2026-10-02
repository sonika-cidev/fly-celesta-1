"use server";

import { randomUUID } from "node:crypto";
import { CHARTER_FIELD_NAMES, validateCharter, type CharterFields, type CharterRequestState } from "@/lib/charter";
import { CAPTCHA_ANSWER_FIELD, captchaAnswerError, firstNameOf } from "@/lib/forms";
import { storeSubmission, submittedFrom } from "@/lib/server/inquiries";

/** Validates a charter request, checks the security question and stores it for the admin panel. */
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
  const captcha = captchaAnswerError(String(formData.get(CAPTCHA_ANSWER_FIELD) ?? ""));
  if (Object.keys(errors).length > 0 || captcha) {
    return { status: "error", message: "Please check the highlighted fields.", errors: { ...errors, ...(captcha && { captcha }) } };
  }

  const roundTrip = fields.tripType === "Round Trip";
  const failure = await storeSubmission(formData, {
    kind: "charter",
    topic: `Charter request · ${fields.aircraftType}`,
    name: fields.name,
    email: fields.email,
    phone: `${fields.countryCode} ${fields.phone}`,
    message: fields.requirements,
    details: {
      aircraftType: fields.aircraftType,
      tripType: fields.tripType,
      from: fields.from,
      to: fields.to,
      departureDate: fields.departureDate,
      ...(roundTrip && { returnDate: fields.returnDate }),
      passengers: fields.passengers,
    },
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
