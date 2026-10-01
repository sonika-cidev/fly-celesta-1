import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HeroMedia } from "./HeroMedia";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.intro}`}>
        <Reveal className={styles.label} y={12}>
          <span className={styles.dot} aria-hidden="true" />
          Private aviation · India &amp; beyond
        </Reveal>

        <h1 id="hero-title" className={styles.title}>
          <LineRise immediate delay={0.15} lines={["Fly beyond", <em key="h">horizons.</em>]} />
        </h1>

        <Reveal className={styles.lede} delay={0.55} y={16}>
          Helicopter and private jet charters, aircraft acquisitions, leasing and management — premium aviation services
          tailored to your needs.
        </Reveal>

        <Reveal className={styles.actions} delay={0.7} y={16}>
          <Button href="#request">Request a charter</Button>
          <Button href="#fleet" variant="ghost">
            Explore the fleet
          </Button>
        </Reveal>
      </div>

      <HeroMedia />
    </section>
  );
}
