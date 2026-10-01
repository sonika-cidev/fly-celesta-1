import Image from "next/image";
import clouds from "@/assets/images/h130-clouds.jpg";
import { BlurFade } from "@/components/animation/BlurFade";
import { ParallaxImage } from "@/components/animation/ParallaxImage";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { site } from "@/data/site";
import { CharterForm } from "./CharterForm";
import styles from "./CharterRequest.module.css";

export function CharterRequest() {
  return (
    <section id="request" className={styles.request} aria-labelledby="request-title">
      <ParallaxImage amount={12} className={styles.backdrop}>
        <Image src={clouds} alt="" fill sizes="100vw" placeholder="blur" className={styles.backdropImage} />
      </ParallaxImage>
      <div className={styles.scrim} aria-hidden="true" />

      <div className={`container ${styles.layout}`}>
        <div className={styles.info}>
          <BlurFade>
            <Eyebrow>Request a charter</Eyebrow>
          </BlurFade>
          <RevealTitle id="request-title" className={styles.title} lines={["Plan your"]} accent="next flight." />
          <BlurFade as="p" delay={0.15} className={styles.lede}>
            Share your itinerary and our charter desk will come back with tailored aircraft options and a quote.
          </BlurFade>

          <BlurFade delay={0.25}>
            <ul className={styles.contact}>
              <li>
                <span>Call</span>
                <a href={site.phoneHref}>{site.phone}</a>
              </li>
              <li>
                <span>Email</span>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <span>Visit</span>
                <address>
                  {site.address.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
              </li>
            </ul>
          </BlurFade>
        </div>

        <BlurFade delay={0.1} offset={40} blur="4px" className={styles.card}>
          <CharterForm />
        </BlurFade>
      </div>
    </section>
  );
}
