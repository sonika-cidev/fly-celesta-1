import { VerticalCutReveal } from "@/components/animation/VerticalCutReveal";
import styles from "./RevealTitle.module.css";

type RevealTitleProps = {
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  /** Lines revealed one after another. */
  lines: string[];
  /** Optional closing line, rendered in <em> so each section can colour it. */
  accent?: string;
  split?: "words" | "characters";
  /** "view" waits until the heading scrolls into view; "mount" plays immediately (hero). */
  trigger?: "view" | "mount";
  /** Seconds before the first line starts. */
  delay?: number;
  align?: "start" | "center";
  accentCharClassName?: string;
};

const SPRING = { type: "spring", stiffness: 110, damping: 20 } as const;

/** Display heading whose words (or letters) rise out of a hairline mask, line by line. */
export function RevealTitle({
  as: Tag = "h2",
  id,
  className,
  lines,
  accent,
  split = "words",
  trigger = "view",
  delay = 0,
  align = "start",
  accentCharClassName,
}: RevealTitleProps) {
  const all = accent === undefined ? lines : [...lines, accent];
  const stagger = split === "characters" ? 0.032 : 0.09;
  const lineGap = split === "characters" ? 0.22 : 0.14;

  return (
    <Tag id={id} className={className}>
      {all.map((line, i) => {
        const isAccent = accent !== undefined && i === all.length - 1;
        const reveal = (
          <VerticalCutReveal
            splitBy={split}
            staggerDuration={stagger}
            startOnView={trigger === "view"}
            transition={{ ...SPRING, delay: delay + i * lineGap }}
            containerClassName={align === "center" ? styles.center : undefined}
            charClassName={isAccent ? accentCharClassName : undefined}
          >
            {line}
          </VerticalCutReveal>
        );

        return isAccent ? (
          <em key={i} className={styles.accent}>
            {reveal}
          </em>
        ) : (
          <span key={i} className={styles.line}>
            {reveal}
          </span>
        );
      })}
    </Tag>
  );
}
