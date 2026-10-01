import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fleet } from "@/data/fleet";
import { FleetCarousel } from "./FleetCarousel";
import styles from "./Fleet.module.css";

export function Fleet() {
  return (
    <section id="fleet" className={styles.fleet} aria-labelledby="fleet-title">
      <div className="container">
        <SectionHeading
          id="fleet-title"
          tone="night"
          label="Aircraft fleet"
          title={
            <>
              From rotor
              <br />
              <em>to runway.</em>
            </>
          }
          intro={<p>From light helicopters to mid-size business jets — explore aircraft to suit every charter requirement.</p>}
        />
      </div>

      <FleetCarousel categories={fleet} />

      <div className="container">
        <Reveal className={styles.footnote}>
          <p>Specifications are indicative and vary by configuration. More aircraft are available on request.</p>
          <Button href="#request" variant="light">
            Request fleet options
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
