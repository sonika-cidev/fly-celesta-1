import { Reveal } from "@/components/motion/Reveal";
import type { Service } from "@/data/services";
import styles from "./ServiceOverview.module.css";

/** Service page body: the story on the left, what's included on the right. */
export function ServiceOverview({ service }: { service: Service }) {
  const [lead, ...rest] = service.details;
  return (
    <section className={styles.overview} aria-label={`${service.title} overview`}>
      <div className={`container ${styles.layout}`}>
        <div>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              Overview
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className={`serif ${styles.lead}`}>{lead}</p>
          </Reveal>
          {rest.map((paragraph, i) => (
            <Reveal key={paragraph.slice(0, 24)} delay={0.14 + i * 0.06}>
              <p className={styles.body}>{paragraph}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12} y={30} className={styles.card}>
          <h2 className={`serif ${styles.cardTitle}`}>
            What we <em>offer</em>
          </h2>
          <ul className={styles.list}>
            {service.offerings.map((item) => (
              <li key={item}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="8.5" />
                  <path d="m6.4 10.2 2.4 2.4 4.8-5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
