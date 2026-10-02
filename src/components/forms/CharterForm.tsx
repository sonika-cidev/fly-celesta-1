"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { submitCharterRequest } from "@/app/actions/charter-request";
import {
  AIRCRAFT_TYPES,
  COUNTRY_CODES,
  PREFILL_EVENT,
  TRIP_TYPES,
  validateCharter,
  type AircraftType,
  type CharterFields,
  type CharterPrefill,
  type CharterRequestState,
} from "@/lib/charter";
import { CAPTCHA_ANSWER_FIELD, PAGE_FIELD, captchaAnswerError, type FormErrors } from "@/lib/forms";
import { Field } from "./Field";
import { FormSuccess } from "./FormSuccess";
import { MathCaptcha } from "./MathCaptcha";
import styles from "./Form.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

type FieldName = keyof CharterFields | "captcha";

const initialState: CharterRequestState = { status: "idle" };

const emptyFields: CharterFields = {
  aircraftType: "Helicopter",
  tripType: "One Way",
  from: "",
  to: "",
  departureDate: "",
  returnDate: "",
  passengers: "2",
  name: "",
  email: "",
  countryCode: "+91",
  phone: "",
  requirements: "",
};

// The visitor's local date; empty during the server render so hydration always matches.
const noopSubscribe = () => () => {};
const useToday = () => useSyncExternalStore(noopSubscribe, () => new Date().toLocaleDateString("en-CA"), () => "");

