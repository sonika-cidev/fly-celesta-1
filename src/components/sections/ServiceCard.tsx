"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { RouteLink } from "@/components/ui/RouteLink";
import type { Service } from "@/data/services";
import styles from "./Services.module.css";

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [open, setOpen] = useState(false);
  const moreId = useId();
  const href = `/services/${service.slug}`;

  return (
    <li className={styles.item}>
      <article className={styles.card}>
        {/* Landscape frame close to the photos' own proportions, so the whole aircraft stays in view */}
        <RouteLink href={href} tabIndex={-1} aria-hidden="true" className={styles.frameLink}>
          <ImageReveal className={styles.frame} parallax={0} delay={(index % 2) * 0.12}>
            <Image
              src={service.image}
              alt={service.imageAlt}
              fill
              sizes="(max-width: 640px) 88vw, (max-width: 1100px) 46vw, 620px"
              placeholder="blur"
              className={styles.image}
            />
          </ImageReveal>
        </RouteLink>

        <Reveal delay={0.1 + (index % 2) * 0.1} y={18}>
          <div className={styles.meta}>
            <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
            <span className={styles.tags}>{service.tags}</span>
          </div>
          <h3 className={`serif ${styles.title}`}>
            <RouteLink href={href}>{service.title}</RouteLink>
          </h3>
          <p className={styles.summary}>{service.summary}</p>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={moreId}
                className={styles.more}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              >
                {service.details.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.links}>
            <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={moreId} onClick={() => setOpen((v) => !v)}>
              <span className={styles.toggleIcon} aria-hidden="true" />
              {open ? "Less" : "More detail"}
            </button>
            <RouteLink href={href} className={styles.quote}>
              Explore service
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </RouteLink>
          </div>
        </Reveal>
      </article>
    </li>
  );
}
