import styles from "./Marquee.module.css";

type MarqueeProps = {
  items: string[];
  tone?: "light" | "dark";
};

/** Infinite ticker. The list is rendered twice so the -50% loop is seamless. */
export function Marquee({ items, tone = "dark" }: MarqueeProps) {
  const sequence = (hidden: boolean) => (
    <ul className={styles.group} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className={styles.item}>
          {item}
          <span className={styles.dot} aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={`${styles.marquee} ${tone === "light" ? styles.light : ""}`}>
      <div className={styles.track}>
        {sequence(false)}
        {sequence(true)}
      </div>
    </div>
  );
}
