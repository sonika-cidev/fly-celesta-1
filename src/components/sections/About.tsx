import Image from "next/image";
import nilgiri from "@/assets/images/hero-nilgiri.jpg";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { about } from "@/data/site";
import styles from "./About.module.css";

const numerals = ["I", "II", "III", "IV"];

export function About() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <div className={`container ${styles.intro}`}>
        <div className={styles.visual}>
          <ImageReveal className={styles.window} parallax={0}>
            <Image
              src={nilgiri}
              alt="Private helicopter flying beside a snow-covered Himalayan summit"
              fill
              sizes="(max-width: 960px) 92vw, 46vw"
              placeholder="blur"
              className={styles.image}
            />
          </ImageReveal>
          <Reveal className={styles.seal} delay={0.6} y={14}>
            <span>Headquartered in</span>
            <strong className="serif">Bengaluru</strong>
            <span>India</span>
          </Reveal>
        </div>

        <div className={styles.copy}>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              About Fly Celesta
            </p>
          </Reveal>
          <h2 id="about-title" className={styles.title}>
            <LineRise lines={["Redefining", <em key="a">air travel.</em>]} />
          </h2>
          <Reveal delay={0.1}>
            <p className={styles.statement}>{about.statement}</p>
          </Reveal>
          <Reveal delay={0.18} className={styles.body}>
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </Reveal>
          <Reveal delay={0.26}>
            <ul className={styles.sectors} aria-label="What we fly">
              {about.sectors.map((sector) => (
                <li key={sector}>{sector}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className={`container ${styles.pillars}`}>
        {[
          { word: "Mission", label: "Our mission", text: about.mission },
          { word: "Vision", label: "Our vision", text: about.vision },
        ].map((pillar, i) => (
          <Reveal key={pillar.word} delay={i * 0.12} className={styles.pillar}>
            <p className={styles.pillarLabel}>{pillar.label}</p>
            <p className={`serif ${styles.pillarWord}`} aria-hidden="true">
              {pillar.word}
            </p>
            <p className={`serif ${styles.pillarText}`}>{pillar.text}</p>
          </Reveal>
        ))}
      </div>

      <ul className={`container ${styles.values}`} aria-label="Our values">
        {about.values.map((value, i) => (
          <Reveal as="li" key={value.title} delay={i * 0.08} className={styles.value}>
            <span className={`serif ${styles.numeral}`}>{numerals[i]}</span>
            <h3 className={`serif ${styles.valueTitle}`}>{value.title}</h3>
            <p className={styles.valueBody}>{value.body}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
