import type { StaticImageData } from "next/image";
import h125 from "@/assets/images/fleet/h125.jpg";
import h130 from "@/assets/images/fleet/h130.jpg";
import bell206l from "@/assets/images/fleet/bell-206l.jpg";
import bell407 from "@/assets/images/fleet/bell-407.jpg";
import aw119 from "@/assets/images/fleet/aw119.jpg";
import r66 from "@/assets/images/fleet/robinson-r66.jpg";
import h135 from "@/assets/images/fleet/h135.jpg";
import aw109e from "@/assets/images/fleet/aw109e.jpg";
import bell429 from "@/assets/images/fleet/bell-429.jpg";
import kingAir from "@/assets/images/fleet/king-air-200.jpg";
import premier from "@/assets/images/fleet/premier-1a.jpg";
import cj2 from "@/assets/images/fleet/citation-cj2.jpg";
import xls from "@/assets/images/fleet/citation-xls.jpg";
import hawker from "@/assets/images/fleet/hawker-900xp.jpg";
import g200 from "@/assets/images/fleet/gulfstream-g200.jpg";

export type FleetAircraft = {
  slug: string;
  name: string;
  category: string;
  passengers: number;
  /** km/h */
  cruise: number;
  /** km */
  range: number;
  engines: number;
  crew: number;
  image: StaticImageData;
  imageAlt: string;
};

export type FleetCategory = {
  id: "helicopters" | "jets" | "turboprops";
  label: string;
  aircraft: FleetAircraft[];
};

// Specifications as published on flycelesta.in/aircraft-fleet (indicative; vary by configuration).
export const fleet: FleetCategory[] = [
  {
    id: "helicopters",
    label: "Helicopters",
    aircraft: [
      { slug: "h125", name: "Airbus H125", category: "Light Helicopter", passengers: 5, cruise: 230, range: 500, engines: 1, crew: 1, image: h125, imageAlt: "Airbus H125 helicopter flying over snowy mountains" },
      { slug: "h130", name: "Airbus H130", category: "Light Helicopter", passengers: 6, cruise: 230, range: 500, engines: 1, crew: 1, image: h130, imageAlt: "Airbus H130 helicopter in flight" },
      { slug: "bell-206l", name: "Bell 206 LongRanger", category: "Light Helicopter", passengers: 6, cruise: 200, range: 450, engines: 1, crew: 1, image: bell206l, imageAlt: "Bell 206L LongRanger helicopter on a helipad" },
      { slug: "bell-407", name: "Bell 407", category: "Light Helicopter", passengers: 6, cruise: 230, range: 500, engines: 1, crew: 1, image: bell407, imageAlt: "Bell 407 helicopter in flight" },
      { slug: "aw119", name: "AW119 Koala", category: "Light Helicopter", passengers: 7, cruise: 245, range: 700, engines: 1, crew: 1, image: aw119, imageAlt: "White and gold AW119 Koala helicopter in flight" },
      { slug: "r66", name: "Robinson R66", category: "Light Helicopter", passengers: 4, cruise: 180, range: 400, engines: 1, crew: 1, image: r66, imageAlt: "Robinson R66 helicopter on a helipad" },
      { slug: "h135", name: "Airbus H135", category: "Light Twin Helicopter", passengers: 5, cruise: 250, range: 550, engines: 2, crew: 2, image: h135, imageAlt: "Privately operated Airbus H135 helicopter in flight" },
      { slug: "aw109e", name: "AW109E Power", category: "Light Twin Helicopter", passengers: 6, cruise: 280, range: 500, engines: 2, crew: 2, image: aw109e, imageAlt: "Grey Agusta A109E Power helicopter in flight" },
      { slug: "bell-429", name: "Bell 429", category: "Light Twin Helicopter", passengers: 6, cruise: 270, range: 600, engines: 2, crew: 2, image: bell429, imageAlt: "Black and gold Bell 429 helicopter in flight" },
    ],
  },
  {
    id: "jets",
    label: "Business Jets",
    aircraft: [
      { slug: "premier-1a", name: "Premier 1A", category: "Light Business Jet", passengers: 6, cruise: 740, range: 1800, engines: 2, crew: 2, image: premier, imageAlt: "Beechcraft Premier 1A business jet on approach" },
      { slug: "citation-cj2", name: "Citation CJ2+", category: "Light Business Jet", passengers: 6, cruise: 650, range: 2000, engines: 2, crew: 2, image: cj2, imageAlt: "Cessna Citation CJ2+ taxiing at an airport" },
      { slug: "citation-xls", name: "Citation 560 XLS", category: "Light Business Jet", passengers: 8, cruise: 800, range: 3400, engines: 2, crew: 2, image: xls, imageAlt: "Cessna Citation XLS business jet at dusk" },
      { slug: "hawker-900xp", name: "Hawker 900XP", category: "Mid-size Business Jet", passengers: 8, cruise: 740, range: 4700, engines: 2, crew: 2, image: hawker, imageAlt: "Hawker 900XP business jet taking off" },
      { slug: "gulfstream-g200", name: "Gulfstream G200", category: "Mid-size Business Jet", passengers: 9, cruise: 850, range: 6000, engines: 2, crew: 2, image: g200, imageAlt: "Gulfstream G200 business jet in flight against a dark sky" },
    ],
  },
  {
    id: "turboprops",
    label: "Turboprops",
    aircraft: [
      { slug: "king-air-200", name: "King Air 200", category: "Turboprop", passengers: 7, cruise: 450, range: 1500, engines: 2, crew: 2, image: kingAir, imageAlt: "Beechcraft King Air 200 turboprop banking in a blue sky" },
    ],
  },
];

export function findAircraft(slug: string): FleetAircraft {
  for (const category of fleet) {
    const match = category.aircraft.find((a) => a.slug === slug);
    if (match) return match;
  }
  throw new Error(`Unknown aircraft: ${slug}`);
}
