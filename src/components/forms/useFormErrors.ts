"use client";

import { useLenis } from "lenis/react";
import { useState } from "react";
import type { FormErrors } from "@/lib/forms";
import { syncLenis } from "@/lib/scroll";

type Options<K extends string> = {
  /** Current problems with the form's values (from the shared validators). */
  errors: FormErrors<K>;
  /** The last reply from the server action. */
  response: object;
  serverErrors: FormErrors<K>;
  /** Fields in on-screen order, so the first problem can be brought into view. */
  order: readonly (K | "captcha")[];
  fieldId: (name: K | "captcha") => string;
};

const withName = (set: ReadonlySet<string>, name: string) => (set.has(name) ? set : new Set(set).add(name));

/**
 * When to show which error. A field's own error appears once the visitor leaves it with something typed
 * (or after a submit attempt) and then updates live as they correct it. An error from the server takes
 * precedence until that field is edited.
 */
export function useFormErrors<K extends string>({ errors, response, serverErrors, order, fieldId }: Options<K>) {
  const lenis = useLenis();
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [edited, setEdited] = useState<ReadonlySet<string>>(() => new Set());
  const [attempted, setAttempted] = useState(false);
  // Whether a submit was tried since the server last replied (its message stays until then)
  const [triedSinceReply, setTriedSinceReply] = useState(false);
  const [lastResponse, setLastResponse] = useState(response);

  // A new reply from the server: its errors apply again to every field.
  if (response !== lastResponse) {
    setLastResponse(response);
    setEdited(new Set());
    setTriedSinceReply(false);
  }

  // The server's verdict (e.g. "Incorrect answer") wins until the visitor edits that field.
  const errorFor = (name: K | "captcha") =>
    (!edited.has(name) && serverErrors[name]) || ((attempted || touched.has(name)) && errors[name]) || undefined;

  return {
    errorFor,

    /** aria attributes linking a control to its error. */
    describe: (name: K | "captcha") =>
      errorFor(name) ? { "aria-invalid": true as const, "aria-describedby": `${fieldId(name)}-error` } : {},

    /** True when the last submit attempt was stopped here because something still needs fixing. */
    blocked: triedSinceReply && order.some((name) => errors[name]),

    /** When a field changes. */
    changed: (name: K | "captcha") => setEdited((set) => withName(set, name)),

    /** When a field loses focus; empty fields wait for a submit attempt before they're flagged. */
    left: (name: K | "captcha", value: string) => {
      if (value.trim()) setTouched((set) => withName(set, name));
    },

    /** On submit: true if the form may be sent; otherwise every error shows and the first is brought into view. */
    check: () => {
      setAttempted(true);
      setTriedSinceReply(true);
      const first = order.find((name) => errors[name]);
      if (!first) return true;
      const element = document.getElementById(fieldId(first));
      if (element) {
        if (lenis) {
          syncLenis(lenis);
          lenis.scrollTo(element, { offset: -170 });
        } else {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        element.focus({ preventScroll: true });
      }
      return false;
    },
  };
}
