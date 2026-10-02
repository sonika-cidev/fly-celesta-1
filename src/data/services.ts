import type { StaticImageData } from "next/image";
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
  /** Page heading: first line, then the italic accent line. */
  heading: [string, string];
  tags: string;
  summary: string;
  details: string[];
  offerings: string[];
  image: StaticImageData;
  imageAlt: string;
  form: ServiceForm;
};

const page = (slug: ServiceSlug) => SERVICE_PAGES.find((s) => s.slug === slug)!;

// The five services from the client's sitemap. Copy adapts the current flycelesta.in services
// text where it exists; Unmanned Aviation Systems is new — confirm wording with the client.
export const services: Service[] = [
  {
    slug: "charter-services",
    title: page("charter-services").title,
    heading: ["Charter", "services."],
    tags: page("charter-services").note,
    summary:
      "Private helicopter, jet and turboprop charters planned around your schedule — from short transfers to long-range executive travel.",
    details: [
      "We practise a personal, relationship-based approach to aircraft charter. Our detailed standardisation process means the same high standard of service every time you step aboard.",
      "A private helicopter turns any journey into an extraordinary one — quick city transfers, scenic aerial tours or time-critical medical evacuations, far from the constraints of commercial flights. For longer distances, our options range from regional turboprops to mid-size business jets.",
    ],
    offerings: [
      "Helicopter charters for transfers, events and scenic flights",
      "Business jet and turboprop charters across India and beyond",
      "Medical evacuation and time-critical missions",
      "Aircraft matched to your passengers, route and schedule",
      "End-to-end coordination, tailored to every detail",
    ],
    image: cityTransfer,
    imageAlt: "Helicopter flying between Manhattan skyscrapers",
    form: { kind: "charter" },
  },
  {
    slug: "aircraft-for-sale",
    title: page("aircraft-for-sale").title,
    heading: ["Aircraft", "for sale."],
    tags: page("aircraft-for-sale").note,
    summary:
      "New and pre-owned helicopters, turboprops and business jets, sourced with an advisor on your side — including aircraft that never reach the open market.",
    details: [
      "Acquiring an aircraft is a complex process, whether new or pre-owned. As your advisor and buyer's advocate, we narrow the long list of models to those that fit your mission, then guide you on features, value retention and pricing.",
      "Our industry contacts mean we often hear about available aircraft before they are listed publicly. Listings change quickly and many are offered discreetly — tell us what you're looking for and we'll share current options.",
    ],
    offerings: [
      "New and pre-owned helicopters, turboprops and business jets",
      "Market analysis and independent valuation",
      "Negotiation, due diligence and pre-purchase inspection",
      "Financing and dry-lease options",
      "Delivery and entry into service",
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
  },
  {
    slug: "aircraft-wanted",
    title: page("aircraft-wanted").title,
    heading: ["Aircraft", "wanted."],
    tags: page("aircraft-wanted").note,
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
  },
  {
    slug: "aviation-consultancy",
    title: page("aviation-consultancy").title,
    heading: ["Aviation", "consultancy."],
    tags: page("aviation-consultancy").note,
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
  },
  {
    slug: "unmanned-aviation-systems",
    title: page("unmanned-aviation-systems").title,
    heading: ["Unmanned", "aviation systems."],
    tags: page("unmanned-aviation-systems").note,
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
  },
];

export const findService = (slug: string) => services.find((s) => s.slug === slug);
