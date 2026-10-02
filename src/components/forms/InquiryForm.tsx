"use client";

import { useActionState, useId, useState, type ChangeEvent, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { submitInquiry } from "@/app/actions/inquiry";
import { CAPTCHA_ANSWER_FIELD, COUNTRY_CODES, PAGE_FIELD, captchaAnswerError, type FormErrors } from "@/lib/forms";
import { TOPIC_PROMPTS, isInquiryTopic, validateInquiry, type InquiryFields, type InquiryState, type InquiryTopic } from "@/lib/inquiry";
import { Field } from "./Field";
import { FormSuccess } from "./FormSuccess";
import { MathCaptcha } from "./MathCaptcha";
import styles from "./Form.module.css";

type FieldName = keyof InquiryFields | "captcha";

const initialState: InquiryState = { status: "idle" };

type InquiryFormProps = {
  /** Topics offered in the "Enquiry about" list; a single topic is fixed and the list is hidden. */
  topics: readonly InquiryTopic[];
  defaultTopic?: InquiryTopic;
  /** Heading of the first step, e.g. "Your enquiry" or "Your application". */
  firstStep?: string;
  submitLabel?: string;
  successText?: string;
};

export function InquiryForm(props: InquiryFormProps) {
  // Remounting gives a clean form (and action state) for "send another"
  const [round, setRound] = useState(0);
  return <InquiryFormInner key={round} {...props} onReset={() => setRound((r) => r + 1)} />;
}

function InquiryFormInner({
  topics,
  defaultTopic = topics[0],
  firstStep = "Your enquiry",
  submitLabel = "Send enquiry",
  successText = "Your enquiry is with our team. We’ll be in touch shortly.",
  onReset,
}: InquiryFormProps & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitInquiry, initialState);
  const [values, setValues] = useState<InquiryFields>({
    topic: defaultTopic,
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    message: "",
  });
  const [clientErrors, setClientErrors] = useState<FormErrors<keyof InquiryFields>>({});
  const [edited, setEdited] = useState<ReadonlySet<FieldName>>(new Set());
  const pathname = usePathname();
  const uid = useId();
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  const clearError = (name: FieldName) => {
    setEdited((s) => new Set(s).add(name));
    setClientErrors((errors) => {
      if (!(name in errors)) return errors;
      const next = { ...errors };
      delete next[name];
      return next;
    });
  };
  const bind = (name: keyof InquiryFields) => ({
    id: fieldId(name),
    name,
    value: values[name],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      clearError(name);
    },
  });

  const serverErrors: FormErrors<keyof InquiryFields> = state.status === "error" ? (state.errors ?? {}) : {};
  const errorFor = (name: FieldName) => clientErrors[name] ?? (edited.has(name) ? undefined : serverErrors[name]);
  const describe = (name: FieldName) =>
    errorFor(name) ? { "aria-invalid": true, "aria-describedby": `${fieldId(name)}-error` } : {};

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const errors: FormErrors<keyof InquiryFields> = validateInquiry(values);
    const captcha = captchaAnswerError(String(new FormData(e.currentTarget).get(CAPTCHA_ANSWER_FIELD) ?? ""));
    if (captcha) errors.captcha = captcha;
    const invalid = Object.keys(errors) as FieldName[];
    if (invalid.length > 0) {
      e.preventDefault();
      setClientErrors(errors);
      document.getElementById(fieldId(invalid[0]))?.focus();
      return;
    }
    setClientErrors({});
    setEdited(new Set());
  };

  if (state.status === "success") {
    return <FormSuccess firstName={state.firstName} text={successText} againLabel="Send another message" onAgain={onReset} />;
  }

  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const banner = hasClientErrors ? "Please check the highlighted fields." : state.status === "error" ? state.message : null;
  const captchaKey = state.status === "error" && state.captchaReset ? state.captchaReset : "initial";
  const prompt = isInquiryTopic(values.topic) ? TOPIC_PROMPTS[values.topic] : TOPIC_PROMPTS["General enquiry"];

  return (
    <form className={styles.form} action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name={PAGE_FIELD} value={pathname} />

      <fieldset className={styles.step}>
        <legend className={styles.stepTitle}>
          <span>01</span> {firstStep}
        </legend>

        {topics.length > 1 ? (
          <Field id={fieldId("topic")} label="Enquiry about" error={errorFor("topic")}>
            <select {...bind("topic")} {...describe("topic")} className={`${styles.input} ${styles.select}`}>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <input type="hidden" name="topic" value={values.topic} />
        )}

        <Field id={fieldId("message")} label="Message" error={errorFor("message")}>
          <textarea
            {...bind("message")}
            {...describe("message")}
            rows={5}
            maxLength={4000}
            placeholder={prompt}
            className={`${styles.input} ${styles.textarea}`}
          />
        </Field>
      </fieldset>

      <fieldset className={styles.step}>
        <legend className={styles.stepTitle}>
          <span>02</span> Your details
        </legend>

        <div className={styles.split}>
          <Field id={fieldId("name")} label="Full name" error={errorFor("name")}>
            <input {...bind("name")} {...describe("name")} autoComplete="name" maxLength={120} className={styles.input} />
          </Field>
          <Field id={fieldId("email")} label="Email" error={errorFor("email")}>
            <input {...bind("email")} {...describe("email")} type="email" autoComplete="email" maxLength={160} className={styles.input} />
          </Field>
        </div>

        <Field id={fieldId("phone")} label="Phone (optional)" error={errorFor("phone")}>
          <div className={styles.phone}>
            <select {...bind("countryCode")} aria-label="Country code" className={`${styles.input} ${styles.select}`}>
              {COUNTRY_CODES.map((c) => (
                <option key={c.code + c.label} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input {...bind("phone")} {...describe("phone")} type="tel" autoComplete="tel-national" maxLength={24} className={styles.input} />
          </div>
        </Field>

        <MathCaptcha key={captchaKey} inputId={fieldId("captcha")} error={errorFor("captcha")} onAnswer={() => clearError("captcha")} />
      </fieldset>

      <div className={styles.footer}>
        <AnimatePresence>
          {banner && (
            <motion.p key={banner} role="alert" className={styles.banner} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {banner}
            </motion.p>
          )}
        </AnimatePresence>
        <button type="submit" className={styles.submit} disabled={pending}>
          <span>{pending ? "Sending…" : submitLabel}</span>
          <span className={styles.submitBadge} aria-hidden="true">
            {pending ? (
              <span className={styles.spinner} />
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            )}
          </span>
        </button>
      </div>
    </form>
  );
}
