import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { HeroMedia } from "./HeroMedia";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.intro}`}>
        {/* The small label is part of the h1: it names what the site offers and where */}
        <h1 id="hero-title" className={styles.heading}>
          <Reveal as="span" className={styles.label} y={12}>
            <span className={styles.dot} aria-hidden="true" />
            Helicopter &amp; private jet services in South India
          </Reveal>
          <span className={styles.title}>
            <LineRise immediate delay={0.15} lines={["Fly beyond", <em key="h">horizons.</em>]} />
          </span>
        </h1>

        <Reveal className={styles.lede} delay={0.55} y={16}>
          Helicopter services across Kerala, Karnataka and Tamil Nadu — private jets on rent, joyrides, shuttles, air
          ambulance and flower drops, plus helicopters and private jets for sale.
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
