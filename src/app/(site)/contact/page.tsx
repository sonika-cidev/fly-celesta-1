import type { Metadata } from "next";
import contactImage from "@/assets/images/services/acquisition.jpg";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { FormSection } from "@/components/sections/FormSection";
import { INQUIRY_TOPICS } from "@/lib/inquiry";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Fly Celesta in Bengaluru — call +91 91 88 03 7000, email connect@flycelesta.in or send us a message.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        label="Contact"
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
