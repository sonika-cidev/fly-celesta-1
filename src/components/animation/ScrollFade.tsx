"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

type ScrollFadeProps = {
  children: ReactNode;
  className?: string;
  /** Window scroll range in px that drives the effect. */
  range?: [number, number];
  y?: [number, number];
  opacity?: [number, number];
  scale?: [number, number];
};

/**
 * Ties transform/opacity to the window scroll position — for above-the-fold layers
 * (hero image and copy) that should drift and fade as the page moves on.
 */
export function ScrollFade({ children, className, range = [0, 900], y = [0, 0], opacity = [1, 1], scale = [1, 1] }: ScrollFadeProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const yValue = useTransform(scrollY, range, y);
  const opacityValue = useTransform(scrollY, range, opacity);
  const scaleValue = useTransform(scrollY, range, scale);

  return (
    <motion.div
      className={className}
      style={reduceMotion ? undefined : { y: yValue, opacity: opacityValue, scale: scaleValue }}
    >
      {children}
    </motion.div>
  );
}
