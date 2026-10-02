import type { Metadata } from "next";
import { notFound } from "next/navigation";
import jetCabin from "@/assets/images/services/jet-cabin.jpg";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { FormSection } from "@/components/sections/FormSection";
import { OtherServices } from "@/components/sections/OtherServices";
import { ServiceOverview } from "@/components/sections/ServiceOverview";
import { findService, services } from "@/data/services";
import { INQUIRY_TOPICS } from "@/lib/inquiry";

// Only the five services exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const service = findService((await params).slug);
  return service ? { title: service.title, description: service.summary } : {};
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const service = findService((await params).slug);
  if (!service) notFound();
  const { form } = service;

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
        label="Services"
        title={[service.heading[0], <em key="t">{service.heading[1]}</em>]}
        lede={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
      />
      <ServiceOverview service={service} />
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
    </>
  );
}
