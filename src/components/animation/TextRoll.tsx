"use client";

// Adapted from Motion Primitives "Text Roll" by ibelick (MIT), found on 21st.dev.
// Changes: CSS Modules instead of Tailwind, plus <TextRollOnHover> which replays the roll on hover.

import { useState } from "react";
import { motion, type Target, type TargetAndTransition, type Transition, type VariantLabels } from "motion/react";
import styles from "./TextRoll.module.css";

type TextRollProps = {
  children: string;
  duration?: number;
  getEnterDelay?: (index: number) => number;
  getExitDelay?: (index: number) => number;
  className?: string;
  transition?: Transition;
  variants?: {
    enter: { initial: Target | VariantLabels | boolean; animate: TargetAndTransition | VariantLabels };
    exit: { initial: Target | VariantLabels | boolean; animate: TargetAndTransition | VariantLabels };
  };
  onAnimationComplete?: () => void;
};

const defaultVariants = {
  enter: { initial: { rotateX: 0 }, animate: { rotateX: 90 } },
  exit: { initial: { rotateX: 90 }, animate: { rotateX: 0 } },
} as const;

export function TextRoll({
  children,
  duration = 0.5,
  getEnterDelay = (i) => i * 0.1,
  getExitDelay = (i) => i * 0.1 + 0.2,
  className,
  transition = { ease: "easeIn" },
  variants,
  onAnimationComplete,
}: TextRollProps) {
  const letters = children.split("");

  return (
    <span className={className}>
      {letters.map((letter, i) => {
        const glyph = letter === " " ? " " : letter;
        return (
          <span key={i} className={styles.letter} aria-hidden="true">
            <motion.span
              className={`${styles.face} ${styles.front}`}
              initial={variants?.enter?.initial ?? defaultVariants.enter.initial}
              animate={variants?.enter?.animate ?? defaultVariants.enter.animate}
              transition={{ ...transition, duration, delay: getEnterDelay(i) }}
            >
              {glyph}
            </motion.span>
            <motion.span
              className={`${styles.face} ${styles.back}`}
              initial={variants?.exit?.initial ?? defaultVariants.exit.initial}
              animate={variants?.exit?.animate ?? defaultVariants.exit.animate}
              transition={{ ...transition, duration, delay: getExitDelay(i) }}
              onAnimationComplete={letters.length === i + 1 ? onAnimationComplete : undefined}
            >
              {glyph}
            </motion.span>
            <span className={styles.ghost}>{glyph}</span>
          </span>
        );
      })}
      <span className={styles.srOnly}>{children}</span>
    </span>
  );
}

/** Plain text until hovered; each hover replays a quick, staggered roll. */
export function TextRollOnHover({ children, className }: { children: string; className?: string }) {
  const [run, setRun] = useState(0);

  return (
    <span className={className} onMouseEnter={() => setRun((r) => r + 1)}>
      {run === 0 ? (
        children
      ) : (
        <TextRoll
          key={run}
          duration={0.34}
          getEnterDelay={(i) => i * 0.022}
          getExitDelay={(i) => i * 0.022 + 0.1}
          transition={{ ease: [0.65, 0, 0.35, 1] }}
        >
          {children}
        </TextRoll>
      )}
    </span>
  );
}
