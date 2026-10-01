import { BlurFade } from "@/components/animation/BlurFade";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { fleet } from "@/data/fleet";
import { FleetShowcase } from "./FleetShowcase";
import styles from "./Fleet.module.css";

export function Fleet() {
  return (
    <section id="fleet" className={styles.fleet} aria-labelledby="fleet-title">
      <div className="container">
        <div className={styles.head}>
          <div>
            <BlurFade>
              <Eyebrow tone="dark">Aircraft fleet</Eyebrow>
            </BlurFade>
            <RevealTitle id="fleet-title" className={styles.title} lines={["From rotor"]} accent="to runway." />
          </div>
          <BlurFade delay={0.2} className={styles.intro}>
            <p>
              From light helicopters to mid-size business jets — explore aircraft to suit every charter requirement.
            </p>
          </BlurFade>
        </div>

        <BlurFade offset={40} blur="4px" duration={1.1}>
          <FleetShowcase categories={fleet} />
        </BlurFade>

        <BlurFade className={styles.footnote}>
          <p>Specifications are indicative and vary by configuration. More aircraft are available on request.</p>
          <Button href="#request" variant="link" tone="dark">
            Request fleet options
          </Button>
        </BlurFade>
      </div>
    </section>
  );
}
