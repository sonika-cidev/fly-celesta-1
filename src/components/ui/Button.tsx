import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** primary: solid gold · outline: hairline gold frame · link: underlined text link */
  variant?: "primary" | "outline" | "link";
  /** Use "dark" when placing a link/outline button on an ivory background. */
  tone?: "light" | "dark";
  className?: string;
};

export function Button({ href, children, variant = "primary", tone = "light", className }: ButtonProps) {
  const classes = [styles.button, styles[variant], tone === "dark" && styles.dark, className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {variant === "link" && (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      )}
    </>
  );

  // Routes go through the Next router; in-page anchors and mailto links stay plain so
  // smooth scrolling (Lenis) can animate them.
  return href.startsWith("/") ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <a href={href} className={classes}>
      {content}
    </a>
  );
}
