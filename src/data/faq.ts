import { site } from "./site";

// Frequently asked questions. Drafted from the services and company copy and general charter practice —
// confirm the answers with the client before launch.

export type FaqItem = {
  question: string;
  answer: string;
  link?: { label: string; href: string };
  /** Also shown in the FAQ section on the home page. */
  featured?: true;
};

export type FaqGroup = { id: string; title: string; items: FaqItem[] };

const charterForm = { label: "Request a charter", href: "/services/charter-services#request" };

export const faqGroups: FaqGroup[] = [
  {
    id: "booking",
    title: "Booking a charter",
    items: [
      {
        question: "How do I book a private charter?",
        answer: `Send us your route, travel dates and number of passengers with the charter request form, or call the charter desk on ${site.phone}. We'll come back with suitable aircraft options and a tailored quote — once you confirm, we take care of the rest.`,
        link: charterForm,
        featured: true,
      },
      {
        question: "How far in advance should I book?",
        answer:
          "As early as you can, especially around holidays, festivals and long weekends. We also handle short-notice requests: availability depends on the aircraft, the crew and any permissions your route needs, so call us and we'll tell you what's possible.",
        featured: true,
      },
      {
        question: "How is the price of a charter worked out?",
        answer:
          "Every quote is tailored to your trip. It depends mainly on the aircraft, the flying time, positioning the aircraft to your departure point, waiting time, and airport or helipad charges. We explain what's included before you confirm.",
        featured: true,
      },
      {
        question: "Can I book a one-way trip or a round trip?",
        answer:
          "Both. Choose one way or round trip on the request form and mention any extra stops in your message — we'll plan the routing and timings around your schedule.",
      },
      {
        question: "Which aircraft can I choose from?",
        answer:
          "Helicopters, turboprops and business jets — from light helicopters for short transfers to mid-size jets for longer journeys. We'll recommend the aircraft that suits your passengers, luggage, route and budget.",
        link: { label: "Explore the fleet", href: "/fleet" },
      },
      {
        question: "Where do you fly?",
        answer: "We're based in Bengaluru and arrange flights across India, Nepal and beyond. Tell us where you'd like to go and we'll plan the route.",
        featured: true,
      },
    ],
  },
  {
    id: "travel",
    title: "Travelling with us",
    items: [
      {
        question: "What documents do passengers need?",
        answer:
          "Every passenger needs a valid government-issued photo ID. For international flights, carry your passport and any visas you need. We'll confirm the details when we confirm your booking.",
        featured: true,
      },
      {
        question: "How much luggage can I bring?",
        answer:
          "It depends on the aircraft — helicopters and light jets have less space than larger jets. Let us know what you're bringing, including golf bags or equipment, and we'll make sure the aircraft suits it.",
      },
      {
        question: "Where can a helicopter land?",
        answer:
          "At airports and approved helipads. Landing anywhere else — a private estate or an event venue, for example — needs permissions and a site check, so share the location early and we'll advise what's possible.",
      },
      {
        question: "Is flying with Fly Celesta safe?",
        answer:
          "Safety comes first on every flight. Our team includes ex-military aviators and civil aviation veterans, and every flight is planned to the highest standards of safety and reliability.",
        featured: true,
      },
      {
        question: "Do you arrange medical evacuation flights?",
        answer: `Yes — medical evacuation and other time-critical missions are part of our charter services. For an urgent request, call the charter desk directly on ${site.phone}.`,
      },
    ],
  },
  {
    id: "aircraft",
    title: "Aircraft sales & services",
    items: [
      {
        question: "Can you help me buy an aircraft?",
        answer:
          "Yes. As your advisor and buyer's advocate, we shortlist suitable new and pre-owned helicopters, turboprops and business jets, then handle valuation, negotiation, due diligence and pre-purchase inspection through to delivery.",
        link: { label: "Aircraft for sale", href: "/services/aircraft-for-sale" },
      },
      {
        question: "How do I sell my aircraft through you?",
        answer:
          "Tell us the make, model, year, total hours and location. We provide an independent appraisal, prepare the records and marketing, and introduce your aircraft discreetly to qualified buyers.",
        link: { label: "Aircraft wanted", href: "/services/aircraft-wanted" },
      },
      {
        question: "Do you manage aircraft for owners?",
        answer:
          "Yes — maintenance coordination, crew management, regulatory compliance and financial reporting, plus charter programmes that can turn your aircraft's idle time into revenue.",
        link: { label: "Aviation consultancy", href: "/services/aviation-consultancy" },
      },
      {
        question: "Do you offer drone services?",
        answer:
          "Yes. Our unmanned aviation team supports aerial survey, mapping and inspection — from choosing the right platform to regulatory approvals and safe operations.",
        link: { label: "Unmanned aviation systems", href: "/services/unmanned-aviation-systems" },
      },
    ],
  },
];

/** The questions asked most often, for the home page. */
export const featuredFaqs = faqGroups.flatMap((group) => group.items).filter((item) => item.featured);
