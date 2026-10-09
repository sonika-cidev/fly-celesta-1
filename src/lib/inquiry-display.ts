import type { Inquiry, InquiryKind } from "@/lib/server/store";

// How an inquiry is labelled and dated, shared by the admin inbox and the notification email.

export const KIND_LABEL: Record<InquiryKind, string> = { charter: "Charter request", enquiry: "Enquiry", career: "Career" };

const received = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** When the inquiry arrived, in India time. */
export const formatReceived = (date: Date) => `${received.format(date)} IST`;

const day = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" });
const formatDate = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? day.format(new Date(`${iso}T00:00:00Z`)) : iso);

/** Route, dates, passengers and aircraft of a charter request as [label, value] pairs; empty for other kinds. */
export function charterRows(inquiry: Inquiry): [string, string][] {
  if (inquiry.kind !== "charter") return [];
  const d = inquiry.details;
  return (
    [
      ["Route", d.from && d.to ? `${d.from} → ${d.to}` : undefined],
      ["Trip", d.tripType],
      ["Departure", formatDate(d.departureDate)],
      ["Return", formatDate(d.returnDate)],
      ["Passengers", d.passengers],
      ["Aircraft", d.aircraftType],
    ] as [string, string | undefined][]
  ).filter((row): row is [string, string] => Boolean(row[1]));
}
