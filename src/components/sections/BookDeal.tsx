"use client";

import { useLenis } from "lenis/react";
import type { ReactNode } from "react";
import { prefillCharter, type CharterPrefill } from "@/lib/charter";
import { syncLenis } from "@/lib/scroll";

/** Anchor to the charter form that also pre-fills it; Lenis animates the jump. */
export function BookDeal({ prefill, className, children }: { prefill: CharterPrefill; className?: string; children: ReactNode }) {
  const lenis = useLenis();
  return (
    <a
      href="#request"
      className={className}
      onClick={() => {
        prefillCharter(prefill);
        syncLenis(lenis);
      }}
    >
      {children}
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </a>
  );
}
