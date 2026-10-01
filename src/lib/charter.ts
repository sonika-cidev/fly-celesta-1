// Shared by the charter request form (client) and its server action.

export const AIRCRAFT_TYPES = ["Helicopter", "Private Jet", "Turboprop"] as const;
export type AircraftType = (typeof AIRCRAFT_TYPES)[number];

export const TRIP_TYPES = ["One Way", "Round Trip"] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const COUNTRY_CODES = [
  { code: "+91", label: "India +91" },
  { code: "+977", label: "Nepal +977" },
  { code: "+975", label: "Bhutan +975" },
  { code: "+880", label: "Bangladesh +880" },
  { code: "+94", label: "Sri Lanka +94" },
  { code: "+960", label: "Maldives +960" },
  { code: "+971", label: "UAE +971" },
  { code: "+966", label: "Saudi Arabia +966" },
  { code: "+974", label: "Qatar +974" },
  { code: "+968", label: "Oman +968" },
  { code: "+65", label: "Singapore +65" },
  { code: "+66", label: "Thailand +66" },
  { code: "+44", label: "UK +44" },
  { code: "+1", label: "USA / Canada +1" },
  { code: "+61", label: "Australia +61" },
  { code: "+49", label: "Germany +49" },
  { code: "+33", label: "France +33" },
];

/** Window event a "Book this deal" link fires so the form can pre-select the aircraft. */
export const PREFILL_EVENT = "flycelesta:charter-prefill";
export type CharterPrefill = { aircraftType: AircraftType; aircraft: string; rate: string };

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

export type CharterRequestState =
  | { status: "idle" }
  | { status: "success"; firstName: string }
  | { status: "error"; message: string; errors?: CharterErrors };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param earliestDate ISO date (YYYY-MM-DD) before which departures are rejected; omit to skip.
 */
export function validateCharter(f: CharterFields, earliestDate?: string): CharterErrors {
  const errors: CharterErrors = {};

  if (!AIRCRAFT_TYPES.includes(f.aircraftType as AircraftType)) errors.aircraftType = "Choose an aircraft type.";
  if (!TRIP_TYPES.includes(f.tripType as TripType)) errors.tripType = "Choose one way or round trip.";
  if (f.from.length < 2) errors.from = "Enter a departure city.";
  if (f.to.length < 2) errors.to = "Enter an arrival city.";

  if (!ISO_DATE.test(f.departureDate)) errors.departureDate = "Choose a departure date.";
  else if (earliestDate && f.departureDate < earliestDate) errors.departureDate = "Departure can't be in the past.";

  if (f.tripType === "Round Trip") {
    if (!ISO_DATE.test(f.returnDate)) errors.returnDate = "Choose a return date.";
    else if (ISO_DATE.test(f.departureDate) && f.returnDate < f.departureDate)
      errors.returnDate = "Return must be after departure.";
  }

  const pax = Number(f.passengers);
  if (!Number.isInteger(pax) || pax < 1 || pax > 99) errors.passengers = "Enter 1–99 passengers.";

  if (f.name.length < 2) errors.name = "Enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errors.email = "Enter a valid email address.";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15 || /[^\d\s()-]/.test(f.phone)) errors.phone = "Enter a valid phone number.";

  return errors;
}
