"use client";

// Adapted from Motion Primitives "Magnetic" by ibelick (MIT), found on 21st.dev.
// Changes: className passthrough, a calmer default spring, and it stays still for
// touch devices and visitors who prefer reduced motion.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, type SpringOptions } from "motion/react";

const SPRING_CONFIG: SpringOptions = { stiffness: 140, damping: 16, mass: 0.5 };

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** Share of the pointer offset the element follows (0–1). */
  intensity?: number;
  /** Activation radius in px, measured from the element's centre. */
  range?: number;
  actionArea?: "self" | "parent";
  springOptions?: SpringOptions;
};

export function Magnetic({
  children,
  className,
  intensity = 0.35,
  range = 140,
  actionArea = "self",
  springOptions = SPRING_CONFIG,
}: MagneticProps) {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const calculateDistance = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const distanceX = e.clientX - (rect.left + rect.width / 2);
      const distanceY = e.clientY - (rect.top + rect.height / 2);
      const absoluteDistance = Math.hypot(distanceX, distanceY);

      if (isHovered && absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        x.set(distanceX * intensity * scale);
        y.set(distanceY * intensity * scale);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    document.addEventListener("mousemove", calculateDistance);
    return () => document.removeEventListener("mousemove", calculateDistance);
  }, [isHovered, intensity, range, reduceMotion, x, y]);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (actionArea !== "parent" || !parent) return;

    const enter = () => setIsHovered(true);
    const leave = () => setIsHovered(false);
    parent.addEventListener("mouseenter", enter);
    parent.addEventListener("mouseleave", leave);
    return () => {
      parent.removeEventListener("mouseenter", enter);
      parent.removeEventListener("mouseleave", leave);
    };
  }, [actionArea]);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseEnter={actionArea === "self" ? () => setIsHovered(true) : undefined}
      onMouseLeave={
        actionArea === "self"
          ? () => {
              setIsHovered(false);
              x.set(0);
              y.set(0);
            }
          : undefined
      }
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
