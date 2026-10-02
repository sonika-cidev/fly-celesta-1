import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { site } from "@/data/site";
import styles from "./FormSection.module.css";

type FormSectionProps = {
  id: string;
  label: string;
  /** Title lines; use <em> for the champagne italic accent. */
  title: ReactNode[];
  lede: ReactNode;
  image: StaticImageData;
  imageAlt: string;
  callLabel?: string;
  /** Adds a "Get directions" link under the address (contact page). */
  directions?: boolean;
  /** Rounded top that slides over a midnight panel above it. */
  overlap?: boolean;
  children: ReactNode;
};

const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(site.address.join(", "))}`;

/** Concierge layout: title, photo and contact details beside a white form card. */
export function FormSection({ id, label, title, lede, image, imageAlt, callLabel = "Call us", directions = false, overlap = false, children }: FormSectionProps) {
  return (
    <section id={id} className={`${styles.section} ${overlap ? styles.overlap : ""}`} aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.aside}>
          <Reveal y={14}>
            <p className={styles.label}>
              <span className={styles.dot} aria-hidden="true" />
              {label}
            </p>
          </Reveal>
          <h2 id={`${id}-title`} className={styles.title}>
            <LineRise lines={title} />
          </h2>
          <Reveal delay={0.12}>
            <p className={styles.lede}>{lede}</p>
          </Reveal>

          <div className={styles.concierge}>
            <ImageReveal className={styles.window} parallax={0}>
              <Image src={image} alt={imageAlt} fill sizes="(max-width: 1024px) 92vw, 520px" placeholder="blur" className={styles.windowImage} />
            </ImageReveal>

            <Reveal delay={0.15}>
              <ul className={styles.contact}>
                <li>
                  <span>{callLabel}</span>
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
                  {directions && (
                    <a className={styles.directions} href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer">
                      Get directions
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 11 11 5M6 5h5v5" />
                      </svg>
                    </a>
                  )}
                </li>
              </ul>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.1} y={40} className={styles.card}>
          {children}
        </Reveal>
      </div>
    </section>
  );
}
