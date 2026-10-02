import { Reveal } from "@/components/motion/Reveal";
import { RouteLink } from "@/components/ui/RouteLink";
import { SERVICE_PAGES } from "@/data/navigation";
import styles from "./OtherServices.module.css";

/** Links to the remaining services, closing each service page. */
export function OtherServices({ current }: { current: string }) {
  const others = SERVICE_PAGES.filter((s) => s.slug !== current);
  return (
    <section className={styles.others} aria-labelledby="other-services-title">
      <div className="container">
        <Reveal y={14}>
          <h2 id="other-services-title" className={styles.label}>
            <span className={styles.dot} aria-hidden="true" />
            More from Fly Celesta
          </h2>
        </Reveal>
        <ul className={styles.list}>
          {others.map((service, i) => (
            <Reveal as="li" key={service.slug} delay={i * 0.06}>
              <RouteLink href={`/services/${service.slug}`} className={styles.card}>
                <span className={`serif ${styles.title}`}>{service.title}</span>
                <span className={styles.note}>{service.note}</span>
                <span className={styles.arrow} aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </RouteLink>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
