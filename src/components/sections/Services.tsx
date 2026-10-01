import { SectionHeading } from "@/components/ui/SectionHeading";
import { services } from "@/data/services";
import { ServiceCard } from "./ServiceCard";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section id="services" className={styles.services} aria-labelledby="services-title">
      <div className="container">
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
              Charters, aircraft sales, dry leasing, financing, consultancy, acquisitions and appraisal — premium aviation
              services, tailored to your needs.
            </p>
          }
        />

        <ol className={styles.grid}>
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
