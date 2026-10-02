"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent, ReactNode } from "react";
import { glideTo } from "@/lib/scroll";
import { RouteLink } from "./RouteLink";

/**
 * "Request a charter": glides to the charter form when the current page has one
 * (home, charter services, fleet); otherwise opens the home page at the form.
 */
export function RequestCharterLink({ className, children, onNavigate }: { className?: string; children: ReactNode; onNavigate?: () => void }) {
  const lenis = useLenis();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    // Let modified clicks open a new tab as usual
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!document.getElementById("request")) return; // the link navigates to /#request
    event.preventDefault();
    lenis?.start();
    glideTo(lenis, "#request");
  };

  return (
    <RouteLink href="/#request" className={className} onClick={onClick}>
      {children}
    </RouteLink>
  );
}
