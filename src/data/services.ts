import type { StaticImageData } from "next/image";
import aw109e from "@/assets/images/fleet/aw109e.jpg";
import aw119 from "@/assets/images/fleet/aw119.jpg";
import bell429 from "@/assets/images/fleet/bell-429.jpg";
import h135 from "@/assets/images/fleet/h135.jpg";
import cityTransfer from "@/assets/images/services/city-transfer.jpg";
import acquisition from "@/assets/images/services/acquisition.jpg";
import sales from "@/assets/images/services/sales.jpg";
import hangar from "@/assets/images/services/hangar.jpg";
import uas from "@/assets/images/services/uas.jpg";
import type { InquiryTopic } from "@/lib/inquiry";
import { SERVICE_PAGES, type ServiceSlug } from "./navigation";

export type ServiceForm =
  | { kind: "charter" }
  | { kind: "enquiry"; topic: InquiryTopic; label: string; title: [string, string]; lede: string };

export type Service = {
  slug: ServiceSlug;
  title: string;
  group: (typeof SERVICE_PAGES)[number]["group"];
  /** Small line above the page heading — part of the page's h1, so it carries the main search phrase. */
  label: string;
  /** Page heading: first line, then the italic accent line. */
  heading: [string, string];
  tags: string;
  summary: string;
  details: string[];
  offerings: string[];
  image: StaticImageData;
  imageAlt: string;
  form: ServiceForm;
  /** Search result title (the site name is added after it) and description. */
  seo: { title: string; description: string; keywords: string[] };
};

const page = (slug: ServiceSlug) => SERVICE_PAGES.find((s) => s.slug === slug)!;
const base = (slug: ServiceSlug) => ({ slug, title: page(slug).title, tags: page(slug).note, group: page(slug).group });

