// Site navigation, following the client's sitemap:
// Home · Services (5) · About (Company, Career) · Fleet (Business Jets, Helicopters, Turboprops) · Contact.
// Kept free of image imports because the header is a client component.

export type NavChild = { label: string; href: string; note: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const SERVICE_PAGES = [
  { slug: "charter-services", title: "Charter Services", note: "Helicopters · Private jets · Turboprops" },
  { slug: "aircraft-for-sale", title: "Aircraft For Sale", note: "Acquisitions · Brokerage · Finance" },
  { slug: "aircraft-wanted", title: "Aircraft Wanted", note: "Sell your aircraft · Appraisal" },
  { slug: "aviation-consultancy", title: "Aviation Consultancy", note: "Management · Advisory · Compliance" },
  { slug: "unmanned-aviation-systems", title: "Unmanned Aviation Systems", note: "Drones · Survey · Inspection" },
] as const;

export type ServiceSlug = (typeof SERVICE_PAGES)[number]["slug"];

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
    ],
  },
  {
    label: "Fleet",
    href: "/fleet",
    children: FLEET_SECTIONS.map((f) => ({ label: f.label, href: `/fleet#${f.id}`, note: f.note })),
  },
  { label: "Contact", href: "/contact" },
];
