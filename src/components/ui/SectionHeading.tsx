import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  label: string;
  /** Use <em> for the champagne italic accent. */
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  tone?: "paper" | "night";
  align?: "split" | "center";
};

/** Label with a champagne dot, a large serif title and an optional intro alongside. */
export function SectionHeading({ label, title, intro, id, tone = "paper", align = "split" }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, styles[tone], styles[align]].join(" ")}>
      <Reveal className={styles.main}>
        <p className={styles.label}>
          <span className={styles.dot} aria-hidden="true" />
          {label}
        </p>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.12} className={styles.intro}>
          {intro}
        </Reveal>
      )}
    </div>
  );
}
