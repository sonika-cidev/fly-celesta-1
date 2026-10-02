// Shared by the public forms (client) and their server actions, so both apply the same rules.

export const CAPTCHA_TOKEN_FIELD = "captchaToken";
export const CAPTCHA_ANSWER_FIELD = "captchaAnswer";
/** Hidden field: the page a form was sent from (shown to the admin). */
export const PAGE_FIELD = "page";

export type FormErrors<K extends string> = Partial<Record<K | "captcha", string>>;

export type FormState<K extends string> =
  | { status: "idle" }
  | { status: "success"; firstName: string }
  | {
      status: "error";
      message: string;
      errors?: FormErrors<K>;
      /** Present when the security question was used up; a new value tells the form to load a fresh one. */
      captchaReset?: string;
    };

/** Longest accepted values — used by the inputs' maxLength and by the checks below. */
export const LIMITS = { name: 80, email: 160, phone: 20, place: 60, message: 2000, requirements: 1000 } as const;

/** National number lengths (without the country code or a leading 0) for each dialling code offered. */
export const COUNTRY_CODES = [
  { code: "+91", label: "India +91", min: 10, max: 10 },
  { code: "+977", label: "Nepal +977", min: 8, max: 10 },
  { code: "+975", label: "Bhutan +975", min: 7, max: 8 },
  { code: "+880", label: "Bangladesh +880", min: 8, max: 10 },
  { code: "+94", label: "Sri Lanka +94", min: 9, max: 9 },
  { code: "+960", label: "Maldives +960", min: 7, max: 7 },
  { code: "+971", label: "UAE +971", min: 8, max: 9 },
  { code: "+966", label: "Saudi Arabia +966", min: 8, max: 9 },
  { code: "+974", label: "Qatar +974", min: 8, max: 8 },
  { code: "+968", label: "Oman +968", min: 8, max: 8 },
  { code: "+65", label: "Singapore +65", min: 8, max: 8 },
  { code: "+66", label: "Thailand +66", min: 8, max: 9 },
  { code: "+44", label: "UK +44", min: 9, max: 10 },
  { code: "+1", label: "USA / Canada +1", min: 10, max: 10 },
  { code: "+61", label: "Australia +61", min: 9, max: 9 },
  { code: "+49", label: "Germany +49", min: 6, max: 13 },
  { code: "+33", label: "France +33", min: 9, max: 9 },
] as const;

// Unicode-aware, so names and places in any script are accepted. Built with RegExp so they compile for any TS target.
const NAME_PATTERN = new RegExp("^[\\p{L}\\p{M}][\\p{L}\\p{M}' .’-]*$", "u");
const PLACE_PATTERN = new RegExp("^[\\p{L}\\p{M}\\d][\\p{L}\\p{M}\\d .,'’()&/-]*$", "u");
const LETTERS = new RegExp("\\p{L}", "gu");
const WORD_START = new RegExp("(^|[\\s(/'’-])(\\p{Ll})", "gu");

export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

const letterCount = (value: string) => value.match(LETTERS)?.length ?? 0;

/** Trims and collapses runs of spaces — for single-line fields. */
export const tidy = (value: string) => value.replace(/\s+/g, " ").trim();

/** "indore" → "Indore". Only touches text typed entirely in lower case, so "McLeod" or "BLR" stay as written. */
export const capitalizeWords = (value: string) =>
  value === value.toLowerCase() ? value.replace(WORD_START, (_, before: string, letter: string) => before + letter.toUpperCase()) : value;

export function nameError(name: string) {
  if (!name) return "Enter your full name.";
  if (name.length > LIMITS.name) return `Use ${LIMITS.name} characters or fewer.`;
  if (!NAME_PATTERN.test(name)) return "Use letters only — no numbers or symbols.";
  if (letterCount(name) < 2) return "Enter your full name.";
}

export function emailError(email: string) {
  if (!email) return "Enter your email address.";
  const local = email.split("@")[0] ?? "";
  if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email) || email.includes("..") || local.startsWith(".") || local.endsWith(".")) {
    return "Enter a valid email address, like name@example.com.";
  }
}

const countryFor = (code: string) => COUNTRY_CODES.find((c) => c.code === code);
export const isCountryCode = (code: string) => countryFor(code) !== undefined;

/**
 * The national number as plain digits — without a country code or leading 0 typed into the box —
 * or null if it isn't a valid length for that country (Indian numbers must be 10-digit mobiles).
 */
export function nationalNumber(phone: string, countryCode: string): string | null {
  const country = countryFor(countryCode);
  if (!country || !/^\+?[\d\s().-]+$/.test(phone)) return null;
  const fits = (d: string) => d.length >= country.min && d.length <= country.max;
  let digits = phone.replace(/\D/g, "");
  const dialling = country.code.slice(1);
  if (!fits(digits) && digits.startsWith(dialling) && fits(digits.slice(dialling.length))) digits = digits.slice(dialling.length);
  if (!fits(digits) && digits.startsWith("0") && fits(digits.slice(1))) digits = digits.slice(1);
  if (!fits(digits)) return null;
  if (country.code === "+91" && !/^[6-9]/.test(digits)) return null;
  return digits;
}

export function phoneError(phone: string, countryCode: string, required: boolean) {
  const country = countryFor(countryCode);
  if (!country) return "Choose a country code.";
  if (!phone) return required ? "Enter your phone number." : undefined;
  if (/[^\d\s()+.-]/.test(phone)) return "Use digits only.";
  if (nationalNumber(phone, countryCode)) return undefined;
  if (country.code === "+91") return "Enter a valid 10-digit mobile number.";
  const length = country.min === country.max ? `${country.min}-digit` : `${country.min}–${country.max} digit`;
  return `Enter a valid ${length} phone number.`;
}

/** "+91 9845022222" — the form stored and shown in the inquiry inbox. */
export function formatPhone(phone: string, countryCode: string) {
  const digits = phone ? nationalNumber(phone, countryCode) : null;
  return digits ? `${countryCode} ${digits}` : "";
}

/** City or airport names, e.g. "Bengaluru" or "Kempegowda Intl (BLR)". */
export function placeError(place: string, kind: "departure" | "arrival") {
  if (!place) return kind === "departure" ? "Enter where you're flying from." : "Enter where you're flying to.";
  if (place.length > LIMITS.place) return `Use ${LIMITS.place} characters or fewer.`;
  if (!PLACE_PATTERN.test(place) || letterCount(place) < 2) return "Enter a valid city or airport name.";
}

export function messageError(message: string, { min = 20, max = LIMITS.message }: { min?: number; max?: number } = {}) {
  if (!message) return "Enter your message.";
  if (message.length < min) return `Please add a little more detail (at least ${min} characters).`;
  if (message.length > max) return `Use ${max.toLocaleString("en-IN")} characters or fewer.`;
}

/** Format check only — whether the answer is right is decided on the server. */
export function captchaAnswerError(answer: string) {
  if (!answer.trim()) return "Enter the answer to the sum.";
  if (!/^\s*\d{1,3}\s*$/.test(answer)) return "Enter the answer as a number.";
}

export const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? "";
