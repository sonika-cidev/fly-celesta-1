"use client";

// Adapted from Magic UI "Blur Fade" (MIT © Magic UI), found on 21st.dev.
// Changes: `as` prop, reveals on scroll-in by default, easing and offset tuned for this site.

import { useRef, type ReactNode } from "react";
import { motion, useInView, type UseInViewOptions, type Variants } from "motion/react";

const tags = {
  div: motion.div,
  li: motion.li,
  p: motion.p,
  figure: motion.figure,
} as const;

type BlurFadeProps = {
  children: ReactNode;
  as?: keyof typeof tags;
  className?: string;
  id?: string;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
  /** Travel distance in px. */
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  /** Wait until scrolled into view; `false` animates on mount (above-the-fold content). */
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  blur?: string;
};

export function BlurFade({
  children,
  as = "div",
  className,
  id,
  duration = 0.9,
  delay = 0,
  offset = 28,
  direction = "up",
  inView = true,
  inViewMargin = "0px 0px -10% 0px",
  blur = "8px",
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const variants: Variants = {
    hidden: {
      [axis]: direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };

  // Every entry is a motion component with the same props; narrowing to one keeps the ref typing simple.
  const Tag = tags[as] as typeof motion.div;

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      data-anim=""
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay: 0.04 + delay, duration, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </Tag>
  );
}
