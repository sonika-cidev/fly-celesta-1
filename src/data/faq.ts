import { site } from "./site";

// Frequently asked questions. Drafted from the services and company copy and general charter practice —
// confirm the answers with the client before launch.

export type FaqItem = {
  question: string;
  answer: string;
  link?: { label: string; href: string };
  /** Also shown in the FAQ section on the home page. */
  featured?: true;
  /** Also shown on these pages: a service slug, a state slug, or "helicopter-services" (the hub page). */
  pages?: string[];
};

export type FaqGroup = { id: string; title: string; items: FaqItem[] };

const charterForm = { label: "Request a charter", href: "/services/charter-services#request" };
const STATES = ["kerala", "karnataka", "tamil-nadu"];
const FLIGHTS = ["charter-services", "helicopter-joyrides", "helicopter-shuttles", "helicopter-services", ...STATES];

export const faqGroups: FaqGroup[] = [
  {
    id: "booking",
    title: "Booking a charter",
    items: [
      {
        question: "How do I book a private jet or helicopter charter?",
        answer: `Send us your route, travel dates and number of passengers with the charter request form, or call the charter desk on ${site.phone}. We'll come back with suitable aircraft options and a tailored quote — once you confirm, we take care of the rest.`,
        link: charterForm,
        featured: true,
        pages: ["charter-services", "helicopter-shuttles"],
      },
      {
        question: "How far in advance should I book?",
        answer:
          "As early as you can, especially around holidays, festivals and long weekends. We also handle short-notice requests: availability depends on the aircraft, the crew and any permissions your route needs, so call us and we'll tell you what's possible.",
        featured: true,
        pages: FLIGHTS,
      },
      {
        question: "How is the price of a charter worked out?",
        answer:
          "Every quote is tailored to your trip. It depends mainly on the aircraft, the flying time, positioning the aircraft to your departure point, waiting time, and airport or helipad charges. We explain what's included before you confirm.",
        featured: true,
        pages: ["charter-services", "helicopter-joyrides", "helicopter-shuttles", "helicopter-flower-drop"],
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
        question: "Do you offer helicopter services in Kerala, Karnataka and Tamil Nadu?",
        answer:
          "Yes. We're based in Bengaluru and arrange helicopter charters, joyrides, shuttles, air ambulance flights and flower drops across Kerala, Karnataka and Tamil Nadu — and private jets on rent to anywhere in India, Nepal and beyond.",
        link: { label: "Helicopter services", href: "/helicopter-services" },
        featured: true,
        pages: ["helicopter-services", ...STATES],
      },
    ],
  },
  {
    id: "helicopter",
    title: "Helicopter services",
    items: [
      {
        question: "How long is a helicopter joyride, and how many people can fly?",
        answer:
          "Joyrides range from a short scenic loop to a longer flight over the places you choose. The helicopters we use typically seat four to six passengers; we'll suggest the aircraft and route for your group, location and budget.",
        link: { label: "Helicopter joyrides", href: "/services/helicopter-joyrides" },
        pages: ["helicopter-joyrides", "helicopter-services", "kerala", "tamil-nadu"],
      },
      {
        question: "What does a helicopter flower drop need?",
        answer:
          "The date, the time and the exact location; the flowers (usually loose petals); and permissions from the aviation authorities and the local administration, which we arrange. Plan as early as you can, especially for temple festivals and weddings in peak season.",
        link: { label: "Flower drops", href: "/services/helicopter-flower-drop" },
        pages: ["helicopter-flower-drop", "helicopter-services", ...STATES],
      },
      {
        question: "How does a helicopter shuttle work?",
        answer:
          "The helicopter flies back and forth between two or more points — an airport, a resort and a venue, for example — on a timetable built around your event, with passengers coordinated at each end.",
        link: { label: "Helicopter shuttles", href: "/services/helicopter-shuttles" },
        pages: ["helicopter-shuttles", "helicopter-services"],
      },
      {
        question: "How quickly can an air ambulance be arranged?",
        answer: `As quickly as the aircraft, the crew, the weather and airport or helipad permissions allow — call us on ${site.phone} so we can start straight away. Have the patient's condition, the hospitals at both ends and the treating doctor's contact ready.`,
        link: { label: "Air ambulance", href: "/services/air-ambulance" },
        pages: ["air-ambulance", "helicopter-services"],
      },
      {
        question: "Can I rent a private jet for a day trip?",
        answer:
          "Yes. Private jets can be rented one way, for a same-day return or for a multi-city tour. You fly on your schedule and the aircraft waits for you; the quote covers the flying, the waiting time and the airport charges.",
        link: { label: "Private jet charter", href: "/services/charter-services" },
        pages: ["charter-services"],
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
        pages: ["charter-services"],
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
        pages: ["helicopter-joyrides", "helicopter-shuttles", "helicopter-flower-drop", "helicopter-services", ...STATES],
      },
      {
        question: "Is flying with Fly Celesta safe?",
        answer:
          "Safety comes first on every flight. Our team includes ex-military aviators and civil aviation veterans, and every flight is planned to the highest standards of safety and reliability.",
        featured: true,
        pages: ["helicopter-joyrides"],
      },
      {
        question: "Do you arrange medical evacuation flights?",
        answer: `Yes — air ambulance flights by helicopter and jet are part of our services. For an urgent request, call the charter desk directly on ${site.phone}.`,
        link: { label: "Air ambulance", href: "/services/air-ambulance" },
        pages: ["air-ambulance"],
      },
    ],
  },
  {
    id: "aircraft",
    title: "Aircraft sales & services",
    items: [
      {
        question: "Can you help me buy a helicopter or private jet?",
        answer:
          "Yes. As your advisor and buyer's advocate, we shortlist suitable new and pre-owned helicopters, turboprops and business jets for sale, then handle valuation, negotiation, due diligence and pre-purchase inspection through to delivery.",
        link: { label: "Helicopters & private jets for sale", href: "/services/aircraft-for-sale" },
        pages: ["aircraft-for-sale"],
      },
      {
        question: "How do I sell my aircraft through you?",
        answer:
          "Tell us the make, model, year, total hours and location. We provide an independent appraisal, prepare the records and marketing, and introduce your aircraft discreetly to qualified buyers.",
        link: { label: "Aircraft wanted", href: "/services/aircraft-wanted" },
        pages: ["aircraft-wanted", "aircraft-for-sale"],
      },
      {
        question: "Do you manage aircraft for owners?",
        answer:
          "Yes — maintenance coordination, crew management, regulatory compliance and financial reporting, plus charter programmes that can turn your aircraft's idle time into revenue.",
        link: { label: "Aviation consultancy", href: "/services/aviation-consultancy" },
        pages: ["aviation-consultancy", "aircraft-wanted"],
      },
      {
        question: "Do you offer drone services?",
        answer:
          "Yes. Our unmanned aviation team supports aerial survey, mapping and inspection — from choosing the right platform to regulatory approvals and safe operations.",
        link: { label: "Unmanned aviation systems", href: "/services/unmanned-aviation-systems" },
        pages: ["unmanned-aviation-systems"],
      },
    ],
  },
];

const allFaqs = faqGroups.flatMap((group) => group.items);

/** The questions asked most often, for the home page. */
export const featuredFaqs = allFaqs.filter((item) => item.featured);

/** The questions for a service, state or hub page. */
export const faqsFor = (page: string) => allFaqs.filter((item) => item.pages?.includes(page));
