"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * App-wide motion setup: Lenis inertial smooth scrolling (which also animates in-page anchor
 * links and falls back to native scrolling for reduced-motion users) and Motion's
 * reduced-motion handling.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.085, anchors: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
