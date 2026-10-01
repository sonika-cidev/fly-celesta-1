"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { VerticalCutReveal } from "@/components/animation/VerticalCutReveal";
import type { Service } from "@/data/services";
import styles from "./ServiceStack.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Sticky stacking cards: each service card pins below the header and the next one slides
 * up over it; cards underneath ease back and dim, leaving a labelled edge like a deck.
 */
export function ServiceStack({ services }: { services: Service[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start start", "end end"] });

  return (
    <ol ref={listRef} className={styles.stack} style={{ "--count": services.length } as CSSProperties}>
      {services.map((service, i) => (
        <ServiceCard key={service.slug} service={service} index={i} total={services.length} progress={scrollYProgress} />
      ))}
    </ol>
  );
}

type ServiceCardProps = {
  service: Service;
  index: number;
  total: number;
  progress: MotionValue<number>;
};

function ServiceCard({ service, index, total, progress }: ServiceCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // The photo settles from a slight zoom as the card rises into place
  const { scrollYProgress: arrival } = useScroll({ target: cardRef, offset: ["start end", "start start"] });
  const imageScale = useTransform(arrival, [0, 1], [1.28, 1]);

  // Once pinned, the card recedes as later cards land on top of it
  const depth = total - 1 - index;
  const scale = useTransform(progress, [index / total, 1], [1, 1 - depth * 0.035]);
  const dim = useTransform(progress, [index / total, 1], [0, total > 1 ? (depth / (total - 1)) * 0.55 : 0]);

  return (
    <li className={styles.item} style={{ "--i": index } as CSSProperties}>
      <motion.article ref={cardRef} className={styles.card} style={reduceMotion ? undefined : { scale }}>
        <div className={styles.strip} aria-hidden="true">
          <span>
            {pad(index + 1)} — {service.title}
          </span>
          <span className={styles.stripTags}>{service.tags}</span>
        </div>

        <div className={styles.body}>
          <div className={styles.content}>
            <span className={styles.number} aria-hidden="true">
              {pad(index + 1)}
              <span>/{pad(total)}</span>
            </span>

            <div className={styles.text}>
              <h3 className={styles.title}>
                <VerticalCutReveal splitBy="words" staggerDuration={0.07} startOnView>
                  {service.title}
                </VerticalCutReveal>
              </h3>
              <p className={styles.tags}>{service.tags}</p>
              <div className={styles.copy}>
                {service.details.map((paragraph, j) => (
                  <p key={paragraph.slice(0, 24)} className={j > 0 ? styles.extra : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <a href="#request" className={styles.cta}>
                Request a quote <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className={styles.media}>
            <motion.div className={styles.mediaInner} style={reduceMotion ? undefined : { scale: imageScale }}>
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                sizes="(max-width: 860px) 100vw, 52vw"
                placeholder="blur"
                className={styles.image}
              />
            </motion.div>
          </div>
        </div>

        <motion.div className={styles.dim} style={{ opacity: reduceMotion ? 0 : dim }} aria-hidden="true" />
      </motion.article>
    </li>
  );
}
