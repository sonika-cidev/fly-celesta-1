"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Lenis inertial scrolling (also animates in-page anchor links; native scrolling for
 * reduced-motion visitors) plus Motion's reduced-motion handling.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis root options={{ lerp: 0.09, anchors: true }}>
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}

