import type { Metadata } from "next";
import contactImage from "@/assets/images/services/acquisition.jpg";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { FormSection } from "@/components/sections/FormSection";
import { site } from "@/data/site";
import { INQUIRY_TOPICS } from "@/lib/inquiry";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us — Book a Helicopter or Private Jet",
  description: `Book a helicopter or private jet: call ${site.phone}, email ${site.email} or send a message. Serving Kerala, Karnataka & Tamil Nadu from Bengaluru.`,
  path: "/contact",
  keywords: ["book a helicopter", "book a private jet", "helicopter booking Bengaluru", "Fly Celesta contact"],
});

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        label="Book a helicopter or private jet"
        title={["Get in", <em key="t">touch.</em>]}
        lede="Reach out to our team — we're here to help with charters, aircraft sales and every aviation enquiry."
      />
      <FormSection
        id="enquire"
        label="Send a message"
        title={["We'd love to", <em key="f">hear from you.</em>]}
        lede="Send us a message and a member of our team will reply personally."
        image={contactImage}
        imageAlt="Navy and gold AW109SP GrandNew helicopter in flight"
        directions
      >
        <InquiryForm topics={INQUIRY_TOPICS} defaultTopic="General enquiry" />
      </FormSection>
    </>
  );
}
