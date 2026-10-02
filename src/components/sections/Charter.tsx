import clouds from "@/assets/images/h130-clouds.jpg";
import { CharterForm } from "@/components/forms/CharterForm";
import { FormSection } from "./FormSection";

/** "Plan your next flight" — the charter request form (home, charter services and fleet pages). */
export function Charter({ overlap = false }: { overlap?: boolean }) {
  return (
    <FormSection
      overlap={overlap}
      id="request"
      label="Request a charter"
      title={["Plan your", <em key="r">next flight.</em>]}
      lede="Share your itinerary and our charter desk will come back with tailored aircraft options and a quote."
      image={clouds}
      imageAlt="Airbus H130 helicopter in flight among the clouds"
      callLabel="Call the charter desk"
    >
      <CharterForm />
    </FormSection>
  );
}
