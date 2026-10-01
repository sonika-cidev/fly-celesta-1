import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** solid: midnight pill · ghost: outlined pill · light: porcelain pill for dark sections · text: underlined link */
  variant?: "solid" | "ghost" | "light" | "text";
  className?: string;
  onClick?: () => void;
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** Pill button with a circular arrow badge that slides on hover. In-page and mailto links stay plain anchors so Lenis can animate them. */
export function Button({ href, children, variant = "solid", className, onClick }: ButtonProps) {
  return (
    <a href={href} onClick={onClick} className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}>
      <span className={styles.label}>{children}</span>
      <span className={styles.badge}>
        <Arrow />
      </span>
    </a>
  );
}

export { Arrow };
