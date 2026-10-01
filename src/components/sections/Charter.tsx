import Image from "next/image";
import clouds from "@/assets/images/h130-clouds.jpg";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import { CharterForm } from "./CharterForm";
import styles from "./Charter.module.css";

export function Charter() {
  return (
    <section id="request" className={styles.charter} aria-labelledby="request-title">
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              Request a charter
            </p>
          </Reveal>
          <h2 id="request-title" className={styles.title}>
            <LineRise lines={["Plan your", <em key="r">next flight.</em>]} />
          </h2>
          <Reveal delay={0.12}>
            <p className={styles.lede}>
              Share your itinerary and our charter desk will come back with tailored aircraft options and a quote.
            </p>
          </Reveal>

          <div className={styles.concierge}>
            <ImageReveal className={styles.window} parallax={0}>
              <Image
                src={clouds}
                alt="Airbus H130 helicopter in flight among the clouds"
                fill
                sizes="(max-width: 1024px) 92vw, 520px"
                placeholder="blur"
                className={styles.windowImage}
              />
            </ImageReveal>

            <Reveal delay={0.15}>
              <ul className={styles.contact}>
                <li>
                  <span>Call the charter desk</span>
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
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1} y={40} className={styles.card}>
          <CharterForm />
        </Reveal>
      </div>
    </section>
  );
}
