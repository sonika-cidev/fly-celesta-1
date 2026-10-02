// Shared by the public forms (client) and their server actions.

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

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export const isCountryCode = (code: string) => COUNTRY_CODES.some((c) => c.code === code);

export function nameError(name: string) {
  if (name.length < 2) return "Enter your name.";
  if (name.length > 120) return "Use 120 characters or fewer.";
}

export function emailError(email: string) {
  if (!EMAIL_PATTERN.test(email) || email.length > 160) return "Enter a valid email address.";
}

export function phoneError(phone: string, required: boolean) {
  if (!phone) return required ? "Enter a valid phone number." : undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 6 || digits.length > 15 || phone.length > 24 || /[^\d\s()-]/.test(phone)) return "Enter a valid phone number.";
}

/** Format check only — whether the answer is right is decided on the server. */
export function captchaAnswerError(answer: string) {
  if (!/^\s*\d{1,3}\s*$/.test(answer)) return "Enter the answer to the sum.";
}

export const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? "";
