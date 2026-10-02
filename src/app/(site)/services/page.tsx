import type { Metadata } from "next";
import servicesHero from "@/assets/images/pages/services-hero.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/sections/CtaBand";
import { Services } from "@/components/sections/Services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Charter services, aircraft for sale, aircraft wanted, aviation consultancy and unmanned aviation systems — premium aviation services from Fly Celesta.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
        label="Our services"
        title={["Every journey,", <em key="t">handled.</em>]}
        lede="Charters, aircraft sales and acquisitions, aviation consultancy and unmanned aviation systems — premium aviation services, tailored to your needs."
        image={servicesHero}
        imageAlt="Leonardo AW139 executive helicopter in flight"
      />
      <Services withHeading={false} />
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
