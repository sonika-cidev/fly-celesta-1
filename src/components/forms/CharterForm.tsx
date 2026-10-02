"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { submitCharterRequest } from "@/app/actions/charter-request";
import {
  AIRCRAFT_TYPES,
  BOOKING_WINDOW_DAYS,
  COUNTRY_CODES,
  MAX_PASSENGERS,
  PREFILL_EVENT,
  TRIP_TYPES,
  addDays,
  tidyCharter,
  validateCharter,
  type AircraftType,
  type CharterFields,
  type CharterPrefill,
  type CharterRequestState,
} from "@/lib/charter";
import { LIMITS, PAGE_FIELD, captchaAnswerError, tidy, type FormErrors } from "@/lib/forms";
import { Field } from "./Field";
import { FormSuccess } from "./FormSuccess";
import { MathCaptcha } from "./MathCaptcha";
import { useFormErrors } from "./useFormErrors";
import styles from "./Form.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;

type FieldName = keyof CharterFields | "captcha";

/** On-screen order, so a failed submit lands on the first problem. */
const ORDER: readonly FieldName[] = ["passengers", "from", "to", "departureDate", "returnDate", "name", "email", "phone", "requirements", "captcha"];

/** Single-line fields tidied (trimmed, single spaces) when the visitor leaves them. */
const SINGLE_LINE = new Set<keyof CharterFields>(["from", "to", "name", "email", "phone"]);

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

/** Keeps only what can appear in a phone number. */
const phoneCharacters = (value: string) => value.replace(/[^\d\s()+.-]/g, "");

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
  const [swapTurns, setSwapTurns] = useState(0);
  const [highlight, setHighlight] = useState(0);
  const pathname = usePathname();
  const today = useToday();
  const latest = today ? addDays(today, BOOKING_WINDOW_DAYS) : undefined;
  const uid = useId();
  const fieldId = (name: FieldName) => `${uid}-${name}`;

  // A used-up security question is replaced by a fresh one (new key → remount), which clears its answer.
  const captchaKey = state.status === "error" && state.captchaReset ? state.captchaReset : "initial";
  const [captcha, setCaptcha] = useState({ key: captchaKey, answer: "" });
  const captchaAnswer = captcha.key === captchaKey ? captcha.answer : "";

  const errors: FormErrors<keyof CharterFields> = validateCharter(tidyCharter(values), { earliest: today || undefined, latest });
  const captchaProblem = captchaAnswerError(captchaAnswer);
  if (captchaProblem) errors.captcha = captchaProblem;

  const form = useFormErrors({
    errors,
    response: state,
    serverErrors: state.status === "error" ? (state.errors ?? {}) : {},
    order: ORDER,
    fieldId,
  });

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

  const update = (name: keyof CharterFields, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    form.changed(name);
  };

  const bind = (name: keyof CharterFields, clean: (value: string) => string = (value) => value) => ({
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

  const aircraft = values.aircraftType as AircraftType;
  const maxPassengers = MAX_PASSENGERS[aircraft];
  const passengers = Number.parseInt(values.passengers, 10) || 0;

  const chooseAircraft = (type: AircraftType) => {
    // Bring the passenger count within what the new aircraft type can take
    setValues((v) => {
      const count = Number.parseInt(v.passengers, 10);
      return { ...v, aircraftType: type, passengers: count > MAX_PASSENGERS[type] ? String(MAX_PASSENGERS[type]) : v.passengers };
    });
    form.changed("aircraftType");
  };

  const swapRoute = () => {
    setValues((v) => ({ ...v, from: v.to, to: v.from }));
    form.changed("from");
    form.changed("to");
    setSwapTurns((t) => t + 1);
  };

  const stepPassengers = (delta: number) => {
    update("passengers", String(Math.min(maxPassengers, Math.max(1, passengers + delta))));
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

  const banner = form.blocked ? "Please check the highlighted fields." : state.status === "error" ? state.message : null;
  const country = COUNTRY_CODES.find((c) => c.code === values.countryCode);

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
                  onChange={() => chooseAircraft(type)}
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

          <Field id={fieldId("passengers")} label="Passengers" error={form.errorFor("passengers")}>
            <div className={styles.stepper}>
              <button type="button" aria-label="Fewer passengers" onClick={() => stepPassengers(-1)} disabled={passengers <= 1}>
                −
              </button>
              <input
                {...bind("passengers", (value) => value.replace(/\D/g, "").slice(0, 2))}
                inputMode="numeric"
                maxLength={2}
                required
                className={styles.stepperInput}
              />
              <button type="button" aria-label="More passengers" onClick={() => stepPassengers(1)} disabled={passengers >= maxPassengers}>
                +
              </button>
            </div>
          </Field>
        </div>

        <div className={styles.route}>
          <Field id={fieldId("from")} label="From" error={form.errorFor("from")}>
            <input
              {...bind("from")}
              placeholder="Departure city"
              maxLength={LIMITS.place}
              autoComplete="off"
              autoCapitalize="words"
              required
              className={styles.input}
            />
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
          <Field id={fieldId("to")} label="To" error={form.errorFor("to")}>
            <input
              {...bind("to")}
              placeholder="Arrival city"
              maxLength={LIMITS.place}
              autoComplete="off"
              autoCapitalize="words"
              required
              className={styles.input}
            />
          </Field>
        </div>

        <div className={styles.split}>
          <Field id={fieldId("departureDate")} label="Departure date" error={form.errorFor("departureDate")}>
            <input {...bind("departureDate")} type="date" min={today || undefined} max={latest} required className={styles.input} />
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
                <Field id={fieldId("returnDate")} label="Return date" error={form.errorFor("returnDate")}>
                  <input
                    {...bind("returnDate")}
                    type="date"
                    min={values.departureDate || today || undefined}
                    max={latest}
                    required
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

        <Field id={fieldId("phone")} label="Phone" error={form.errorFor("phone")}>
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
              placeholder={country?.code === "+91" ? "10-digit mobile number" : "Phone number"}
              required
              className={styles.input}
            />
          </div>
        </Field>

        <Field
          id={fieldId("requirements")}
          label="Requirements (optional)"
          error={form.errorFor("requirements")}
          counter={`${values.requirements.length.toLocaleString("en-IN")} / ${LIMITS.requirements.toLocaleString("en-IN")}`}
        >
          <textarea
            {...bind("requirements")}
            rows={3}
            maxLength={LIMITS.requirements}
            placeholder="Luggage, special requests, flexible dates…"
            className={`${styles.input} ${styles.textarea}`}
          />
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
