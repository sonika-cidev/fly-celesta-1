"use client";

// Adapted from Magic UI "Border Beam" (MIT © Magic UI), found on 21st.dev.
// Changes: CSS Modules instead of Tailwind; the border-only mask uses the widely supported
// exclude/xor composite.

import type { CSSProperties } from "react";
import { motion, type MotionStyle, type Transition } from "motion/react";
import styles from "./BorderBeam.module.css";

type BorderBeamProps = {
  /** Length of the travelling beam in px. */
  size?: number;
  /** Seconds per lap. */
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  transition?: Transition;
  className?: string;
  reverse?: boolean;
  /** Starting position along the path (0–100). */
  initialOffset?: number;
  borderWidth?: number;
};

export function BorderBeam({
  className,
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}: BorderBeamProps) {
  return (
    <div
      className={`${styles.ring} ${className ?? ""}`}
      style={{ "--border-beam-width": `${borderWidth}px` } as CSSProperties}
      aria-hidden="true"
    >
      <motion.div
        className={styles.beam}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--color-from": colorFrom,
            "--color-to": colorTo,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay, ...transition }}
      />
    </div>
  );
}
