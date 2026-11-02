import type { Metadata } from "next";
import { Suspense } from "react";
import { About } from "@/components/sections/About";
import { Charter } from "@/components/sections/Charter";
import { Deals } from "@/components/sections/Deals";
import { Faq } from "@/components/sections/Faq";
import { Fleet } from "@/components/sections/Fleet";
import { HelicopterServices } from "@/components/sections/HelicopterServices";
import { Hero } from "@/components/sections/Hero";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Services } from "@/components/sections/Services";
import { JsonLd } from "@/components/seo/JsonLd";
import { featuredFaqs } from "@/data/faq";
import { organizationSchema, pageMetadata, websiteSchema } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Helicopter Services in Kerala, Karnataka & Tamil Nadu — Fly Celesta",
  absoluteTitle: true,
  description:
    "Helicopter services across Kerala, Karnataka & Tamil Nadu — private jets on rent, joyrides, shuttles, air ambulance, flower drops, helicopters & jets for sale.",
  path: "/",
  keywords: [
    "helicopter services in Kerala",
    "helicopter services in Karnataka",
    "helicopter services in Tamil Nadu",
    "private jet on rent",
    "helicopters for sale",
    "private jets for sale",
    "helicopter joyride",
    "helicopter shuttle",
    "air ambulance",
    "helicopter flower drop",
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd data={organizationSchema()} />
      <JsonLd data={websiteSchema()} />
      <Hero />
      <Services />
      <HelicopterServices />
      <About link={{ label: "More about the company", href: "/about" }} />
      <Fleet />
      <Deals />
      {/* Streams in after the rest of the page; shows nothing until articles are published */}
      <Suspense fallback={null}>
        <LatestPosts />
      </Suspense>
      <Faq items={featuredFaqs} />
      <Charter />
    </>
  );
}
