"use client";

// Adapted from Magic UI "Text Reveal" (MIT © Magic UI), found on 21st.dev.
// Changes: words illuminate as the text itself crosses the viewport (no 200vh sticky track),
// a single accessible copy of the text, CSS Modules instead of Tailwind.

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import styles from "./TextReveal.module.css";

type TextRevealProps = {
  children: string;
  as?: "p" | "blockquote";
  id?: string;
  className?: string;
};

export function TextReveal({ children, as = "p", id, className }: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.45"] });
  const words = children.split(" ");
  const Tag = as as "p";

  return (
    <Tag ref={ref} id={id} className={className}>
      <span className={styles.srOnly}>{children}</span>
      <span aria-hidden="true">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          return (
            <Fragment key={i}>
              <Word progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
              {i < words.length - 1 && " "}
            </Fragment>
          );
        })}
      </span>
    </Tag>
  );
}

type WordProps = {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
};

function Word({ children, progress, range }: WordProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className={styles.word}>
      <span className={styles.ghost}>{children}</span>
      <motion.span style={{ opacity }} className={styles.ink} data-anim="">
        {children}
      </motion.span>
    </span>
  );
}
