import type { StaticImageData } from "next/image";
import jetCabin from "@/assets/images/services/jet-cabin.jpg";
import cityTransfer from "@/assets/images/services/city-transfer.jpg";
import acquisition from "@/assets/images/services/acquisition.jpg";
import hangar from "@/assets/images/services/hangar.jpg";
import sales from "@/assets/images/services/sales.jpg";
import medevac from "@/assets/images/services/medevac.jpg";

export type Service = {
  slug: string;
  title: string;
  tags: string;
  details: string[];
  image: StaticImageData;
  imageAlt: string;
};

// Copy adapted from the Services page on flycelesta.in.
export const services: Service[] = [
  {
    slug: "jet-charters",
    title: "Business Jet Charters",
    tags: "Turboprops to large-cabin jets",
    details: [
      "A personal, relationship-based approach to aircraft charter. Our detailed standardisation process means the same luxury experience every time you step aboard.",
      "Our charter fleet ranges from regional turboprops all the way up to transcontinental large-cabin executive jets.",
    ],
    image: jetCabin,
    imageAlt: "Cream leather armchairs in the cabin of a business jet",
  },
  {
    slug: "helicopter-charters",
    title: "Helicopter Charters",
    tags: "Transfers · Scenic tours",
    details: [
      "The ultimate combination of luxury and convenience — a bespoke itinerary far removed from the constraints of commercial flights.",
      "From quick city transfers to scenic aerial tours, a private helicopter turns any journey into an extraordinary one.",
    ],
    image: cityTransfer,
    imageAlt: "Helicopter flying between Manhattan skyscrapers",
  },
  {
    slug: "acquisitions-leasing",
    title: "Acquisitions & Leasing",
    tags: "Buying · Dry leasing · Finance",
    details: [
      "As your advisor and buyer's advocate, we narrow the long list of models to those that fit your mission, then guide you on features, value retention and pricing.",
      "Decades of industry contacts mean we often hear about available aircraft before they are listed publicly.",
    ],
    image: acquisition,
    imageAlt: "Navy and gold AW109SP GrandNew helicopter in flight",
  },
  {
    slug: "management-consulting",
    title: "Management & Consulting",
    tags: "Safety · Service · Savings",
    details: [
      "Full operational oversight — maintenance coordination, crew management, regulatory compliance and financial reporting — so your aircraft is always flight-ready.",
      "We market your aircraft to charter clients, corporate flight departments and brokers, turning idle time into revenue.",
    ],
    image: hangar,
    imageAlt: "Gulfstream G200 business jet parked in front of an open hangar",
  },
  {
    slug: "sales-appraisal",
    title: "Aircraft Sales & Appraisal",
    tags: "Valuation · Marketing",
    details: [
      "Independent appraisals and a discreet sales process that reaches qualified buyers, operators and brokers worldwide.",
      "We handle market analysis, negotiation, due diligence and delivery with precision and transparency.",
    ],
    image: sales,
    imageAlt: "Red Bell 505 helicopter on the apron",
  },
  {
    slug: "medevac-aerial-work",
    title: "Medical Evacuation & Aerial Work",
    tags: "Medevac · Surveys · Connectivity",
    details: [
      "Helicopter and fixed-wing support for medical evacuations, aerial surveys and regional connectivity — flown by ex-military and civil aviation veterans.",
      "Rapid response and tailored planning where every minute matters.",
    ],
    image: medevac,
    imageAlt: "Red and white rescue helicopter flying above Alpine peaks",
  },
];
