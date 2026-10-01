import type { ReactNode } from "react";
import styles from "./Eyebrow.module.css";

type EyebrowProps = {
  children: ReactNode;
  /** Draw the leading gold rule. */
  rule?: boolean;
  tone?: "light" | "dark";
  className?: string;
};

export function Eyebrow({ children, rule = true, tone = "light", className }: EyebrowProps) {
  return (
    <p className={[styles.eyebrow, rule && styles.rule, tone === "dark" && styles.dark, className].filter(Boolean).join(" ")}>
      {children}
    </p>
  );
}
