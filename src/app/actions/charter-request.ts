"use server";

import { randomUUID } from "node:crypto";
import {
  BOOKING_WINDOW_DAYS,
  CHARTER_FIELD_NAMES,
  addDays,
  charterForStorage,
  isoDate,
  tidyCharter,
  validateCharter,
  type CharterFields,
  type CharterRequestState,
} from "@/lib/charter";
import { CAPTCHA_ANSWER_FIELD, captchaAnswerError, firstNameOf } from "@/lib/forms";
import { storeSubmission, submittedFrom } from "@/lib/server/inquiries";

/** Validates a charter request, checks the security question and stores it for the admin panel. */
export async function submitCharterRequest(
  _previous: CharterRequestState,
  formData: FormData,
): Promise<CharterRequestState> {
  const fields = tidyCharter(
    Object.fromEntries(CHARTER_FIELD_NAMES.map((name) => [name, String(formData.get(name) ?? "")])) as CharterFields,
  );

  // A day of slack either side so visitors ahead of or behind UTC can pick their local dates.
  const today = isoDate(new Date());
  const errors = validateCharter(fields, { earliest: addDays(today, -1), latest: addDays(today, BOOKING_WINDOW_DAYS + 1) });
  const captcha = captchaAnswerError(String(formData.get(CAPTCHA_ANSWER_FIELD) ?? ""));
  if (Object.keys(errors).length > 0 || captcha) {
    return { status: "error", message: "Please check the highlighted fields.", errors: { ...errors, ...(captcha && { captcha }) } };
  }

  const request = charterForStorage(fields);
  const roundTrip = request.tripType === "Round Trip";
  const failure = await storeSubmission(formData, {
    kind: "charter",
    topic: `Charter request · ${request.aircraftType}`,
    name: request.name,
    email: request.email,
    phone: request.phone,
    message: request.requirements,
    details: {
      aircraftType: request.aircraftType,
      tripType: request.tripType,
      from: request.from,
      to: request.to,
      departureDate: request.departureDate,
      ...(roundTrip && { returnDate: request.returnDate }),
      passengers: String(Number(request.passengers)),
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
  return { status: "success", firstName: firstNameOf(request.name) };
}
