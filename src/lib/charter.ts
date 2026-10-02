// Shared by the charter request form (client) and its server action.
import { emailError, isCountryCode, nameError, phoneError, type FormState } from "./forms";

export { COUNTRY_CODES } from "./forms";

export const AIRCRAFT_TYPES = ["Helicopter", "Private Jet", "Turboprop"] as const;
export type AircraftType = (typeof AIRCRAFT_TYPES)[number];

export const TRIP_TYPES = ["One Way", "Round Trip"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param earliestDate ISO date (YYYY-MM-DD) before which departures are rejected; omit to skip.
 */
export function validateCharter(f: CharterFields, earliestDate?: string): CharterErrors {
  const errors: CharterErrors = {};

  if (!AIRCRAFT_TYPES.includes(f.aircraftType as AircraftType)) errors.aircraftType = "Choose an aircraft type.";
  if (!TRIP_TYPES.includes(f.tripType as TripType)) errors.tripType = "Choose one way or round trip.";
  if (f.from.length < 2 || f.from.length > 80) errors.from = "Enter a departure city.";
  if (f.to.length < 2 || f.to.length > 80) errors.to = "Enter an arrival city.";

  if (!ISO_DATE.test(f.departureDate)) errors.departureDate = "Choose a departure date.";
  else if (earliestDate && f.departureDate < earliestDate) errors.departureDate = "Departure can't be in the past.";

  if (f.tripType === "Round Trip") {
    if (!ISO_DATE.test(f.returnDate)) errors.returnDate = "Choose a return date.";
    else if (ISO_DATE.test(f.departureDate) && f.returnDate < f.departureDate)
      errors.returnDate = "Return must be after departure.";
  }

  const pax = Number(f.passengers);
  if (!Number.isInteger(pax) || pax < 1 || pax > 99) errors.passengers = "Enter 1–99 passengers.";

  const name = nameError(f.name);
  if (name) errors.name = name;
  const email = emailError(f.email);
  if (email) errors.email = email;
  const phone = isCountryCode(f.countryCode) ? phoneError(f.phone, true) : "Choose a country code.";
  if (phone) errors.phone = phone;
  if (f.requirements.length > 4000) errors.requirements = "Use 4,000 characters or fewer.";

  return errors;
}
