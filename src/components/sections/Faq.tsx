import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { FaqItem } from "@/data/faq";
import { site } from "@/data/site";
import { FaqList } from "./FaqList";
import styles from "./Faq.module.css";

/**
 * "Good to know" — questions beside a heading, with a link to the full FAQ page: the most-asked ones on the
 * home page, the relevant ones on service and state pages (`current`: that page, so answers don't link to it).
 */
export function Faq({ items, current }: { items: FaqItem[]; current?: string }) {
  if (items.length === 0) return null;
  return (
    <section id="faq" className={styles.faq} aria-labelledby="faq-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              FAQs
            </p>
          </Reveal>
          <h2 id="faq-title" className={styles.title}>
            <LineRise lines={["Good to", <em key="f">know.</em>]} />
          </h2>
          <Reveal delay={0.12}>
            <p className={styles.intro}>
              Quick answers to the questions we hear most. Can&rsquo;t see yours? Call the desk on{" "}
              <a href={site.phoneHref}>{site.phone}</a>.
            </p>
            <div className={styles.actions}>
              <Button href="/faq" variant="ghost">
                All questions
              </Button>
            </div>
          </Reveal>
        </div>
        <FaqList items={current ? items.map((item) => (item.link?.href === current ? { ...item, link: undefined } : item)) : items} />
      </div>
    </section>
  );
}
