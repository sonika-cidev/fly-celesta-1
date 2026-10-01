import { BlurFade } from "@/components/animation/BlurFade";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { services } from "@/data/services";
import { ServiceStack } from "./ServiceStack";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section id="services" className={styles.services} aria-labelledby="services-title">
      <div className="container">
        <div className={styles.head}>
          <div>
            <BlurFade>
              <Eyebrow tone="dark">Our services</Eyebrow>
            </BlurFade>
            <RevealTitle id="services-title" className={styles.title} lines={["Every journey,"]} accent="handled." />
          </div>
          <BlurFade delay={0.2} className={styles.intro}>
            <p>
              Charters, aircraft sales, dry leasing, financing, consultancy, acquisitions and appraisal — premium aviation
              services, tailored to your needs.
            </p>
          </BlurFade>
        </div>

        <ServiceStack services={services} />
      </div>
    </section>
  );
}
