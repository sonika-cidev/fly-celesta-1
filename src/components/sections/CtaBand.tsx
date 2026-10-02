import type { ReactNode } from "react";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import styles from "./CtaBand.module.css";

type Action = { label: string; href: string };

type CtaBandProps = {
  label: string;
  /** Title lines; use <em> for the champagne italic accent. */
  title: ReactNode[];
  text: string;
  primary: Action;
  secondary?: Action;
};

/** Closing call to action for inner pages. */
export function CtaBand({ label, title, text, primary, secondary }: CtaBandProps) {
  return (
    <section className={styles.band} aria-label={label}>
      <div className={`container ${styles.inner}`}>
        <div>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              {label}
            </p>
          </Reveal>
          <h2 className={styles.title}>
            <LineRise lines={title} />
          </h2>
        </div>
        <Reveal delay={0.15} className={styles.aside}>
          <p>{text}</p>
          <div className={styles.actions}>
            <Button href={primary.href}>{primary.label}</Button>
            {secondary && (
              <Button href={secondary.href} variant="ghost">
                {secondary.label}
              </Button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
