"use client";

import { useActionState, useId, useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { submitInquiry } from "@/app/actions/inquiry";
import { COUNTRY_CODES, LIMITS, PAGE_FIELD, captchaAnswerError, tidy, type FormErrors } from "@/lib/forms";
import { TOPIC_PROMPTS, isInquiryTopic, tidyInquiry, validateInquiry, type InquiryFields, type InquiryState, type InquiryTopic } from "@/lib/inquiry";
import { Field } from "./Field";
import { FormSuccess } from "./FormSuccess";
import { MathCaptcha } from "./MathCaptcha";
import { useFormErrors } from "./useFormErrors";
import styles from "./Form.module.css";

type FieldName = keyof InquiryFields | "captcha";

/** On-screen order, so a failed submit lands on the first problem. */
const ORDER: readonly FieldName[] = ["topic", "message", "name", "email", "phone", "captcha"];

/** Single-line fields tidied (trimmed, single spaces) when the visitor leaves them. */
const SINGLE_LINE = new Set<keyof InquiryFields>(["name", "email", "phone"]);

/** Keeps only what can appear in a phone number. */
const phoneCharacters = (value: string) => value.replace(/[^\d\s()+.-]/g, "");

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
  const pathname = usePathname();
  const uid = useId();
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  // A used-up security question is replaced by a fresh one (new key → remount), which clears its answer.
  const captchaKey = state.status === "error" && state.captchaReset ? state.captchaReset : "initial";
  const [captcha, setCaptcha] = useState({ key: captchaKey, answer: "" });
  const captchaAnswer = captcha.key === captchaKey ? captcha.answer : "";

  const errors: FormErrors<keyof InquiryFields> = validateInquiry(tidyInquiry(values));
  const captchaProblem = captchaAnswerError(captchaAnswer);
  if (captchaProblem) errors.captcha = captchaProblem;

  const form = useFormErrors({
    errors,
    response: state,
    serverErrors: state.status === "error" ? (state.errors ?? {}) : {},
    order: ORDER,
    fieldId,
  });

  const update = (name: keyof InquiryFields, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    form.changed(name);
  };

  const bind = (name: keyof InquiryFields, clean: (value: string) => string = (value) => value) => ({
    id: fieldId(name),
    name,
    value: values[name],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update(name, clean(e.target.value)),
    onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      form.left(name, e.target.value);
      if (SINGLE_LINE.has(name)) setValues((v) => (v[name] === tidy(v[name]) ? v : { ...v, [name]: tidy(v[name]) }));
    },
    ...form.describe(name),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (!form.check()) e.preventDefault();
  };

  if (state.status === "success") {
    return <FormSuccess firstName={state.firstName} text={successText} againLabel="Send another message" onAgain={onReset} />;
  }

  const banner = form.blocked ? "Please check the highlighted fields." : state.status === "error" ? state.message : null;
  const prompt = isInquiryTopic(values.topic) ? TOPIC_PROMPTS[values.topic] : TOPIC_PROMPTS["General enquiry"];

  return (
    <form className={styles.form} action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name={PAGE_FIELD} value={pathname} />

      <fieldset className={styles.step}>
        <legend className={styles.stepTitle}>
          <span>01</span> {firstStep}
        </legend>

        {topics.length > 1 ? (
          <Field id={fieldId("topic")} label="Enquiry about" error={form.errorFor("topic")}>
            <select {...bind("topic")} required className={`${styles.input} ${styles.select}`}>
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

        <Field
          id={fieldId("message")}
          label="Message"
          error={form.errorFor("message")}
          counter={`${values.message.length.toLocaleString("en-IN")} / ${LIMITS.message.toLocaleString("en-IN")}`}
        >
          <textarea
            {...bind("message")}
            rows={5}
            maxLength={LIMITS.message}
            placeholder={prompt}
            required
            className={`${styles.input} ${styles.textarea}`}
          />
        </Field>
      </fieldset>

      <fieldset className={styles.step}>
        <legend className={styles.stepTitle}>
          <span>02</span> Your details
        </legend>

        <div className={styles.split}>
          <Field id={fieldId("name")} label="Full name" error={form.errorFor("name")}>
            <input {...bind("name")} autoComplete="name" autoCapitalize="words" maxLength={LIMITS.name} required className={styles.input} />
          </Field>
          <Field id={fieldId("email")} label="Email" error={form.errorFor("email")}>
            <input
              {...bind("email")}
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={LIMITS.email}
              required
              className={styles.input}
            />
          </Field>
        </div>

        <Field id={fieldId("phone")} label="Phone (optional)" error={form.errorFor("phone")}>
          <div className={styles.phone}>
            <select
              id={fieldId("countryCode")}
              name="countryCode"
              value={values.countryCode}
              onChange={(e) => {
                update("countryCode", e.target.value);
                form.changed("phone");
              }}
              aria-label="Country code"
              className={`${styles.input} ${styles.select}`}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code + c.label} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              {...bind("phone", phoneCharacters)}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              maxLength={LIMITS.phone}
              placeholder={values.countryCode === "+91" ? "10-digit mobile number" : "Phone number"}
              className={styles.input}
            />
          </div>
        </Field>

        <MathCaptcha
          key={captchaKey}
          inputId={fieldId("captcha")}
          error={form.errorFor("captcha")}
          onAnswer={(answer) => {
            setCaptcha({ key: captchaKey, answer });
            form.changed("captcha");
          }}
          onBlur={() => form.left("captcha", captchaAnswer)}
        />
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
