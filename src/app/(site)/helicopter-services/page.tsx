import type { Metadata } from "next";
import h125 from "@/assets/images/fleet/h125.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { Faq } from "@/components/sections/Faq";
import { HelicopterServices } from "@/components/sections/HelicopterServices";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqsFor } from "@/data/faq";
import { pageMetadata, serviceSchema } from "@/lib/seo";

const DESCRIPTION =
  "Helicopter services in Kerala, Karnataka and Tamil Nadu — charters, joyrides, shuttles, air ambulance and flower drops, planned by Fly Celesta in Bengaluru.";

export const metadata: Metadata = pageMetadata({
  title: "Helicopter Services in South India",
  description: DESCRIPTION,
  path: "/helicopter-services",
  keywords: ["helicopter services", "helicopter services in Kerala", "helicopter services in Karnataka", "helicopter services in Tamil Nadu", "helicopter rental South India"],
});

/** Hub for the helicopter services and the state pages. */
export default function HelicopterServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Helicopter services" }]}
        label="Helicopter services · Kerala · Karnataka · Tamil Nadu"
        title={["Helicopter", <em key="t">services.</em>]}
        lede="Charters, scenic joyrides, guest shuttles, air ambulance flights and flower drops across Kerala, Karnataka and Tamil Nadu — planned, permitted and flown by our team."
        image={h125}
        imageAlt="Airbus H125 helicopter flying over snowy mountains"
      />
      <HelicopterServices withHeading={false} />
      <Faq items={faqsFor("helicopter-services")} />
      <Charter />
      <JsonLd data={serviceSchema({ name: "Helicopter services in South India", type: "Helicopter services", description: DESCRIPTION, path: "/helicopter-services" })} />
    </>
  );
}
