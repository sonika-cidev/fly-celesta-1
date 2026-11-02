import type { Metadata } from "next";
import logo from "@/assets/brand/logo.png";
import shareImage from "@/assets/images/og-default.jpg";
import { services, type Service } from "@/data/services";
import { site } from "@/data/site";

// Search and sharing metadata, and structured data (schema.org JSON-LD), for the public pages.

/** Used for links to pages without an image of their own (1200 × 630). */
export const DEFAULT_SHARE_IMAGE = {
  url: shareImage.src,
  width: shareImage.width,
  height: shareImage.height,
  alt: "Fly Celesta — helicopter and private jet services in South India",
};

type ShareImage = { url: string; width?: number; height?: number; alt?: string };

type PageSeo = {
  /** Shown before " — Fly Celesta"; keep it under about 50 characters. */
  title: string;
  /** About 150–160 characters, with the page's main search phrase early on. */
  description: string;
  /** The page's own address, e.g. /services/air-ambulance (made absolute with the site address). */
  path: string;
  keywords?: string[];
  image?: ShareImage;
  /** Use the title exactly as given (the home page). */
  absoluteTitle?: boolean;
};

/** Title, description, canonical address and social-sharing tags for a page. */
export function pageMetadata({ title, description, path, keywords, image = DEFAULT_SHARE_IMAGE, absoluteTitle = false }: PageSeo): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: "en_IN", url: path, title: fullTitle, description, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}

export const absoluteUrl = (path: string) => new URL(path, site.url).toString();

const ORGANIZATION_ID = `${site.url}/#organization`;

const areaServed = [...site.states.map((name) => ({ "@type": "State", name })), { "@type": "Country", name: "India" }];

const provider = { "@type": "LocalBusiness", "@id": ORGANIZATION_ID, name: site.name, url: site.url };

/** The company as a local business: name, address, phone, areas served and services (home page). */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": ORGANIZATION_ID,
    name: site.name,
    legalName: site.legalName,
    slogan: site.tagline,
    url: site.url,
    logo: absoluteUrl(logo.src),
    image: absoluteUrl(shareImage.src),
    description:
      "Helicopter services across Kerala, Karnataka and Tamil Nadu — private jets on rent, helicopter charters, joyrides, shuttles, air ambulance and flower drops — plus helicopters and private jets for sale.",
    telephone: site.phoneHref.replace(/^tel:/, ""),
    email: site.email,
    address: { "@type": "PostalAddress", ...site.postalAddress },
    areaServed,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Aviation services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: service.title, url: absoluteUrl(`/services/${service.slug}`) },
      })),
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: "en-IN",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** A service page (or a regional helicopter-services page) as a schema.org Service. */
export function serviceSchema({ name, type, description, path, area }: { name: string; type: string; description: string; path: string; area?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: type,
    description,
    url: absoluteUrl(path),
    provider,
    areaServed: area ? { "@type": "State", name: area } : areaServed,
  };
}

export const serviceSchemaFor = (service: Service) =>
  serviceSchema({ name: service.seo.title, type: service.title, description: service.summary, path: `/services/${service.slug}` });

/** The breadcrumb trail as search engines read it. Steps without a page of their own are left out (except the last). */
export function breadcrumbSchema(crumbs: { label: string; href?: string }[]) {
  const steps = crumbs.filter((crumb, i) => crumb.href || i === crumbs.length - 1);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: steps.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}
