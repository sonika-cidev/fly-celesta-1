"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Form.module.css";

/** Label, control and an animated error line. */
export function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-error`} className={styles.error} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
