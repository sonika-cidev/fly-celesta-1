import type { StaticImageData } from "next/image";
import bell206l from "@/assets/images/fleet/bell-206l.jpg";
import bell407 from "@/assets/images/fleet/bell-407.jpg";
import h130 from "@/assets/images/fleet/h130.jpg";
import { REGION_PAGES, type RegionSlug } from "./navigation";

export type Region = {
  slug: RegionSlug;
  name: string;
  /** Page heading: first line, then the italic accent line. */
  heading: [string, string];
  summary: string;
  details: string[];
  /** What we arrange in the state. */
  offerings: string[];
  /** Cities and destinations named on the page. */
  places: string[];
  image: StaticImageData;
  imageAlt: string;
  seo: { title: string; description: string; keywords: string[] };
};

const name = (slug: RegionSlug) => REGION_PAGES.find((r) => r.slug === slug)!.name;

// "Helicopter services in <state>" landing pages. Drafted for the client's target searches — confirm the
// services offered in each state and the places named with the client.
export const regions: Region[] = [
  {
    slug: "kerala",
    name: name("kerala"),
    heading: ["Fly across", "Kerala."],
    summary:
      "Helicopter services across Kerala — charters, scenic joyrides, shuttles, air ambulance and flower drops, from Kochi and Thiruvananthapuram to Kozhikode and Kannur.",
    details: [
      "From the backwaters and beaches to the hills of the Western Ghats, Kerala is made for flying. We arrange helicopter and private jet flights across the state — to save hours between cities, to reach a resort or a wedding venue, or simply to see Kerala from above on a helicopter joyride.",
      "Every flight is planned by our team with the aircraft that suits your route, your passengers and the landing sites available, including the permissions a helicopter landing away from an airport needs.",
    ],
    offerings: [
      "Helicopter charters between Kerala's cities and resorts",
      "Helicopter joyrides over backwaters, beaches and hills",
      "Helicopter shuttles for weddings, festivals and events",
      "Air ambulance and urgent patient transfers",
      "Flower drops for weddings and temple festivals",
      "Private jets on rent to and from Kerala",
    ],
    places: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Kannur", "Munnar", "Alappuzha", "Wayanad", "Thrissur"],
    image: bell407,
    imageAlt: "Bell 407 helicopter in flight",
    seo: {
      title: "Helicopter Services in Kerala",
      description:
        "Helicopter services in Kerala — charters, joyrides, shuttles, air ambulance and flower drops in Kochi, Thiruvananthapuram, Kozhikode and across the state.",
      keywords: ["helicopter services in Kerala", "helicopter Kochi", "helicopter joyride Kerala", "air ambulance Kerala", "helicopter rental Kerala"],
    },
  },
  {
    slug: "karnataka",
    name: name("karnataka"),
    heading: ["Fly across", "Karnataka."],
    summary:
      "Helicopter services across Karnataka from our home in Bengaluru — charters, city transfers, shuttles, air ambulance and flower drops, from Mysuru and Coorg to the coast.",
    details: [
      "Fly Celesta is based in Bengaluru, so Karnataka is home ground. We arrange helicopter flights that skip the city's traffic, connect Bengaluru with Mysuru, Coorg, Hampi and the coast, and bring guests to weddings and events in style.",
      "For longer journeys, rent a private jet from Bengaluru to anywhere in India — or charter a helicopter for site visits, aerial surveys and time-critical medical transfers.",
    ],
    offerings: [
      "Helicopter charters from Bengaluru across Karnataka",
      "City and airport helicopter transfers in Bengaluru",
      "Helicopter shuttles for weddings, events and resorts",
      "Air ambulance and urgent patient transfers",
      "Flower drops for weddings, temples and inaugurations",
      "Private jets on rent from Bengaluru",
    ],
    places: ["Bengaluru", "Mysuru", "Mangaluru", "Coorg (Kodagu)", "Hubballi", "Belagavi", "Hampi", "Chikkamagaluru"],
    image: h130,
    imageAlt: "Airbus H130 helicopter in flight",
    seo: {
      title: "Helicopter Services in Karnataka & Bengaluru",
      description:
        "Helicopter services in Karnataka from Bengaluru — charters, city transfers, shuttles, air ambulance and flower drops to Mysuru, Coorg, Mangaluru and beyond.",
      keywords: ["helicopter services in Karnataka", "helicopter Bengaluru", "helicopter rental Bangalore", "air ambulance Bengaluru", "private jet Bengaluru"],
    },
  },
  {
    slug: "tamil-nadu",
    name: name("tamil-nadu"),
    heading: ["Fly across", "Tamil Nadu."],
    summary:
      "Helicopter services across Tamil Nadu — charters, joyrides, shuttles, air ambulance and temple-festival flower drops, from Chennai and Coimbatore to Madurai and the Nilgiris.",
    details: [
      "Tamil Nadu's temple towns, hill stations and coastline are hours apart by road and minutes apart by helicopter. We arrange flights between Chennai, Coimbatore, Madurai and Tiruchirappalli, to the Nilgiris and Kodaikanal, and to resorts and venues across the state.",
      "We also plan helicopter joyrides, and flower drops for temple festivals, consecrations (kumbabishekam) and weddings — the timing, the flowers and the permissions included.",
    ],
    offerings: [
      "Helicopter charters across Tamil Nadu",
      "Helicopter joyrides over hills, coast and temple towns",
      "Helicopter shuttles for weddings, festivals and events",
      "Air ambulance and urgent patient transfers",
      "Flower drops for temple festivals and weddings",
      "Private jets on rent to and from Tamil Nadu",
    ],
    places: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Ooty (Nilgiris)", "Kodaikanal", "Thoothukudi", "Salem"],
    image: bell206l,
    imageAlt: "Bell 206L LongRanger helicopter on a helipad",
    seo: {
      title: "Helicopter Services in Tamil Nadu",
      description:
        "Helicopter services in Tamil Nadu — charters, joyrides, shuttles, air ambulance and temple flower drops in Chennai, Coimbatore, Madurai and the Nilgiris.",
      keywords: ["helicopter services in Tamil Nadu", "helicopter Chennai", "helicopter joyride Tamil Nadu", "temple flower drop helicopter", "air ambulance Chennai"],
    },
  },
];

export const findRegion = (slug: string) => regions.find((r) => r.slug === slug);
