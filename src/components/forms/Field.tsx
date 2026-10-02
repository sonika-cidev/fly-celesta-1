"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import styles from "./Form.module.css";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  /** e.g. "120 / 2,000" beside the label of a text area. */
  counter?: string;
  children: ReactNode;
};

/** Label, control and an animated error line. */
export function Field({ id, label, error, counter, children }: FieldProps) {
  const labelElement = (
    <label htmlFor={id} className={styles.label}>
      {label}
    </label>
  );

  return (
    <div className={`${styles.field} ${error ? styles.invalid : ""}`}>
      {counter ? (
        <div className={styles.labelRow}>
          {labelElement}
          <span className={styles.counter} aria-hidden="true">
            {counter}
          </span>
        </div>
      ) : (
        labelElement
      )}
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
