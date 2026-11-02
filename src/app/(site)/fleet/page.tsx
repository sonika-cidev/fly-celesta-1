import type { Metadata } from "next";
import fleetHero from "@/assets/images/pages/fleet-hero.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { FleetCatalogue } from "@/components/sections/FleetCatalogue";
import { fleet } from "@/data/fleet";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Private Jets, Helicopters & Turboprops for Charter",
  description:
    "Private jets on rent and helicopters for charter in South India — seats, speed and range for every business jet, helicopter and turboprop we fly.",
  path: "/fleet",
  keywords: ["private jet on rent", "helicopter for rent", "charter aircraft India", "business jet charter", "turboprop charter"],
});

export default function FleetPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Fleet" }]}
        label="Private jets & helicopters for charter"
        title={["From rotor", <em key="t">to runway.</em>]}
        lede="From light helicopters to mid-size private jets — explore the aircraft available on rent for every charter requirement."
        image={fleetHero}
        imageAlt="Sikorsky S-76 helicopter in front of a business jet on the apron"
      />
      <FleetCatalogue categories={fleet} />
      <Charter overlap />
    </>
  );
}
