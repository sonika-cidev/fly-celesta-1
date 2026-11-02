import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/motion/Reveal";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqList } from "@/components/sections/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqGroups } from "@/data/faq";
import { pageMetadata } from "@/lib/seo";
import styles from "./faq.module.css";

export const metadata: Metadata = pageMetadata({
  title: "FAQs — Helicopter & Private Jet Charter",
  description:
    "Answers about renting a private jet, helicopter joyrides, shuttles, air ambulance and flower drops in South India, and buying or selling a helicopter or jet.",
  path: "/faq",
  keywords: ["helicopter charter FAQ", "private jet rental questions", "helicopter joyride FAQ", "air ambulance FAQ"],
});

export default function FaqPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        label="Helicopter & private jet FAQs"
        title={["Questions,", <em key="t">answered.</em>]}
        lede="Everything you need to know about renting a private jet or helicopter, our helicopter services across South India, and buying, selling or managing an aircraft."
      />

      <section className={styles.faq} aria-label="Frequently asked questions">
        <div className={`container ${styles.layout}`}>
          <Reveal className={styles.toc}>
            <nav aria-label="FAQ topics">
              <p className={styles.tocLabel}>Topics</p>
              <ul>
                {faqGroups.map((group) => (
                  <li key={group.id}>
                    <a href={`#${group.id}`}>{group.title}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <div className={styles.groups}>
            {faqGroups.map((group) => (
              <section key={group.id} id={group.id} className={styles.group} aria-labelledby={`${group.id}-title`}>
                <Reveal y={14}>
                  <h2 id={`${group.id}-title`} className={`serif ${styles.groupTitle}`}>
                    {group.title}
                  </h2>
                </Reveal>
                <FaqList items={group.items} />
              </section>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        label="Still have a question?"
        title={["Talk to", <em key="t">our team.</em>]}
        text="Call the Fly Celesta desk or send us a message — a member of the team will reply personally."
        primary={{ label: "Contact us", href: "/contact" }}
        secondary={{ label: "Request a charter", href: "/services/charter-services#request" }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqGroups
            .flatMap((group) => group.items)
            .map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
        }}
      />
    </>
  );
}
