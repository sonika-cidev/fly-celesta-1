"use client";

// Adapted from Magic UI "Scroll Progress" (MIT © Magic UI), found on 21st.dev.
// Changes: CSS Modules and house colours.

import { motion, useScroll } from "motion/react";
import styles from "./ScrollProgress.module.css";

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className={`${styles.bar} ${className ?? ""}`}
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
