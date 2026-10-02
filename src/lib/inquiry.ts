// Shared by the general enquiry form (contact, service and career pages) and its server action.
import { emailError, isCountryCode, nameError, phoneError, type FormState } from "./forms";

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

export function validateInquiry(f: InquiryFields): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!isInquiryTopic(f.topic)) errors.topic = "Choose a topic.";
  const name = nameError(f.name);
  if (name) errors.name = name;
  const email = emailError(f.email);
  if (email) errors.email = email;
  if (!isCountryCode(f.countryCode)) errors.phone = "Choose a country code.";
  const phone = phoneError(f.phone, false);
  if (phone) errors.phone = phone;
  if (f.message.length < 10) errors.message = "Please add a short message (at least 10 characters).";
  else if (f.message.length > 4000) errors.message = "Use 4,000 characters or fewer.";
  return errors;
}
