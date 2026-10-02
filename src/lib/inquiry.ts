// Shared by the general enquiry form (contact, service and career pages) and its server action.
import { capitalizeWords, emailError, formatPhone, messageError, nameError, phoneError, tidy, type FormState } from "./forms";

export const INQUIRY_TOPICS = [
  "General enquiry",
  "Charter services",
  "Aircraft for sale",
  "Aircraft wanted",
  "Aviation consultancy",
  "Unmanned aviation systems",
  "Careers",
] as const;
export type InquiryTopic = (typeof INQUIRY_TOPICS)[number];

/** Prompts for the message box, so each enquiry arrives with the details the team needs. */
export const TOPIC_PROMPTS: Record<InquiryTopic, string> = {
  "General enquiry": "How can we help?",
  "Charter services": "Your route, dates and number of passengers…",
  "Aircraft for sale": "The aircraft you're looking for, your budget and timeline…",
  "Aircraft wanted": "Your aircraft's make, model, year, total hours and location…",
  "Aviation consultancy": "Tell us about your aircraft, operation or project…",
  "Unmanned aviation systems": "Your application, survey area and timeline…",
  Careers: "Your experience, the role you're interested in, and a link to your CV or LinkedIn profile…",
};

export type InquiryFields = {
  topic: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
};

export const INQUIRY_FIELD_NAMES = ["topic", "name", "email", "countryCode", "phone", "message"] as const satisfies readonly (keyof InquiryFields)[];

export type InquiryErrors = Partial<Record<keyof InquiryFields, string>>;

export type InquiryState = FormState<keyof InquiryFields>;

export const isInquiryTopic = (topic: string): topic is InquiryTopic => (INQUIRY_TOPICS as readonly string[]).includes(topic);

/** Trims every field and collapses spaces in single-line ones — run before validating. */
export function tidyInquiry(f: InquiryFields): InquiryFields {
  return {
    topic: tidy(f.topic),
    name: tidy(f.name),
    email: tidy(f.email),
    countryCode: tidy(f.countryCode),
    phone: tidy(f.phone),
    message: f.message.trim(),
  };
}

export function validateInquiry(f: InquiryFields): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!isInquiryTopic(f.topic)) errors.topic = "Choose what your enquiry is about.";
  const message = messageError(f.message);
  if (message) errors.message = message;
  const name = nameError(f.name);
  if (name) errors.name = name;
  const email = emailError(f.email);
  if (email) errors.email = email;
  const phone = phoneError(f.phone, f.countryCode, false);
  if (phone) errors.phone = phone;
  return errors;
}

/** How a valid enquiry is stored: tidy capitals on the name, one phone format. */
export function inquiryForStorage(f: InquiryFields) {
  return { ...f, name: capitalizeWords(f.name), phone: formatPhone(f.phone, f.countryCode) };
}