const iconProps = {
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const aircraftIcons: Record<AircraftType, ReactNode> = {
  Helicopter: (
    <svg {...iconProps}>
      <path d="M4 7h18M13 7v3" />
      <path d="M6 15.5c0-3 2.4-5.5 5.5-5.5H15a4 4 0 0 1 4 4v1.5a2 2 0 0 1-2 2H8.5A2.5 2.5 0 0 1 6 15.5z" />
      <path d="M19 13h8l1.5-3M8 21h11M10 17.5V21M16 17.5V21" />
    </svg>
  ),
  "Private Jet": (
    <svg {...iconProps}>
      <path d="M16 3c1 0 1.7 1.2 1.7 2.6V12l10.3 6v2.4l-10.3-3.2v5.6l3 2.2V27L16 25.8 11.3 27v-2l3-2.2v-5.6L4 20.4V18l10.3-6V5.6C14.3 4.2 15 3 16 3z" />
    </svg>
  ),
  Turboprop: (
    <svg {...iconProps}>
      <path d="M16 3c.9 0 1.5 1 1.5 2.3V12h10.5v2.6l-10.5 1.6v6.4l3 2V27L16 26l-4.5 1v-2.4l3-2v-6.4L4 14.6V12h10.5V5.3C14.5 4 15.1 3 16 3z" />
      <path d="M8.5 9.5v5M23.5 9.5v5" />
    </svg>
  ),
};

export function CharterForm() {
  // Remounting gives a clean form (and action state) for "plan another flight"
  const [round, setRound] = useState(0);
  return <CharterFormInner key={round} onReset={() => setRound((r) => r + 1)} />;
}

function CharterFormInner({ onReset }: { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitCharterRequest, initialState);
  const [values, setValues] = useState<CharterFields>(emptyFields);
  const [clientErrors, setClientErrors] = useState<FormErrors<keyof CharterFields>>({});
  const [edited, setEdited] = useState<ReadonlySet<FieldName>>(new Set());
  const [swapTurns, setSwapTurns] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const pathname = usePathname();
  const today = useToday();
  const uid = useId();
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  // Pre-fill from fleet cards and "Book this deal"
  useEffect(() => {
    const onPrefill = (event: Event) => {
      const detail = (event as CustomEvent<CharterPrefill>).detail;
      setValues((v) => ({
        ...v,
        ...(detail.aircraftType && { aircraftType: detail.aircraftType }),
        ...(detail.from && { from: detail.from }),
        ...(detail.to && { to: detail.to }),
        ...(detail.departureDate && { departureDate: detail.departureDate }),
        ...(detail.passengers && { passengers: detail.passengers }),
        requirements: detail.note && !v.requirements.trim() ? detail.note : v.requirements,
      }));
      setHighlight((h) => h + 1);
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, []);

  const clearError = (name: FieldName) => {
    setEdited((s) => new Set(s).add(name));
    setClientErrors((errors) => {
      if (!(name in errors)) return errors;
      const next = { ...errors };
      delete next[name];
      return next;
    });
  };
  const update = (name: keyof CharterFields, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    clearError(name);
  };
  const bind = (name: keyof CharterFields) => ({
    id: fieldId(name),
    name,
    value: values[name],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update(name, e.target.value),
  });

  const serverErrors: FormErrors<keyof CharterFields> = state.status === "error" ? (state.errors ?? {}) : {};
  const errorFor = (name: FieldName) => clientErrors[name] ?? (edited.has(name) ? undefined : serverErrors[name]);
  const describe = (name: FieldName) =>
    errorFor(name) ? { "aria-invalid": true, "aria-describedby": `${fieldId(name)}-error` } : {};

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const errors: FormErrors<keyof CharterFields> = validateCharter(values, today || undefined);
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

  const swapRoute = () => {
    setValues((v) => ({ ...v, from: v.to, to: v.from }));
    setSwapTurns((t) => t + 1);
  };

  const stepPassengers = (delta: number) => {
    const current = Number.parseInt(values.passengers, 10) || 0;
    update("passengers", String(Math.min(99, Math.max(1, current + delta))));
  };

  if (state.status === "success") {
    return (
      <FormSuccess
        firstName={state.firstName}
        text="Your charter request is with our team. We’ll be in touch shortly with aircraft options and a quote."
        againLabel="Plan another flight"
        onAgain={onReset}
      />
    );
  }

  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const banner = hasClientErrors ? "Please check the highlighted fields." : state.status === "error" ? state.message : null;
  // A used-up security question is replaced by a fresh one (new key → remount).
  const captchaKey = state.status === "error" && state.captchaReset ? state.captchaReset : "initial";

  return (
    <form className={styles.form} action={formAction} onSubmit={handleSubmit} noValidate>
      <motion.div
        key={highlight}
        className={styles.prefillGlow}
        initial={{ opacity: highlight ? 1 : 0 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.6, ease: EASE }}
        aria-hidden="true"
      />
      <input type="hidden" name={PAGE_FIELD} value={pathname} />

      <fieldset className={styles.step}>
        <legend className={styles.stepTitle}>
          <span>01</span> Your flight
        </legend>

        <div className={styles.group} role="radiogroup" aria-label="Aircraft type">
          {AIRCRAFT_TYPES.map((type) => {
            const checked = values.aircraftType === type;
            return (
              <label key={type} className={styles.typeOption} data-checked={checked}>
                <input
                  type="radio"
                  name="aircraftType"
                  value={type}
                  checked={checked}
                  onChange={() => update("aircraftType", type)}
                  className="sr-only"
                />
                {checked && <motion.span layoutId={`${uid}-type`} className={styles.typeHighlight} transition={SPRING} />}
                <span className={styles.typeIcon} aria-hidden="true">
                  {aircraftIcons[type]}
                </span>
                <span className={styles.typeLabel}>{type}</span>
              </label>
            );
          })}
        </div>

        <div className={styles.split}>
          <div className={styles.segmented} role="radiogroup" aria-label="Trip">
            {TRIP_TYPES.map((trip) => {
              const checked = values.tripType === trip;
              return (
                <label key={trip} className={styles.segment} data-checked={checked}>
                  <input
                    type="radio"
                    name="tripType"
                    value={trip}
                    checked={checked}
                    onChange={() => update("tripType", trip)}
                    className="sr-only"
                  />
                  {checked && <motion.span layoutId={`${uid}-trip`} className={styles.segmentPill} transition={SPRING} />}
                  <span className={styles.segmentLabel}>{trip}</span>
                </label>
              );
            })}
          </div>

          <Field id={fieldId("passengers")} label="Passengers" error={errorFor("passengers")}>
            <div className={styles.stepper}>
              <button type="button" aria-label="Fewer passengers" onClick={() => stepPassengers(-1)} disabled={Number(values.passengers) <= 1}>
                −
              </button>
              <input {...bind("passengers")} {...describe("passengers")} inputMode="numeric" className={styles.stepperInput} />
              <button type="button" aria-label="More passengers" onClick={() => stepPassengers(1)}>
                +
              </button>
            </div>
          </Field>
        </div>

        <div className={styles.route}>
          <Field id={fieldId("from")} label="From" error={errorFor("from")}>
            <input {...bind("from")} {...describe("from")} placeholder="Departure city" maxLength={80} className={styles.input} />
          </Field>
          <motion.button
            type="button"
            className={styles.swap}
            aria-label="Swap departure and arrival cities"
            onClick={swapRoute}
            animate={{ rotate: swapTurns * 180 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
            </svg>
          </motion.button>
          <Field id={fieldId("to")} label="To" error={errorFor("to")}>
            <input {...bind("to")} {...describe("to")} placeholder="Arrival city" maxLength={80} className={styles.input} />
          </Field>
        </div>

        <div className={styles.split}>
          <Field id={fieldId("departureDate")} label="Departure date" error={errorFor("departureDate")}>
            <input {...bind("departureDate")} {...describe("departureDate")} type="date" min={today || undefined} className={styles.input} />
          </Field>
          <AnimatePresence initial={false}>
            {values.tripType === "Round Trip" && (
              <motion.div
                key="return"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <Field id={fieldId("returnDate")} label="Return date" error={errorFor("returnDate")}>
                  <input
                    {...bind("returnDate")}
                    {...describe("returnDate")}
                    type="date"
                    min={values.departureDate || today || undefined}
                    className={styles.input}
                  />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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

        <Field id={fieldId("phone")} label="Phone" error={errorFor("phone")}>
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

        <Field id={fieldId("requirements")} label="Requirements (optional)" error={errorFor("requirements")}>
          <textarea
            {...bind("requirements")}
            {...describe("requirements")}
            rows={3}
            maxLength={4000}
            placeholder="Luggage, special requests, flexible dates…"
            className={`${styles.input} ${styles.textarea}`}
          />
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
          <span>{pending ? "Sending request…" : "Send request"}</span>
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
