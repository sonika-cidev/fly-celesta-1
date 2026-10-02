import type { Metadata } from "next";
import eiger from "@/assets/images/about-eiger.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { About } from "@/components/sections/About";
import { CtaBand } from "@/components/sections/CtaBand";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Company",
  description: "Fly Celesta Private Limited — a Bengaluru-based aviation company. Our story, mission, vision and values.",
};

export default function CompanyPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }, { label: "Company" }]}
        label="About us"
        title={["Our", <em key="t">company.</em>]}
        lede={company.lede}
        image={eiger}
        imageAlt="Helicopter flying past the Eiger's north face at golden hour"
        imagePosition="50% 35%"
      />
      <About />
      <CtaBand
        label="Career"
        title={["Join", <em key="t">our team.</em>]}
        text="We're always keen to hear from aviators, engineers and client-service professionals who share our standards."
        primary={{ label: "Careers at Fly Celesta", href: "/about/career" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </>
  );
}
