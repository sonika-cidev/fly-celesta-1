"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Figures } from "@/components/ui/Figures";
import type { FleetAircraft, FleetCategory } from "@/data/fleet";
import styles from "./FleetShowcase.module.css";

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;
const EASE_LUX = [0.65, 0, 0.35, 1] as const;
const HOVER_INTENT_MS = 140;

const specsOf = (a: FleetAircraft) => [
  { label: "Passengers", value: `Up to ${a.passengers}` },
  { label: "Cruise speed", value: `${a.cruise} km/h` },
  { label: "Range", value: `${a.range.toLocaleString("en-IN")} km` },
  { label: "Configuration", value: `${a.engines === 1 ? "Single" : "Twin"} engine · ${a.crew} crew` },
];

/** Odometer-style swap for a changing value. */
function RollingValue({ value }: { value: string }) {
  return (
    <span className={styles.roll}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className={styles.rollValue}
          initial={{ y: "105%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-105%" }}
          transition={{ duration: 0.5, ease: EASE_LUX }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function FleetShowcase({ categories }: { categories: FleetCategory[] }) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const category = categories[categoryIndex];
  const aircraft = category.aircraft[selected] ?? category.aircraft[0];

  const chooseCategory = (index: number) => {
    setCategoryIndex(index);
    setSelected(0);
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern)
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (categoryIndex + (e.key === "ArrowRight" ? 1 : -1) + categories.length) % categories.length;
    chooseCategory(next);
    tabRefs.current[next]?.focus();
  };

  const previewOnHover = (index: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setSelected(index), HOVER_INTENT_MS);
  };
  const cancelHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  return (
    <div className={styles.showcase}>
      <div className={styles.tabs} role="tablist" aria-label="Aircraft categories">
        {categories.map((c, i) => {
          const active = i === categoryIndex;
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`fleet-tab-${c.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="fleet-panel"
              tabIndex={active ? 0 : -1}
              className={styles.tab}
              onClick={() => chooseCategory(i)}
              onKeyDown={onTabKeyDown}
            >
              {active && (
                <motion.span
                  layoutId="fleet-tab-pill"
                  className={styles.tabPill}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
              <span className={styles.tabLabel}>{c.label}</span>
              <span className={styles.tabCount}>{String(c.aircraft.length).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>

      <div id="fleet-panel" role="tabpanel" aria-labelledby={`fleet-tab-${category.id}`} className={styles.panel}>
        <div className={styles.stage}>
          <div className={styles.media}>
            {/* Each new aircraft wipes in from the right over the previous one */}
            <AnimatePresence initial={false}>
              <motion.div
                key={aircraft.slug}
                className={styles.slide}
                initial={{ clipPath: "inset(0% 0% 0% 100%)" }}
                animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
                exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.5 } }}
                transition={{ duration: 0.95, ease: EASE_LUX }}
              >
                <motion.div
                  className={styles.slideZoom}
                  initial={{ scale: 1.14 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.6, ease: EASE_OUT }}
                >
                  <Image
                    src={aircraft.image}
                    alt={aircraft.imageAlt}
                    fill
                    sizes="(max-width: 960px) 100vw, 62vw"
                    placeholder="blur"
                    className={styles.image}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <div className={styles.caption}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={aircraft.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.5, ease: EASE_OUT }}
                >
                  <p className={styles.captionCategory}>{aircraft.category}</p>
                  <h3 className={styles.captionName}>
                    <Figures>{aircraft.name}</Figures>
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className={styles.counter} aria-hidden="true">
              <RollingValue value={String(selected + 1).padStart(2, "0")} />
              <span> / {String(category.aircraft.length).padStart(2, "0")}</span>
            </p>
          </div>

          <dl className={styles.specs}>
            {specsOf(aircraft).map((spec) => (
              <div key={spec.label} className={styles.spec}>
                <dt>{spec.label}</dt>
                <dd>
                  <RollingValue value={spec.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className={styles.models} aria-label={`${category.label} available for charter`}>
          {category.aircraft.map((a, i) => {
            const active = i === selected;
            return (
              <li key={a.slug}>
                <button
                  type="button"
                  className={styles.model}
                  aria-pressed={active}
                  onClick={() => {
                    cancelHover();
                    setSelected(i);
                  }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && previewOnHover(i)}
                  onPointerLeave={cancelHover}
                >
                  {active && (
                    <motion.span
                      layoutId={`fleet-model-${category.id}`}
                      className={styles.modelActive}
                      transition={{ type: "spring", stiffness: 420, damping: 38 }}
                    />
                  )}
                  <span className={styles.modelIndex}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.modelText}>
                    <span className={styles.modelName}>
                      <Figures>{a.name}</Figures>
                    </span>
                    <span className={styles.modelMeta}>
                      {a.category} · {a.passengers} pax
                    </span>
                  </span>
                  <span className={styles.modelArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
