"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { FleetAircraft, FleetCategory } from "@/data/fleet";
import { prefillCharter, type AircraftType } from "@/lib/charter";
import { glideTo } from "@/lib/scroll";
import { AircraftCard, ArrowIcon as Arrow } from "./AircraftCard";
import styles from "./Fleet.module.css";

export const TYPE_OF: Record<FleetCategory["id"], AircraftType> = {
  helicopters: "Helicopter",
  jets: "Private Jet",
  turboprops: "Turboprop",
};

type Item = FleetAircraft & { categoryId: FleetCategory["id"] };

export function FleetCarousel({ categories }: { categories: FleetCategory[] }) {
  const lenis = useLenis();
  const [filter, setFilter] = useState<"all" | FleetCategory["id"]>("all");
  const [edges, setEdges] = useState({ start: true, end: false });
  const trackRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ active: false, moved: false, x: 0, left: 0 });
  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, { stiffness: 220, damping: 30 });

  const all: Item[] = categories.flatMap((c) => c.aircraft.map((a) => ({ ...a, categoryId: c.id })));
  const items = filter === "all" ? all : all.filter((a) => a.categoryId === filter);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    progress.set(max > 0 ? el.scrollLeft / max : 1);
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft >= max - 4 });
  }, [progress]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, filter]);

  const choose = (next: typeof filter) => {
    setFilter(next);
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  };

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  // Mouse drag-to-scroll (touch and trackpads scroll natively)
  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { active: true, moved: false, x: e.clientX, left: trackRef.current.scrollLeft };
  };
  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    const dx = e.clientX - drag.current.x;
    if (!drag.current.moved && Math.abs(dx) > 6) {
      drag.current.moved = true;
      el.dataset.dragging = "true";
      el.setPointerCapture(e.pointerId);
    }
    if (drag.current.moved) el.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    if (trackRef.current) delete trackRef.current.dataset.dragging;
    drag.current.active = false;
  };

  const request = (aircraft: Item) => {
    if (drag.current.moved) return;
    prefillCharter({ aircraftType: TYPE_OF[aircraft.categoryId], note: `I'm interested in chartering the ${aircraft.name}.` });
    glideTo(lenis, "#request");
  };

  const filters: { id: typeof filter; label: string; count: number }[] = [
    { id: "all", label: "All aircraft", count: all.length },
    ...categories.map((c) => ({ id: c.id, label: c.label, count: c.aircraft.length })),
  ];

  return (
    <div className={styles.carousel}>
      <div className={`container ${styles.toolbar}`}>
        <div className={styles.filters} role="group" aria-label="Filter aircraft">
          {filters.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                className={styles.filter}
                aria-pressed={active}
                onClick={() => choose(f.id)}
              >
                {active && (
                  <motion.span layoutId="fleet-filter" className={styles.filterPill} transition={{ type: "spring", stiffness: 380, damping: 34 }} />
                )}
                <span className={styles.filterLabel}>{f.label}</span>
                <span className={styles.filterCount}>{f.count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.navButton} onClick={() => step(-1)} disabled={edges.start} aria-label="Previous aircraft">
            <Arrow flip />
          </button>
          <button type="button" className={styles.navButton} onClick={() => step(1)} disabled={edges.end} aria-label="Next aircraft">
            <Arrow />
          </button>
        </div>
      </div>

      <ul
        ref={trackRef}
        className={styles.track}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        aria-label="Aircraft available for charter"
        data-lenis-prevent-horizontal
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((a, i) => (
            <motion.li
              key={a.slug}
              layout
              className={styles.item}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 6) * 0.04 }}
            >
              <AircraftCard aircraft={a} onRequest={() => request(a)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className={`container ${styles.progressRow}`}>
        <div className={styles.progress} aria-hidden="true">
          <motion.span style={{ scaleX: progressSpring }} />
        </div>
        <p className={styles.count}>
          {items.length} aircraft
        </p>
      </div>
    </div>
  );
}
