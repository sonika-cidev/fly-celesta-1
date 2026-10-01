"use client";

import { motion } from "motion/react";

type SwooshProps = {
  className?: string;
  /** Upper stroke (gold in the logo). */
  colorA?: string;
  /** Lower stroke (navy in the logo). */
  colorB?: string;
};

/** The two sweeping strokes under the Fly Celesta wordmark, drawn in as they come into view. */
export function Swoosh({ className, colorA = "#b08d57", colorB = "#0f1b31" }: SwooshProps) {
  const draw = {
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "0px 0px -10% 0px" },
  };

  return (
    <svg className={className} viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d="M8 96 C 260 40, 640 6, 1192 70"
        stroke={colorA}
        strokeWidth="2.2"
        strokeLinecap="round"
        {...draw}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.path
        d="M40 112 C 330 64, 700 34, 1160 88"
        stroke={colorB}
        strokeWidth="1.2"
        strokeLinecap="round"
        {...draw}
        transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1], delay: 0.25 }}
      />
    </svg>
  );
}