// The client's five services, plus the four specialist helicopter services (joyrides, shuttles, air ambulance,
// flower drops). Copy adapts the current flycelesta.in text where it exists; Unmanned Aviation Systems and the
// helicopter services are drafted — confirm wording with the client.
export const services: Service[] = [
  {
    ...base("charter-services"),
    label: "Private jets on rent · Helicopter charter",
    heading: ["Charter", "services."],
    summary:
      "Private jets on rent and helicopter charters across Kerala, Karnataka, Tamil Nadu and the rest of India — from short transfers to long-range executive travel.",
    details: [
      "We practise a personal, relationship-based approach to aircraft charter. Our detailed standardisation process means the same high standard of service every time you step aboard.",
      "A private helicopter turns any journey into an extraordinary one — quick city transfers, scenic aerial tours or time-critical medical evacuations, far from the constraints of commercial flights. For longer distances, rent a private jet or a turboprop: one way, a same-day return or a multi-city tour.",
    ],
    offerings: [
      "Private jets on rent — one way, return or multi-city",
      "Helicopter charters for transfers, events and scenic flights",
      "Turboprop charters across India and beyond",
      "Medical evacuation and time-critical missions",
      "Aircraft matched to your passengers, route and schedule",
    ],
    image: cityTransfer,
    imageAlt: "Helicopter flying between Manhattan skyscrapers",
    form: { kind: "charter" },
    seo: {
      title: "Private Jet on Rent & Helicopter Charter",
      description:
        "Rent a private jet or charter a helicopter in Kerala, Karnataka, Tamil Nadu and across India — one way, return or multi-city, planned by Fly Celesta, Bengaluru.",
      keywords: ["private jet on rent", "private jet rental India", "helicopter charter", "rent a helicopter", "private jet charter Bengaluru"],
    },
  },
  {
    ...base("helicopter-joyrides"),
    label: "Joyrides across Kerala & Tamil Nadu",
    heading: ["Helicopter", "joyrides."],
    summary:
      "Scenic helicopter joyrides across Kerala and Tamil Nadu — over backwaters, beaches, hills and temple towns, for families, couples, guests and celebrations.",
    details: [
      "A helicopter joyride is the most memorable way to see South India from above. We arrange scenic flights over Kerala's backwaters and coastline and Tamil Nadu's hills and temple towns — for a birthday, a proposal, a family holiday or simply the thrill of flight.",
      "Joyrides can also be organised for festivals, resorts and corporate events, with flights through the day. We plan the aircraft, the route, the landing site and the permissions, and our crew briefs every passenger before take-off.",
    ],
    offerings: [
      "Scenic helicopter joyrides in Kerala and Tamil Nadu",
      "Private flights for couples, families and small groups",
      "Joyride programmes for festivals, resorts and events",
      "Helicopters chosen for comfort and a clear view",
      "Route planning, permissions and passenger briefing",
    ],
    image: aw119,
    imageAlt: "White and gold AW119 Koala helicopter in flight",
    form: { kind: "charter" },
    seo: {
      title: "Helicopter Joyrides in Kerala & Tamil Nadu",
      description:
        "Book a helicopter joyride in Kerala or Tamil Nadu — scenic flights over backwaters, beaches and hills for families, couples and events, with Fly Celesta.",
      keywords: ["helicopter joyride Kerala", "helicopter joyride Tamil Nadu", "helicopter ride", "scenic helicopter flight", "joyride booking"],
    },
  },
  {
    ...base("helicopter-shuttles"),
    label: "Helicopter shuttle services · South India",
    heading: ["Helicopter", "shuttles."],
    summary:
      "Helicopter shuttles between airports, cities, resorts and event venues across Kerala, Karnataka and Tamil Nadu — repeated, on-time flights for your guests and teams.",
    details: [
      "When many people need to move between the same places — an airport and a wedding venue, a city and a hill resort, a festival ground and the nearest helipad — a helicopter shuttle turns hours on the road into minutes in the air.",
      "We plan the shuttle around your schedule: the aircraft, the timetable, the landing sites and the permissions, with ground coordination at each end. A shuttle can run for a single day or for the length of an event.",
    ],
    offerings: [
      "Airport, city and resort transfers",
      "Guest shuttles for weddings and events",
      "Corporate and site-visit shuttles",
      "Timetables planned around your schedule",
      "Landing sites, permissions and ground coordination",
    ],
    image: aw109e,
    imageAlt: "Grey Agusta A109E Power helicopter in flight",
    form: { kind: "charter" },
    seo: {
      title: "Helicopter Shuttle Services in South India",
      description:
        "Helicopter shuttles between airports, cities, resorts and event venues in Kerala, Karnataka and Tamil Nadu — timetables planned around your schedule.",
      keywords: ["helicopter shuttle", "helicopter shuttle service", "helicopter transfer", "airport helicopter transfer", "wedding helicopter shuttle"],
    },
  },
  {
    ...base("air-ambulance"),
    label: "Helicopter & jet air ambulance",
    heading: ["Air", "ambulance."],
    summary:
      "Air ambulance flights by helicopter and jet — urgent patient transfers between hospitals and cities across Kerala, Karnataka, Tamil Nadu and the rest of India.",
    details: [
      "When time matters, an air ambulance brings a patient to the right hospital in a fraction of the time by road. We arrange helicopter and fixed-wing air ambulance flights for inter-hospital transfers, medical evacuations and repatriation within India and beyond.",
      "We coordinate the aircraft, the medical team and the ground ambulances at both ends, working with the treating doctors so the patient is cared for from bed to bed. For an urgent request, call us directly.",
    ],
    offerings: [
      "Helicopter air ambulance for shorter distances",
      "Jet air ambulance for longer and international transfers",
      "Inter-hospital patient transfers",
      "Medical team arranged with the treating hospital",
      "Ground ambulances at departure and arrival",
    ],
    image: h135,
    imageAlt: "Airbus H135 helicopter in flight",
    form: { kind: "charter" },
    seo: {
      title: "Air Ambulance Services — Helicopter & Jet",
      description:
        "Air ambulance by helicopter and jet for urgent patient transfers across Kerala, Karnataka, Tamil Nadu and India — coordinated bed to bed. Call Fly Celesta.",
      keywords: ["air ambulance", "air ambulance Kerala", "air ambulance Bengaluru", "helicopter ambulance", "air ambulance Chennai"],
    },
  },
  {
    ...base("helicopter-flower-drop"),
    label: "Petal showers · Weddings & temple festivals",
    heading: ["Helicopter", "flower drops."],
    summary:
      "Helicopter flower drops (petal showers) for weddings, temple festivals, inaugurations and celebrations across Kerala, Karnataka and Tamil Nadu.",
    details: [
      "A shower of petals from a helicopter turns any moment into a spectacle — a couple's entrance, a temple consecration (kumbabishekam), a festival procession, a statue unveiling or the opening of a new building.",
      "We plan everything with you: the timing to the minute, the flowers and how much to carry, the approach and the height, and the permissions a flower drop needs from the aviation and local authorities. Tell us the occasion and the location as early as you can.",
    ],
    offerings: [
      "Petal showers for weddings and receptions",
      "Temple festivals and consecrations (kumbabishekam)",
      "Inaugurations, unveilings and public events",
      "Timing planned to the minute with your organisers",
      "Permissions from aviation and local authorities",
    ],
    image: bell429,
    imageAlt: "Black and gold Bell 429 helicopter in flight",
    form: {
      kind: "enquiry",
      topic: "Flower drop",
      label: "Flower drops",
      title: ["Plan your", "flower drop."],
      lede: "Tell us the occasion, the location, the date and the time — we'll come back with the aircraft, the plan and the permissions it needs.",
    },
    seo: {
      title: "Helicopter Flower Drop for Weddings & Temples",
      description:
        "Helicopter flower drops (petal showers) for weddings, temple festivals and events in Kerala, Karnataka and Tamil Nadu — planned and permitted by Fly Celesta.",
      keywords: ["helicopter flower drop", "helicopter flower shower", "petal shower helicopter", "wedding flower drop", "temple festival flower drop"],
    },
  },
  {
    ...base("aircraft-for-sale"),
    label: "Helicopters & private jets for sale",
    heading: ["Aircraft", "for sale."],
    summary:
      "Helicopters and private jets for sale — new and pre-owned helicopters, turboprops and business jets, sourced with an advisor on your side, including aircraft that never reach the open market.",
    details: [
      "Acquiring an aircraft is a complex process, whether new or pre-owned. As your advisor and buyer's advocate, we narrow the long list of helicopters and private jets to those that fit your mission, then guide you on features, value retention and pricing.",
      "Our industry contacts mean we often hear about available aircraft before they are listed publicly. Listings change quickly and many are offered discreetly — tell us what you're looking for and we'll share current options.",
    ],
    offerings: [
      "New and pre-owned helicopters for sale",
      "Private jets and turboprops for sale",
      "Market analysis and independent valuation",
      "Negotiation, due diligence and pre-purchase inspection",
      "Financing, dry-lease options, delivery and entry into service",
    ],
    image: acquisition,
    imageAlt: "Navy and gold AW109SP GrandNew helicopter in flight",
    form: {
      kind: "enquiry",
      topic: "Aircraft for sale",
      label: "Aircraft for sale",
      title: ["Find your", "next aircraft."],
      lede: "Share the aircraft you have in mind — type, budget and timeline — and we'll come back with current options.",
    },
    seo: {
      title: "Helicopters & Private Jets for Sale in India",
      description:
        "Helicopters and private jets for sale in India — new and pre-owned helicopters, turboprops and business jets, with valuation, inspection and financing support.",
      keywords: ["helicopters for sale", "private jets for sale", "buy a helicopter India", "pre-owned private jet", "used helicopter for sale"],
    },
  },
  {
    ...base("aircraft-wanted"),
    label: "Sell your helicopter or private jet",
    heading: ["Aircraft", "wanted."],
    summary:
      "Thinking of selling? Our clients are looking for well-maintained helicopters, turboprops and business jets — tell us about your aircraft.",
    details: [
      "Our network of private, corporate and operator clients is always searching for quality aircraft. Share the details of yours and we'll match it with qualified buyers, discreetly.",
      "We provide an independent appraisal, prepare the aircraft's records and marketing, and manage negotiation through to closing — so you achieve a fair price without the distraction.",
    ],
    offerings: [
      "Independent valuation and appraisal",
      "Discreet marketing to qualified buyers and operators",
      "Records review and pre-sale preparation",
      "Negotiation and closing support",
    ],
    image: sales,
    imageAlt: "Red Bell 505 helicopter on the apron",
    form: {
      kind: "enquiry",
      topic: "Aircraft wanted",
      label: "Aircraft wanted",
      title: ["Tell us about", "your aircraft."],
      lede: "Make, model, year, total hours and location — we'll come back with a valuation and the next steps.",
    },
    seo: {
      title: "Sell Your Helicopter or Private Jet",
      description:
        "Selling a helicopter, turboprop or private jet? Get an independent valuation and reach qualified buyers discreetly with Fly Celesta, Bengaluru.",
      keywords: ["sell helicopter", "sell private jet", "aircraft valuation", "aircraft brokerage India"],
    },
  },
  {
    ...base("aviation-consultancy"),
    label: "Aircraft management & aviation advisory",
    heading: ["Aviation", "consultancy."],
    summary:
      "Independent advice and hands-on management for aircraft owners, operators and organisations — focused on safety, service and savings.",
    details: [
      "Owning or operating an aircraft is a major investment with considerable responsibilities. We provide full operational oversight — maintenance coordination, crew management, regulatory compliance and financial reporting — so your aircraft is always flight-ready.",
      "Our team of ex-military aviators and civil aviation professionals also advises on fleet planning, new operations and regional connectivity projects, and can market your aircraft for charter to turn idle time into revenue.",
    ],
    offerings: [
      "Aircraft management — maintenance, crew and compliance",
      "Charter revenue programmes for owners",
      "Fleet planning and aircraft selection",
      "Operational and regulatory advisory",
      "Regional connectivity and new-operation projects",
    ],
    image: hangar,
    imageAlt: "Gulfstream G200 business jet parked in front of an open hangar",
    form: {
      kind: "enquiry",
      topic: "Aviation consultancy",
      label: "Aviation consultancy",
      title: ["Let's talk about", "your operation."],
      lede: "Tell us about your aircraft, operation or project and one of our consultants will be in touch.",
    },
    seo: {
      title: "Aviation Consultancy & Aircraft Management",
      description:
        "Aviation consultancy and aircraft management in India — maintenance, crew, compliance, fleet planning and charter revenue programmes for owners and operators.",
      keywords: ["aviation consultancy India", "aircraft management", "helicopter management", "aviation advisory"],
    },
  },
  {
    ...base("unmanned-aviation-systems"),
    label: "Drone survey, mapping & inspection",
    heading: ["Unmanned", "aviation systems."],
    summary:
      "Drone and unmanned aircraft solutions for aerial survey, mapping and inspection — from platform selection to safe, compliant operations.",
    details: [
      "Unmanned aviation is opening new possibilities for infrastructure, agriculture, mining and public safety. We help organisations adopt drone technology responsibly, combining aviation operating experience with modern unmanned platforms.",
      "From choosing the right system for each mission to regulatory approvals and operations planning, we make unmanned flight safe, compliant and efficient.",
    ],
    offerings: [
      "Aerial survey, mapping and photography",
      "Infrastructure and asset inspection",
      "Platform selection and procurement",
      "Regulatory approvals and compliance support",
      "Operations planning and safety management",
    ],
    image: uas,
    imageAlt: "Camera drone hovering above snow-capped mountain peaks",
    form: {
      kind: "enquiry",
      topic: "Unmanned aviation systems",
      label: "Unmanned aviation",
      title: ["Plan your", "drone project."],
      lede: "Tell us about your application, area and timeline, and our team will propose a solution.",
    },
    seo: {
      title: "Drone Services: Survey, Mapping & Inspection",
      description:
        "Drone services in India — aerial survey, mapping and infrastructure inspection, with platform selection, regulatory approvals and safe operations.",
      keywords: ["drone services India", "drone survey", "drone mapping", "drone inspection"],
    },
  },
];

export const findService = (slug: string) => services.find((s) => s.slug === slug);

export const servicesIn = (group: Service["group"]) => services.filter((s) => s.group === group);
