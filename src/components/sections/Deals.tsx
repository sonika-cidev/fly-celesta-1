import Image from "next/image";
import { BlurFade } from "@/components/animation/BlurFade";
import { MagicCard } from "@/components/animation/MagicCard";
import { NumberTicker } from "@/components/animation/NumberTicker";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Figures } from "@/components/ui/Figures";
import { RevealTitle } from "@/components/ui/RevealTitle";
import { deals, formatInr } from "@/data/deals";
import { PrefillLink } from "./PrefillLink";
import styles from "./Deals.module.css";

export function Deals() {
  return (
    <section id="deals" className={styles.deals} aria-labelledby="deals-title">
      <div className="container">
        <div className={styles.head}>
          <div>
            <BlurFade>
              <Eyebrow>Aircraft charter deals</Eyebrow>
            </BlurFade>
            <RevealTitle id="deals-title" className={styles.title} lines={["Special"]} accent="charter rates." />
          </div>
          <BlurFade delay={0.2} className={styles.intro}>
            <p>Unbeatable special deals on aircraft charters — exceptional value for your next flight.</p>
          </BlurFade>
        </div>

        <div className={styles.grid}>
          {deals.map((deal, i) => {
            const { aircraft } = deal;
            return (
              <BlurFade key={aircraft.slug} delay={i * 0.14} offset={48} blur="6px" duration={1.1}>
                <article className={styles.card}>
                  {/* Gold rim and spotlight follow the pointer */}
                  <MagicCard
                    className={styles.surface}
                    contentClassName={styles.inner}
                    gradientSize={340}
                    gradientColor="rgba(201, 164, 93, 0.13)"
                    gradientFrom="rgba(240, 220, 169, 0.95)"
                    gradientTo="rgba(201, 164, 93, 0.3)"
                    background="#081a37"
                    borderColor="rgba(255, 255, 255, 0.12)"
                  >
                    <div className={styles.media}>
                      <Image
                        src={aircraft.image}
                        alt={aircraft.imageAlt}
                        fill
                        sizes="(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        placeholder="blur"
                        className={styles.image}
                      />
                      <span className={styles.badge}>Special deal</span>
                    </div>

                    <div className={styles.body}>
                      <p className={styles.type}>{deal.type}</p>
                      <h3 className={styles.name}>
                        <Figures>{aircraft.name}</Figures>
                      </h3>
                      <ul className={styles.facts}>
                        <li>{aircraft.passengers} passengers</li>
                        <li>{aircraft.cruise} km/h</li>
                        <li>{aircraft.range.toLocaleString("en-IN")} km</li>
                      </ul>

                      <div className={styles.price}>
                        <span className={styles.priceLabel}>Charter rate</span>
                        <p className={styles.priceValue}>
                          <span className="visually-hidden">{formatInr(deal.hourlyRate)} per hour</span>
                          <span aria-hidden="true">
                            ₹<NumberTicker value={deal.hourlyRate} locale="en-IN" duration={2.2} delay={0.2 + i * 0.12} className={styles.digits} />
                          </span>
                          <span className={styles.per} aria-hidden="true">
                            / hour
                          </span>
                        </p>
                      </div>

                      <PrefillLink
                        className={styles.cta}
                        detail={{ aircraftType: deal.type, aircraft: aircraft.name, rate: formatInr(deal.hourlyRate) }}
                      >
                        <span>Book this deal</span>
                        <span className={styles.ctaArrow} aria-hidden="true">
                          →
                        </span>
                      </PrefillLink>
                    </div>
                  </MagicCard>
                </article>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
