import type { Metadata } from "next";
import servicesHero from "@/assets/images/pages/services-hero.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { HelicopterServices } from "@/components/sections/HelicopterServices";
import { Services } from "@/components/sections/Services";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Helicopter & Private Jet Services",
  description:
    "Private jets on rent, helicopter charters, joyrides, shuttles, air ambulance and flower drops in Kerala, Karnataka & Tamil Nadu, plus aircraft sales.",
  path: "/services",
  keywords: ["helicopter services", "private jet services India", "private jet on rent", "helicopter charter", "aircraft sales"],
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        label="Helicopter & private jet services"
        title={["Every journey,", <em key="t">handled.</em>]}
        lede="Private jets on rent, helicopter charters, joyrides, shuttles, air ambulance and flower drops across Kerala, Karnataka and Tamil Nadu — plus aircraft sales, consultancy and unmanned aviation."
        image={servicesHero}
        imageAlt="Leonardo AW139 executive helicopter in flight"
      />
      <Services withHeading={false} />
      <HelicopterServices tone="paper" />
      <CtaBand
        label="Not sure where to start?"
        title={["Talk to", <em key="t">our team.</em>]}
        text="Tell us what you have in mind and we'll point you to the right service — or put together a tailored package."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Explore the fleet", href: "/fleet" }}
      />
    </>
  );
}
