"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import styles from "./ImageReveal.module.css";

type ImageRevealProps = {
  /** Usually a `next/image` with `fill`. */
  children: ReactNode;
  /** Sizing, radius and shape come from the caller. */
  className?: string;
  /** Gentle scroll drift in % of the frame (0 disables). */
  parallax?: number;
  delay?: number;
};

/**
 * Image frame that unveils upward (clip) while the photo settles from a slight zoom,
 * then drifts gently against the scroll.
 */
export function ImageReveal({ children, className, parallax = 6, delay = 0 }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);

  return (
    <motion.div
      ref={ref}
      className={`${styles.frame} ${className ?? ""}`}
      data-anim=""
      initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.25, ease: [0.65, 0, 0.35, 1], delay }}
    >
      <motion.div
        className={styles.zoom}
        initial={{ scale: 1.16 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay }}
      >
        <motion.div
          className={styles.drift}
          style={{
            y: reduceMotion || !parallax ? 0 : y,
            top: `-${parallax}%`,
            bottom: `-${parallax}%`,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
