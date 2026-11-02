import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import type { FaqItem } from "@/data/faq";
import { site } from "@/data/site";
import { FaqList } from "./FaqList";
import styles from "./Faq.module.css";

/** "Good to know" — the most-asked questions beside a heading, with a link to the full FAQ page. */
export function Faq({ items }: { items: FaqItem[] }) {
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
        <FaqList items={items} />
      </div>
    </section>
  );
}
