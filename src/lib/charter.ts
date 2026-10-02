// Shared by the charter request form (client) and its server action.
import {
  LIMITS,
  capitalizeWords,
  emailError,
  formatPhone,
  nameError,
  phoneError,
  placeError,
  tidy,
  type FormState,
} from "./forms";

export { COUNTRY_CODES } from "./forms";

export const AIRCRAFT_TYPES = ["Helicopter", "Private Jet", "Turboprop"] as const;
export type AircraftType = (typeof AIRCRAFT_TYPES)[number];

export const TRIP_TYPES = ["One Way", "Round Trip"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

/** Most passengers one aircraft of each type can take; larger groups go in the requirements. */
export const MAX_PASSENGERS: Record<AircraftType, number> = { Helicopter: 15, "Private Jet": 19, Turboprop: 12 };

/** How far ahead a flight can be requested. */
export const BOOKING_WINDOW_DAYS = 365;

/**
 * Window event that pre-fills the charter form — fired by fleet cards and
 * "Book this deal" buttons. Every field is optional.
 */
export const PREFILL_EVENT = "flycelesta:charter-prefill";
export type CharterPrefill = Partial<{
  aircraftType: AircraftType;
  from: string;
  to: string;
  departureDate: string;
  passengers: string;
  /** Added to the requirements box if the visitor hasn't written anything yet. */
  note: string;
}>;

export function prefillCharter(detail: CharterPrefill) {
  window.dispatchEvent(new CustomEvent<CharterPrefill>(PREFILL_EVENT, { detail }));
}

export type CharterFields = {
  aircraftType: string;
  tripType: string;
  from: string;
  to: string;
  departureDate: string;
  returnDate: string;
  passengers: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  requirements: string;
};

export const CHARTER_FIELD_NAMES = [
  "aircraftType",
  "tripType",
  "from",
  "to",
  "departureDate",
  "returnDate",
  "passengers",
  "name",
  "email",
  "countryCode",
  "phone",
  "requirements",
] as const satisfies readonly (keyof CharterFields)[];

export type CharterErrors = Partial<Record<keyof CharterFields, string>>;

export type CharterRequestState = FormState<keyof CharterFields>;

/* ------------------------------------------------------------------ Dates (ISO YYYY-MM-DD, UTC) */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoDate(date);
}

/** A real calendar date — rejects things like 2026-02-30. */
function isRealDate(iso: string) {
  if (!ISO_DATE.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && isoDate(date) === iso;
}

/** Earliest and latest dates accepted (ISO). */
export type DateWindow = { earliest?: string; latest?: string };

function dateError(value: string, kind: "departure" | "return", { earliest, latest }: DateWindow) {
  if (!value) return `Choose a ${kind} date.`;
  if (!isRealDate(value)) return "Enter a valid date.";
  if (earliest && value < earliest) return kind === "departure" ? "Departure can't be in the past." : "Return can't be in the past.";
  if (latest && value > latest) return "Choose a date within the next 12 months.";
}

/* ------------------------------------------------------------------ Validation */

const samePlace = (a: string, b: string) => tidy(a).toLowerCase() === tidy(b).toLowerCase();

/** Trims every field and collapses spaces in single-line ones — run before validating. */
export function tidyCharter(f: CharterFields): CharterFields {
  return {
    aircraftType: tidy(f.aircraftType),
    tripType: tidy(f.tripType),
    from: tidy(f.from),
    to: tidy(f.to),
    departureDate: tidy(f.departureDate),
    returnDate: tidy(f.returnDate),
    passengers: tidy(f.passengers),
    name: tidy(f.name),
    email: tidy(f.email),
    countryCode: tidy(f.countryCode),
    phone: tidy(f.phone),
    requirements: f.requirements.trim(),
  };
}

export function validateCharter(f: CharterFields, window: DateWindow = {}): CharterErrors {
  const errors: CharterErrors = {};
  const aircraft = f.aircraftType as AircraftType;

  if (!AIRCRAFT_TYPES.includes(aircraft)) errors.aircraftType = "Choose an aircraft type.";
  if (!TRIP_TYPES.includes(f.tripType as TripType)) errors.tripType = "Choose one way or round trip.";

  const maxPassengers = MAX_PASSENGERS[aircraft] ?? Math.max(...Object.values(MAX_PASSENGERS));
  if (!/^\d{1,2}$/.test(f.passengers) || Number(f.passengers) < 1) errors.passengers = "Enter the number of passengers.";
  else if (Number(f.passengers) > maxPassengers) errors.passengers = `Up to ${maxPassengers} for a ${aircraft.toLowerCase()}.`;

  const from = placeError(f.from, "departure");
  if (from) errors.from = from;
  const to = placeError(f.to, "arrival");
  if (to) errors.to = to;
  else if (!from && samePlace(f.from, f.to)) errors.to = "Arrival must be different from departure.";

  const departure = dateError(f.departureDate, "departure", window);
  if (departure) errors.departureDate = departure;
  if (f.tripType === "Round Trip") {
    const back = dateError(f.returnDate, "return", window);
    if (back) errors.returnDate = back;
    else if (!departure && f.returnDate < f.departureDate) errors.returnDate = "Return can't be before departure.";
  }

  const name = nameError(f.name);
  if (name) errors.name = name;
  const email = emailError(f.email);
  if (email) errors.email = email;
  const phone = phoneError(f.phone, f.countryCode, true);
  if (phone) errors.phone = phone;
  if (f.requirements.length > LIMITS.requirements) errors.requirements = `Use ${LIMITS.requirements.toLocaleString("en-IN")} characters or fewer.`;

  return errors;
}

/** How a valid request is stored: tidy capitals on names and places, one phone format. */
export function charterForStorage(f: CharterFields) {
  return {
    ...f,
    from: capitalizeWords(f.from),
    to: capitalizeWords(f.to),
    name: capitalizeWords(f.name),
    phone: formatPhone(f.phone, f.countryCode),
  };
}
