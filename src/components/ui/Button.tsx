import type { ReactNode } from "react";
import { RouteLink } from "./RouteLink";
import styles from "./Button.module.css";

type Variant = "solid" | "ghost" | "light" | "text";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** solid: midnight pill · ghost: outlined pill · light: porcelain pill for dark sections · text: underlined link */
  variant?: Variant;
  className?: string;
};

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const buttonClass = (variant: Variant = "solid", className?: string) =>
  [styles.button, styles[variant], className].filter(Boolean).join(" ");

/** Label plus the circular arrow badge — for custom link elements styled with buttonClass(). */
export function ButtonInner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className={styles.label}>{children}</span>
      <span className={styles.badge}>
        <Arrow />
      </span>
    </>
  );
}

/**
 * Pill button with a circular arrow badge that slides on hover. Other pages use RouteLink;
 * in-page anchors and mailto/tel links stay plain anchors so Lenis can animate them.
 */
export function Button({ href, children, variant = "solid", className }: ButtonProps) {
  const isRoute = href.startsWith("/") && !href.startsWith("/#");
  return isRoute ? (
    <RouteLink href={href} className={buttonClass(variant, className)}>
      <ButtonInner>{children}</ButtonInner>
    </RouteLink>
  ) : (
    <a href={href} className={buttonClass(variant, className)}>
      <ButtonInner>{children}</ButtonInner>
    </a>
  );
}

export { Arrow };
