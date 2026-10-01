import type { AircraftType } from "@/lib/charter";
import { findAircraft, type FleetAircraft } from "./fleet";

export type CharterDeal = {
  aircraft: FleetAircraft;
  type: AircraftType;
  /** Indian rupees per flight hour */
  hourlyRate: number;
};

// Rates as advertised on flycelesta.in.
export const deals: CharterDeal[] = [
  { aircraft: findAircraft("bell-407"), type: "Helicopter", hourlyRate: 135000 },
  { aircraft: findAircraft("king-air-200"), type: "Turboprop", hourlyRate: 185000 },
  { aircraft: findAircraft("hawker-900xp"), type: "Private Jet", hourlyRate: 395000 },
];

export const formatInr = (value: number) => `₹${value.toLocaleString("en-IN")}`;
