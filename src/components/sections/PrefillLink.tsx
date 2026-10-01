"use client";

import type { ReactNode } from "react";
import { PREFILL_EVENT, type CharterPrefill } from "@/lib/charter";

/** Scrolls to the charter form (via the #request anchor) and pre-selects the given aircraft. */
export function PrefillLink({ detail, className, children }: { detail: CharterPrefill; className?: string; children: ReactNode }) {
  return (
    <a
      href="#request"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent<CharterPrefill>(PREFILL_EVENT, { detail }))}
    >
      {children}
    </a>
  );
}
