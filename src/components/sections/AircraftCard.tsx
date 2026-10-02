"use client";

import Image from "next/image";
import type { FleetAircraft } from "@/data/fleet";
import styles from "./Fleet.module.css";

export const ArrowIcon = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

/** Aircraft card used by the home carousel and the fleet page. */
export function AircraftCard({ aircraft, onRequest, sizes = "(max-width: 640px) 80vw, 380px" }: { aircraft: FleetAircraft; onRequest: () => void; sizes?: string }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image src={aircraft.image} alt={aircraft.imageAlt} fill sizes={sizes} placeholder="blur" className={styles.image} draggable={false} />
        <span className={styles.badge}>{aircraft.category}</span>
      </div>
      <div className={styles.body}>
        <h3 className={`serif ${styles.name}`}>{aircraft.name}</h3>
        <dl className={styles.specs}>
          <div>
            <dt>Passengers</dt>
            <dd>Up to {aircraft.passengers}</dd>
          </div>
          <div>
            <dt>Cruise</dt>
            <dd>{aircraft.cruise} km/h</dd>
          </div>
          <div>
            <dt>Range</dt>
            <dd>{aircraft.range.toLocaleString("en-IN")} km</dd>
          </div>
          <div>
            <dt>Configuration</dt>
            <dd>
              {aircraft.engines === 1 ? "Single" : "Twin"} · {aircraft.crew} crew
            </dd>
          </div>
        </dl>
        <button type="button" className={styles.request} onClick={onRequest}>
          Request this aircraft
          <ArrowIcon />
        </button>
      </div>
    </article>
  );
}
