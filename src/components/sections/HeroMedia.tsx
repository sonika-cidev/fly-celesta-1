"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import heroImage from "@/assets/images/about-eiger.jpg";
import { fleet } from "@/data/fleet";
import styles from "./Hero.module.css";

const aircraftCount = fleet.reduce((sum, c) => sum + c.aircraft.length, 0);

/** Cinematic frame that opens out to the full width of the page as it scrolls into view. */
export function HeroMedia() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.18"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [44, 0]);

  return (
    <div ref={ref} className={styles.mediaWrap}>
      <motion.div
        className={styles.media}
        style={reduceMotion ? undefined : { scale, borderRadius: radius }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      >
        <div className={styles.mediaImage}>
          <Image
            src={heroImage}
            alt="Helicopter flying past the Eiger's north face at golden hour"
            fill
            preload
            quality={85}
            sizes="100vw"
            placeholder="blur"
            className={styles.image}
          />
        </div>
        <div className={styles.shade} aria-hidden="true" />

        <div className={styles.note}>
          <p className={styles.noteValue}>{aircraftCount}</p>
          <p className={styles.noteText}>
            aircraft for charter
            <span>India · Nepal · beyond</span>
          </p>
        </div>

        <ul className={styles.chips} aria-label="Aircraft categories">
          {fleet.map((c) => (
            <li key={c.id}>{c.label}</li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
