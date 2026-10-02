import type { Metadata } from "next";
import fleetHero from "@/assets/images/pages/fleet-hero.jpg";
import { PageHero } from "@/components/layout/PageHero";
import { Charter } from "@/components/sections/Charter";
import { FleetCatalogue } from "@/components/sections/FleetCatalogue";
import { fleet } from "@/data/fleet";

export const metadata: Metadata = {
  title: "Fleet",
  description: "Business jets, helicopters and turboprops available for charter — specifications for every aircraft in the Fly Celesta fleet.",
};

export default function FleetPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Fleet" }]}
        label="Aircraft fleet"
        title={["From rotor", <em key="t">to runway.</em>]}
        lede="From light helicopters to mid-size business jets — explore aircraft to suit every charter requirement."
        image={fleetHero}
        imageAlt="Sikorsky S-76 helicopter in front of a business jet on the apron"
      />
      <FleetCatalogue categories={fleet} />
      <Charter overlap />
    </>
  );
}
