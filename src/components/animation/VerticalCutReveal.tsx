"use client";

// Adapted from Fancy Components "Vertical Cut Reveal" by Daniel Petho (MIT), found on 21st.dev.
// Changes: CSS Modules instead of Tailwind, optional start-on-scroll, a per-character class hook,
// and a deeper hidden offset so tight display line-heights never show a sliver of the glyph.

import { motion, useInView, type AnimationOptions } from "motion/react";
import { useCallback, useMemo, useRef } from "react";
import styles from "./VerticalCutReveal.module.css";

type VerticalCutRevealProps = {
  children: string;
  reverse?: boolean;
  transition?: AnimationOptions;
  splitBy?: "words" | "characters" | "lines" | string;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  /** Applied to each animated glyph/word (e.g. per-letter gradients). */
  charClassName?: string;
  /** Start when scrolled into view instead of on mount. */
  startOnView?: boolean;
  onComplete?: () => void;
};

type WordObject = { characters: string[]; needsSpace: boolean };

const DEFAULT_TRANSITION: AnimationOptions = { type: "spring", stiffness: 190, damping: 22 };

const splitIntoCharacters = (text: string): string[] => {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
};

export function VerticalCutReveal({
  children: text,
  reverse = false,
  transition = DEFAULT_TRANSITION,
  splitBy = "words",
  staggerDuration = 0.2,
  staggerFrom = "first",
  containerClassName,
  wordLevelClassName,
  elementLevelClassName,
  charClassName,
  startOnView = false,
  onComplete,
}: VerticalCutRevealProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "0px 0px -8% 0px" });
  const isAnimating = startOnView ? inView : true;

  const elements = useMemo<WordObject[]>(() => {
    const words = text.split(" ");
    if (splitBy === "characters") {
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    const parts = splitBy === "words" ? words : splitBy === "lines" ? text.split("\n") : text.split(splitBy);
    return parts.map((part, i) => ({ characters: [part], needsSpace: i !== parts.length - 1 }));
  }, [text, splitBy]);

  const getStaggerDelay = useCallback(
    (index: number) => {
      const total = elements.reduce(
        (acc, word) => acc + word.characters.length + (splitBy === "characters" && word.needsSpace ? 1 : 0),
        0,
      );
      if (staggerFrom === "first") return index * staggerDuration;
      if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
      if (staggerFrom === "center") return Math.abs(Math.floor(total / 2) - index) * staggerDuration;
      return Math.abs(staggerFrom - index) * staggerDuration;
    },
    [elements, splitBy, staggerFrom, staggerDuration],
  );

  const variants = {
    hidden: { y: reverse ? "-130%" : "130%" },
    visible: (i: number) => ({
      y: 0,
      transition: {
        ...transition,
        delay: ((transition?.delay as number) || 0) + getStaggerDelay(i),
      },
    }),
  };

  return (
    <span
      ref={containerRef}
      className={[styles.container, splitBy === "lines" && styles.lines, containerClassName].filter(Boolean).join(" ")}
    >
      <span className={styles.srOnly}>{text}</span>

      {elements.map((wordObj, wordIndex, array) => {
        const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word) => sum + word.characters.length, 0);

        return (
          <span key={wordIndex} aria-hidden="true" className={[styles.word, wordLevelClassName].filter(Boolean).join(" ")}>
            {wordObj.characters.map((char, charIndex) => (
              <span key={charIndex} className={[styles.element, elementLevelClassName].filter(Boolean).join(" ")}>
                <motion.span
                  custom={previousCharsCount + charIndex}
                  initial="hidden"
                  animate={isAnimating ? "visible" : "hidden"}
                  variants={variants}
                  onAnimationComplete={
                    wordIndex === array.length - 1 && charIndex === wordObj.characters.length - 1
                      ? onComplete
                      : undefined
                  }
                  className={[styles.char, charClassName].filter(Boolean).join(" ")}
                  data-anim=""
                >
                  {char}
                </motion.span>
              </span>
            ))}
            {wordObj.needsSpace && <span> </span>}
          </span>
        );
      })}
    </span>
  );
}
