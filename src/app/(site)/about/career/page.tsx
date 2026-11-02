import type { Metadata } from "next";
import careerHero from "@/assets/images/pages/career.jpg";
import clouds from "@/assets/images/h130-clouds.jpg";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { PageHero } from "@/components/layout/PageHero";
import { ValueCards } from "@/components/sections/About";
import { FormSection } from "@/components/sections/FormSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { career } from "@/data/site";
import { pageMetadata } from "@/lib/seo";
import styles from "./career.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Careers in Aviation, Bengaluru",
  description:
    "Aviation careers at Fly Celesta, Bengaluru — work alongside ex-military aviators and civil aviation professionals on helicopter and private jet operations.",
  path: "/about/career",
  keywords: ["aviation jobs Bengaluru", "helicopter pilot jobs", "aviation careers India"],
});

export default function CareerPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Career" }]}
        label="Aviation careers · Bengaluru"
        title={["Build your career", <em key="t">in the skies.</em>]}
        lede={career.lede}
        image={careerHero}
        imageAlt="View from a helicopter cockpit over a city skyline at dusk"
      />

      <section className={styles.why} aria-labelledby="why-title">
        <div className="container">
          <SectionHeading
            id="why-title"
            label="Why Fly Celesta"
            title={
              <>
                A team built
                <br />
                <em>on experience.</em>
              </>
            }
            intro={<p>What it means to work with us — and what we look for in the people who join.</p>}
          />
        </div>
        <ValueCards items={career.reasons} label="Why Fly Celesta" />
      </section>

      <FormSection
        id="apply"
        label="Apply"
        title={["Send your", <em key="f">application.</em>]}
        lede="Tell us about your experience and the role you're interested in, with a link to your CV or LinkedIn profile."
        image={clouds}
        imageAlt="Airbus H130 helicopter in flight among the clouds"
      >
        <InquiryForm
          topics={["Careers"]}
          firstStep="Your application"
          submitLabel="Send application"
          successText="Thank you for your application. Our team will review it and be in touch if there’s a suitable opportunity."
        />
      </FormSection>
    </>
  );
}
