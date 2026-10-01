"use client";

// Adapted from Magic UI "Magic Card" (MIT © Magic UI), found on 21st.dev.
// Changes: gradient mode only (no theme dependency), CSS Modules, colours set through props/variables.

import { useCallback, useEffect, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, type MotionStyle } from "motion/react";
import styles from "./MagicCard.module.css";

type MagicCardProps = {
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Radius of the spotlight in px. */
  gradientSize?: number;
  /** Inner spotlight colour. */
  gradientColor?: string;
  /** Border highlight colours. */
  gradientFrom?: string;
  gradientTo?: string;
  /** Opaque card surface and resting border colours. */
  background?: string;
  borderColor?: string;
};

export function MagicCard({
  children,
  className,
  contentClassName,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
  background = "#0a0a0a",
  borderColor = "rgba(255, 255, 255, 0.14)",
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY],
  );

  useEffect(() => {
    const handleGlobalPointerOut = (e: globalThis.PointerEvent) => {
      if (!e.relatedTarget) reset();
    };
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") reset();
    };
    window.addEventListener("pointerout", handleGlobalPointerOut);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pointerout", handleGlobalPointerOut);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reset]);

  const borderGlow = useMotionTemplate`
    linear-gradient(var(--mc-background) 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
      ${gradientFrom},
      ${gradientTo},
      var(--mc-border) 100%
    ) border-box`;
  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`;

  return (
    <motion.div
      className={`${styles.card} ${className ?? ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={
        {
          "--mc-background": background,
          "--mc-border": borderColor,
          background: borderGlow,
        } as MotionStyle
      }
    >
      <div className={styles.surface} />
      <motion.div className={styles.spotlight} style={{ background: spotlight }} />
      <div className={`${styles.content} ${contentClassName ?? ""}`}>{children}</div>
    </motion.div>
  );
}
