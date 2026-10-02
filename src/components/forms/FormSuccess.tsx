"use client";

import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { syncLenis } from "@/lib/scroll";
import styles from "./Form.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

type FormSuccessProps = {
  firstName: string;
  text: string;
  againLabel: string;
  onAgain: () => void;
};

/** Animated confirmation; scrolls itself into view because it's much shorter than the form. */
export function FormSuccess({ firstName, text, againLabel, onAgain }: FormSuccessProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (lenis) {
      syncLenis(lenis);
      lenis.scrollTo(el, { offset: -160 });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [lenis]);

  return (
    <motion.div
      ref={ref}
      className={styles.success}
      role="status"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <svg className={styles.check} viewBox="0 0 64 64" aria-hidden="true">
        <motion.circle cx="32" cy="32" r="30" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }} />
        <motion.path d="M20 33l8 8 16-18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5, ease: EASE }} />
      </svg>
      <h3 className={`serif ${styles.successTitle}`}>
        Thank you, <em>{firstName}.</em>
      </h3>
      <p className={styles.successText}>{text}</p>
      <button type="button" className={styles.again} onClick={onAgain}>
        {againLabel}
      </button>
    </motion.div>
  );
}
