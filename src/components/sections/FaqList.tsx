"use client";

import { useId, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { Arrow } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import type { FaqItem } from "@/data/faq";
import styles from "./Faq.module.css";

/**
 * Questions that open to show their answer; any number can be open at once. Closed answers stay in the page
 * (for search engines and the browser's find), made inert so their links can't be tabbed to.
 */
export function FaqList({ items }: { items: FaqItem[] }) {
  const uid = useId();
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());

  const toggle = (index: number) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(index)) next.add(index);
      return next;
    });

  return (
    <ul className={styles.list}>
      {items.map((item, i) => {
        const isOpen = open.has(i);
        const panel = `${uid}-answer-${i}`;
        return (
          <Reveal as="li" key={item.question} delay={Math.min(i, 5) * 0.05} y={16}>
            <div className={styles.item} data-open={isOpen ? "" : undefined}>
              <h3 className={styles.question}>
                <button type="button" aria-expanded={isOpen} aria-controls={panel} onClick={() => toggle(i)}>
                  <span className="serif">{item.question}</span>
                  <span className={styles.icon} aria-hidden="true" />
                </button>
              </h3>
              <div id={panel} className={styles.answer} inert={!isOpen}>
                <div className={styles.answerClip}>
                  <div className={styles.answerBody}>
                    <p>{item.answer}</p>
                    {item.link && (
                      <RouteLink href={item.link.href} className={styles.link}>
                        {item.link.label}
                        <Arrow />
                      </RouteLink>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </ul>
  );
}
