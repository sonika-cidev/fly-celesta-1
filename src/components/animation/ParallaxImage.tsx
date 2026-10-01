"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import styles from "./ParallaxImage.module.css";

type ParallaxImageProps = {
  /** Usually a `next/image` with `fill`. */
  children: ReactNode;
  /** Extra image height above and below the frame, in % of the frame — also the maximum drift. */
  amount?: number;
  className?: string;
};

/**
 * Fills its positioned parent and lets the image drift against the scroll direction
 * while the frame crosses the viewport.
 */
export function ParallaxImage({ children, amount = 10, className }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // Translate percentages refer to the (taller) layer, so convert the frame-relative amount.
  const shift = (amount / (100 + 2 * amount)) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [`-${shift}%`, `${shift}%`]);

  return (
    <div ref={ref} className={`${styles.frame} ${className ?? ""}`}>
      <motion.div
        className={styles.layer}
        style={{ top: `-${amount}%`, bottom: `-${amount}%`, y: reduceMotion ? 0 : y }}
      >
        {children}
      </motion.div>
    </div>
  );
}
