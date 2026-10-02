"use client";

import { useLenis } from "lenis/react";
import { Reveal } from "@/components/motion/Reveal";
import { FLEET_SECTIONS } from "@/data/navigation";
import type { FleetAircraft, FleetCategory } from "@/data/fleet";
import { prefillCharter } from "@/lib/charter";
import { glideTo } from "@/lib/scroll";
import { AircraftCard } from "./AircraftCard";
import { TYPE_OF } from "./FleetCarousel";
import fleetStyles from "./Fleet.module.css";
import styles from "./FleetCatalogue.module.css";

const CATEGORY_OF: Record<(typeof FLEET_SECTIONS)[number]["id"], FleetCategory["id"]> = {
  "business-jets": "jets",
  helicopters: "helicopters",
  turboprops: "turboprops",
};

const BLURBS: Record<FleetCategory["id"], string> = {
  jets: "Light and mid-size business jets for fast, private travel across India and the region.",
  helicopters: "Single and twin-engine helicopters for transfers, tours and time-critical missions.",
  turboprops: "A versatile twin-turboprop for regional routes and shorter runways.",
};

/** Every aircraft, grouped as in the sitemap, on the midnight fleet panel. */
export function FleetCatalogue({ categories }: { categories: FleetCategory[] }) {
  const lenis = useLenis();

  const request = (aircraft: FleetAircraft, category: FleetCategory["id"]) => {
    prefillCharter({ aircraftType: TYPE_OF[category], note: `I'm interested in chartering the ${aircraft.name}.` });
    glideTo(lenis, "#request");
  };

  const sections = FLEET_SECTIONS.map((section) => ({
    ...section,
    category: categories.find((c) => c.id === CATEGORY_OF[section.id])!,
  }));

  return (
    <section className={`${fleetStyles.fleet} ${styles.catalogue}`} aria-label="Aircraft fleet">
      <div className="container">
        <Reveal y={14}>
          <ul className={styles.jump} aria-label="Fleet categories">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  {s.label}
                  <span>{s.category.aircraft.length}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {sections.map((s) => (
          <div key={s.id} id={s.id} className={styles.category}>
            <Reveal className={styles.head}>
              <h2 className={`serif ${styles.title}`}>
                {s.label}
                <span className={styles.count}>
                  {s.category.aircraft.length} aircraft
                </span>
              </h2>
              <p className={styles.blurb}>{BLURBS[s.category.id]}</p>
            </Reveal>
            <ul className={styles.grid}>
              {s.category.aircraft.map((aircraft, i) => (
                <Reveal as="li" key={aircraft.slug} delay={(i % 3) * 0.08} y={30}>
                  <AircraftCard
                    aircraft={aircraft}
                    onRequest={() => request(aircraft, s.category.id)}
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        ))}

        <Reveal className={styles.footnote}>
          <p>Specifications are indicative and vary by configuration. More aircraft are available on request.</p>
        </Reveal>
      </div>
    </section>
  );
}
