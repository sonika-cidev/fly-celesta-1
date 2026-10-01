import Image from "next/image";
import eiger from "@/assets/images/about-eiger.jpg";
import { BlurFade } from "@/components/animation/BlurFade";
import { BorderBeam } from "@/components/animation/BorderBeam";
import { ParallaxImage } from "@/components/animation/ParallaxImage";
import { TextReveal } from "@/components/animation/TextReveal";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Marquee } from "@/components/ui/Marquee";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { about } from "@/data/site";
import styles from "./About.module.css";

const pillars = [
  { label: "Our mission", text: about.mission },
  { label: "Our vision", text: about.vision },
];

export function About() {
  return (
    <section id="about" className={styles.about} aria-labelledby="about-title">
      <div className={`container ${styles.intro}`}>
        <div className={styles.copy}>
          <BlurFade>
            <Eyebrow>About Fly Celesta</Eyebrow>
          </BlurFade>
          <RevealTitle id="about-title" className={styles.title} lines={["Redefining"]} accent="air travel." />
          {/* Words light up as the statement scrolls through the viewport */}
          <TextReveal className={styles.statement}>{about.statement}</TextReveal>
          <BlurFade delay={0.1} className={styles.body}>
            {about.body.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </BlurFade>
        </div>

        <BlurFade offset={0} blur="0px" duration={1.4} className={styles.visual}>
          <div className={styles.frame} aria-hidden="true" />
          <div className={styles.media}>
            <ParallaxImage amount={10}>
              <Image
                src={eiger}
                alt="Helicopter flying past the Eiger's north face at golden hour"
                fill
                sizes="(max-width: 960px) 100vw, 42vw"
                placeholder="blur"
                className={styles.image}
              />
            </ParallaxImage>
          </div>
          <p className={styles.hq}>
            <span>Headquartered in</span>
            Bengaluru, India
          </p>
        </BlurFade>
      </div>

      <div className={`container ${styles.pillars}`}>
        {pillars.map((pillar, i) => (
          <BlurFade key={pillar.label} delay={i * 0.15} className={styles.pillar}>
            <BorderBeam size={150} duration={11 + i * 3} delay={i * 4} colorFrom="#f6e7c0" colorTo="#c9a45d" />
            <p className={styles.pillarLabel}>{pillar.label}</p>
            <p className={styles.pillarText}>{pillar.text}</p>
          </BlurFade>
        ))}
      </div>

      <BlurFade offset={0} blur="0px" duration={1.4} className={styles.marquee}>
        <Marquee items={about.sectors} tone="light" />
      </BlurFade>

      <ul className={`container ${styles.values}`}>
        {about.values.map((value, i) => (
          <BlurFade as="li" key={value.title} delay={i * 0.1} className={styles.value}>
            <span className={styles.valueIndex}>{String(i + 1).padStart(2, "0")}</span>
            <h3 className={styles.valueTitle}>{value.title}</h3>
            <p className={styles.valueBody}>{value.body}</p>
          </BlurFade>
        ))}
      </ul>
    </section>
  );
}
