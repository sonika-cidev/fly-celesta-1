import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REGION_PAGES, type RegionSlug } from "@/data/navigation";
import { servicesIn } from "@/data/services";
import styles from "./HelicopterServices.module.css";

type HelicopterServicesProps = {
  /** The page above supplies its own heading (the helicopter-services page). */
  withHeading?: boolean;
  tone?: "deep" | "paper";
  /** On a state's own page: link to the other states only. */
  region?: RegionSlug;
};

/** The specialist helicopter services as photo cards, then the states that have their own page. */
export function HelicopterServices({ withHeading = true, tone = "deep", region }: HelicopterServicesProps) {
  return (
    <section
      id="helicopter-services"
      className={`${styles.section} ${styles[tone]}`}
      aria-labelledby={withHeading ? "helicopter-services-title" : undefined}
      aria-label={withHeading ? undefined : "Helicopter services"}
    >
      <div className="container">
        {withHeading && (
          <SectionHeading
            id="helicopter-services-title"
            label="Joyrides · Shuttles · Air ambulance · Flower drops"
            title={
              <>
                Helicopter services
                <br />
                <em>across South India.</em>
              </>
            }
            intro={
              <p>
                From scenic joyrides and guest shuttles to air ambulance flights and flower drops — planned, permitted and
                flown across Kerala, Karnataka and Tamil Nadu.
              </p>
            }
          />
        )}

        <ul className={styles.grid}>
          {servicesIn("helicopter").map((service, i) => (
            <Reveal as="li" key={service.slug} delay={i * 0.08} y={20}>
              <RouteLink href={`/services/${service.slug}`} className={styles.card}>
                <ImageReveal className={styles.frame} parallax={0} delay={i * 0.08}>
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes="(max-width: 560px) 92vw, (max-width: 1024px) 46vw, 300px"
                    placeholder="blur"
                    className={styles.image}
                  />
                </ImageReveal>
                <h3 className={`serif ${styles.title}`}>{service.title}</h3>
                <p className={styles.note}>{service.tags}</p>
                <span className={styles.arrow} aria-hidden="true">
                  <Arrow />
                </span>
              </RouteLink>
            </Reveal>
          ))}
        </ul>

        <RegionLinks exclude={region} />
      </div>
    </section>
  );
}

/** "Helicopter services in Kerala / Karnataka / Tamil Nadu" — links to the state pages. */
export function RegionLinks({ exclude }: { exclude?: RegionSlug }) {
  return (
    <nav className={styles.regions} aria-label="Helicopter services by state">
      <ul>
        {REGION_PAGES.filter((region) => region.slug !== exclude).map((region, i) => (
          <Reveal as="li" key={region.slug} delay={i * 0.08} y={16}>
            <RouteLink href={`/helicopter-services/${region.slug}`} className={styles.region}>
              <span className={styles.regionLabel}>Helicopter services in</span>
              <span className={`serif ${styles.regionName}`}>{region.name}</span>
              <span className={styles.arrow} aria-hidden="true">
                <Arrow />
              </span>
            </RouteLink>
          </Reveal>
        ))}
      </ul>
    </nav>
  );
}
