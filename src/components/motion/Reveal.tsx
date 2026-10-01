"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

const tags = { div: motion.div, li: motion.li, p: motion.p, header: motion.header } as const;

type RevealProps = {
  children: ReactNode;
  as?: keyof typeof tags;
  className?: string;
  /** Seconds. */
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  id?: string;
};

/** Quiet fade-and-rise as the element scrolls into view (once). */
export function Reveal({ children, as = "div", className, delay = 0, y = 26, id }: RevealProps) {
  const Tag = tags[as] as typeof motion.div;
  return (
    <Tag
      id={id}
      className={className}
      data-anim=""
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
