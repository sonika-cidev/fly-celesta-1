// Site navigation, following the client's sitemap:
// Home · Services (9) · About (Company, Career, FAQs) · Fleet (Business Jets, Helicopters, Turboprops) · Blog · Contact.
// Kept free of image imports because the header is a client component.

export type NavChild = { label: string; href: string; note: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

// "helicopter": the specialist helicopter services, shown together on the home and services pages.
export const SERVICE_PAGES = [
  { slug: "charter-services", title: "Charter Services", note: "Private jets on rent · Helicopters · Turboprops", group: "core" },
  { slug: "helicopter-joyrides", title: "Helicopter Joyrides", note: "Scenic flights · Kerala · Tamil Nadu", group: "helicopter" },
  { slug: "helicopter-shuttles", title: "Helicopter Shuttles", note: "Airports · Resorts · Events", group: "helicopter" },
  { slug: "air-ambulance", title: "Air Ambulance", note: "Helicopter & jet patient transfers", group: "helicopter" },
  { slug: "helicopter-flower-drop", title: "Flower Drops", note: "Weddings · Temple festivals · Events", group: "helicopter" },
  { slug: "aircraft-for-sale", title: "Aircraft For Sale", note: "Helicopters · Private jets · Turboprops", group: "core" },
  { slug: "aircraft-wanted", title: "Aircraft Wanted", note: "Sell your aircraft · Appraisal", group: "core" },
  { slug: "aviation-consultancy", title: "Aviation Consultancy", note: "Management · Advisory · Compliance", group: "core" },
  { slug: "unmanned-aviation-systems", title: "Unmanned Aviation Systems", note: "Drones · Survey · Inspection", group: "core" },
] as const;

export type ServiceSlug = (typeof SERVICE_PAGES)[number]["slug"];

/** States with their own "Helicopter services in …" page (/helicopter-services/<slug>). */
export const REGION_PAGES = [
  { slug: "kerala", name: "Kerala" },
  { slug: "karnataka", name: "Karnataka" },
  { slug: "tamil-nadu", name: "Tamil Nadu" },
] as const;

export type RegionSlug = (typeof REGION_PAGES)[number]["slug"];

export const FLEET_SECTIONS = [
  { id: "business-jets", label: "Business Jets", note: "Light and mid-size jets" },
  { id: "helicopters", label: "Helicopters", note: "Single and twin-engine" },
  { id: "turboprops", label: "Turboprops", note: "Twin-turboprop comfort" },
] as const;

export const navigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: SERVICE_PAGES.map((s) => ({ label: s.title, href: `/services/${s.slug}`, note: s.note })),
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Company", href: "/about", note: "Our story, mission and values" },
      { label: "Career", href: "/about/career", note: "Join the Fly Celesta team" },
      { label: "FAQs", href: "/faq", note: "Answers to common questions" },
    ],
  },
  {
    label: "Fleet",
    href: "/fleet",
    children: FLEET_SECTIONS.map((f) => ({ label: f.label, href: `/fleet#${f.id}`, note: f.note })),
  },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];
