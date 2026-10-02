import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";
import { ServiceCard } from "./ServiceCard";
import styles from "./Services.module.css";

/** The five services as editorial cards. The services page supplies its own heading. */
export function Services({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section
      id="services"
      className={`${styles.services} ${withHeading ? "" : styles.flush}`}
      aria-labelledby={withHeading ? "services-title" : undefined}
      aria-label={withHeading ? undefined : "Our services"}
    >
      <div className="container">
        {withHeading && (
          <SectionHeading
            id="services-title"
            label="Our services"
            title={
              <>
                Every journey,
                <br />
                <em>handled.</em>
              </>
            }
            intro={
              <p>
                Charters, aircraft sales and acquisitions, aviation consultancy and unmanned aviation systems — premium
                aviation services, tailored to your needs.
              </p>
            }
          />
        )}

        <ol className={styles.grid}>
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
