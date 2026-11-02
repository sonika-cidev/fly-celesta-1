import type { Metadata } from "next";
import { notFound } from "next/navigation";
import jetCabin from "@/assets/images/services/jet-cabin.jpg";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { Faq } from "@/components/sections/Faq";
import { FormSection } from "@/components/sections/FormSection";
import { OtherServices } from "@/components/sections/OtherServices";
import { ServiceOverview } from "@/components/sections/ServiceOverview";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqsFor } from "@/data/faq";
import { findService, services } from "@/data/services";
import { INQUIRY_TOPICS } from "@/lib/inquiry";
import { pageMetadata, serviceSchemaFor } from "@/lib/seo";

// Only the listed services exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = findService((await params).slug);
  if (!service) return {};
  return pageMetadata({
    ...service.seo,
    path: `/services/${service.slug}`,
    image: { url: service.image.src, width: service.image.width, height: service.image.height, alt: service.imageAlt },
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = findService((await params).slug);
  if (!service) notFound();
  const { form } = service;
  const path = `/services/${service.slug}`;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
        label={service.label}
        title={[service.heading[0], <em key="t">{service.heading[1]}</em>]}
        lede={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
      />
      <ServiceOverview service={service} />
      <Faq items={faqsFor(service.slug)} current={path} />
      {form.kind === "charter" ? (
        <Charter />
      ) : (
        <FormSection
          id="enquire"
          label={form.label}
          title={[form.title[0], <em key="f">{form.title[1]}</em>]}
          lede={form.lede}
          image={jetCabin}
          imageAlt="Cream leather armchairs in the cabin of a business jet"
        >
          <InquiryForm topics={INQUIRY_TOPICS} defaultTopic={form.topic} />
        </FormSection>
      )}
      <OtherServices current={service.slug} />
      <JsonLd data={serviceSchemaFor(service)} />
    </>
  );
}
