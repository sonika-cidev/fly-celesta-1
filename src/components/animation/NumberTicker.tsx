"use client";

// Adapted from Magic UI "Number Ticker" (MIT © Magic UI), found on 21st.dev.
// Changes: styling left to the caller (no Tailwind defaults), configurable number locale,
// optional fixed-duration easing.

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

type NumberTickerProps = ComponentPropsWithoutRef<"span"> & {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  /** Seconds. */
  delay?: number;
  decimalPlaces?: number;
  /** Number formatting locale, e.g. "en-IN" for lakh grouping. */
  locale?: string;
  /** Seconds. When set, eases to the value over a fixed time instead of the spring (better for large numbers). */
  duration?: number;
};

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  locale = "en-US",
  duration,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;
    const target = direction === "down" ? startValue : value;
    if (duration) {
      // Fixed-time ease-out (quartic) that lands exactly on the target
      const from = motionValue.get();
      let start: number | null = null;
      let raf = 0;
      const tick = (now: number) => {
        start ??= now + delay * 1000;
        const t = Math.min(1, Math.max(0, (now - start) / (duration * 1000)));
        motionValue.set(from + (target - from) * (1 - (1 - t) ** 4));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    const timer = setTimeout(() => motionValue.set(target), delay * 1000);
    return () => clearTimeout(timer);
  }, [motionValue, isInView, delay, value, direction, startValue, duration]);

  useEffect(
    () =>
      (duration ? motionValue : springValue).on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat(locale, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
        }
      }),
    [motionValue, springValue, duration, decimalPlaces, locale],
  );

  return (
    <span ref={ref} {...props}>
      {startValue}
    </span>
  );
}
