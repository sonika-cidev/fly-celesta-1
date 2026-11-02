import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { Faq } from "@/components/sections/Faq";
import { HelicopterServices } from "@/components/sections/HelicopterServices";
import { ServiceOverview } from "@/components/sections/ServiceOverview";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqsFor } from "@/data/faq";
import { findRegion, regions } from "@/data/regions";
import { pageMetadata, serviceSchema } from "@/lib/seo";

// Only the listed states have a page; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return regions.map((region) => ({ region: region.slug }));
}

export async function generateMetadata({ params }: PageProps<"/helicopter-services/[region]">): Promise<Metadata> {
  const region = findRegion((await params).region);
  if (!region) return {};
  return pageMetadata({
    ...region.seo,
    path: `/helicopter-services/${region.slug}`,
    image: { url: region.image.src, width: region.image.width, height: region.image.height, alt: region.imageAlt },
  });
}

/** "Helicopter services in <state>": a landing page for each state the company serves. */
export default async function RegionPage({ params }: PageProps<"/helicopter-services/[region]">) {
  const region = findRegion((await params).region);
  if (!region) notFound();
  const title = `Helicopter services in ${region.name}`;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Helicopter services", href: "/helicopter-services" }, { label: region.name }]}
        label={title}
        title={[region.heading[0], <em key="t">{region.heading[1]}</em>]}
        lede={region.summary}
        image={region.image}
        imageAlt={region.imageAlt}
      />
      <ServiceOverview service={{ title, details: region.details, offerings: region.offerings, places: region.places }} placesLabel={`Across ${region.name}`} />
      <HelicopterServices region={region.slug} />
      <Faq items={faqsFor(region.slug)} />
      <Charter />
      <JsonLd
        data={serviceSchema({ name: title, type: "Helicopter services", description: region.summary, path: `/helicopter-services/${region.slug}`, area: region.name })}
      />
    </>
  );
}
