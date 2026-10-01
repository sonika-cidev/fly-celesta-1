import Image from "next/image";
import heroImage from "@/assets/images/hero-nilgiri.jpg";
import { BlurFade } from "@/components/animation/BlurFade";
import { Magnetic } from "@/components/animation/Magnetic";
import { ScrollFade } from "@/components/animation/ScrollFade";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { OrbitBadge } from "./OrbitBadge";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      {/* The image sinks slower than the page scrolls; Ken Burns runs on the inner layer */}
      <ScrollFade className={styles.mediaLayer} range={[0, 1000]} y={[0, 260]}>
        <div className={styles.media} aria-hidden="true">
          <Image
            src={heroImage}
            alt=""
            fill
            preload
            sizes="100vw"
            quality={85}
            placeholder="blur"
            className={styles.image}
          />
        </div>
      </ScrollFade>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <ScrollFade className={styles.content} range={[0, 640]} y={[0, -110]} opacity={[1, 0]}>
        <BlurFade inView={false} delay={0.15}>
          <Eyebrow>Private aviation · India &amp; beyond</Eyebrow>
        </BlurFade>
        <RevealTitle
          as="h1"
          id="hero-title"
          className={styles.title}
          lines={["Fly beyond"]}
          accent="horizons."
          split="characters"
          trigger="mount"
          delay={0.3}
          accentCharClassName={styles.goldChar}
        />
        <BlurFade as="p" inView={false} delay={1.05} className={styles.lede}>
          Helicopter and private jet charters, aircraft acquisitions, leasing and management — premium aviation services
          tailored to your needs.
        </BlurFade>
        <BlurFade inView={false} delay={1.25} className={styles.actions}>
          <Magnetic intensity={0.3}>
            <Button href="#request">Request a charter</Button>
          </Magnetic>
          <Button href="#fleet" variant="link">
            Explore the fleet
          </Button>
        </BlurFade>
      </ScrollFade>

      <Magnetic className={styles.orbit} intensity={0.22} range={190}>
        <OrbitBadge />
      </Magnetic>

      <ScrollFade className={styles.meta} range={[0, 320]} opacity={[1, 0]}>
        <span className={styles.metaLeft}>
          Fly Celesta <span className={styles.metaLine} />
        </span>
        <a href="#services" className={styles.scroll}>
          Scroll to explore
          <span className={styles.scrollTrack} aria-hidden="true">
            <span className={styles.scrollThumb} />
          </span>
        </a>
      </ScrollFade>
    </section>
  );
}
