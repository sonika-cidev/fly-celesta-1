import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { RouteLink } from "@/components/ui/RouteLink";
import styles from "./PageHero.module.css";

type Crumb = { label: string; href?: string };

type PageHeroProps = {
  crumbs: Crumb[];
  label: string;
  /** Title lines; use <em> for the champagne italic accent. */
  title: ReactNode[];
  lede: ReactNode;
  image?: StaticImageData;
  imageAlt?: string;
  /** CSS object-position, to keep the aircraft centred in the frame. */
  imagePosition?: string;
};

/** Opening section of an inner page, in the same language as the home page headings. */
export function PageHero({ crumbs, label, title, lede, image, imageAlt = "", imagePosition }: PageHeroProps) {
  return (
    <section id="top" className={`${styles.hero} ${image ? "" : styles.compact}`} aria-labelledby="page-title">
      <div className="container">
        <Reveal y={10}>
          <nav aria-label="Breadcrumb">
            <ol className={styles.crumbs}>
              {crumbs.map((crumb, i) => {
                const current = i === crumbs.length - 1;
                return (
                  <li key={crumb.label}>
                    {crumb.href && !current ? (
                      <RouteLink href={crumb.href}>{crumb.label}</RouteLink>
                    ) : (
                      <span aria-current={current ? "page" : undefined}>{crumb.label}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </Reveal>

        <div className={styles.head}>
          <div>
            <Reveal y={12} delay={0.05}>
              <p className={styles.label}>
                <span className={styles.dot} aria-hidden="true" />
                {label}
              </p>
            </Reveal>
            <h1 id="page-title" className={styles.title}>
              <LineRise immediate delay={0.15} lines={title} />
            </h1>
          </div>
          <Reveal delay={0.45} y={16} className={styles.lede}>
            {lede}
          </Reveal>
        </div>

        {image && (
          <ImageReveal className={styles.frame} parallax={0} delay={0.2}>
            <Image
              src={image}
              alt={imageAlt}
              fill
              preload
              quality={85}
              sizes="(max-width: 1360px) 92vw, 1240px"
              placeholder="blur"
              className={styles.image}
              style={imagePosition ? { objectPosition: imagePosition } : undefined}
            />
          </ImageReveal>
        )}
      </div>
    </section>
  );
}
