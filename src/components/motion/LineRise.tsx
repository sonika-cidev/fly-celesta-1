"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import styles from "./LineRise.module.css";

type LineRiseProps = {
  lines: ReactNode[];
  /** Seconds before the first line. */
  delay?: number;
  /** Seconds between lines. */
  stagger?: number;
  /** Animate on mount (hero) instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Each line rises out of its own mask, one after another. Visibility is measured on the
 * wrapper, not on the lines: a line parked below its mask is fully clipped, so watching
 * it directly would never report it as on screen.
 */
export function LineRise({ lines, delay = 0, stagger = 0.14, immediate = false }: LineRiseProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const shown = immediate || inView;

  return (
    <span ref={ref} className={styles.group}>
      {lines.map((line, i) => (
        <span key={i} className={styles.mask}>
          <motion.span
            className={styles.line}
            data-anim=""
            initial={{ y: "112%" }}
            animate={{ y: shown ? "0%" : "112%" }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
