import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { deals, formatInr } from "@/data/deals";
import { BookDeal } from "./BookDeal";
import styles from "./Deals.module.css";

/** Decorative barcode for the pass stub — deterministic bar widths per pass. */
function Barcode({ seed }: { seed: number }) {
  const bars = Array.from({ length: 34 }, (_, i) => 1 + ((i * 7 + seed * 13) % 5 === 0 ? 2 : (i + seed) % 3 === 0 ? 1 : 0));
  let x = 0;
  return (
    <svg className={styles.barcode} viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((w, i) => {
        const rect = <rect key={i} x={x} y="0" width={w} height="34" />;
        x += w + 1.6;
        return rect;
      })}
    </svg>
  );
}

export function Deals() {
  return (
    <section id="deals" className={styles.deals} aria-labelledby="deals-title">
      <div className="container">
        <SectionHeading
          id="deals-title"
          label="Aircraft charter deals"
          title={
            <>
              Special
              <br />
              <em>charter rates.</em>
            </>
          }
          intro={<p>Unbeatable special deals on aircraft charters — exceptional value for your next flight.</p>}
        />

        <ol className={styles.passes}>
          {deals.map((deal, i) => {
            const { aircraft } = deal;
            return (
              <Reveal as="li" key={aircraft.slug} delay={i * 0.1} className={styles.passItem}>
                <article className={styles.pass}>
                  <ImageReveal className={styles.photo} parallax={0} delay={0.1}>
                    <Image
                      src={aircraft.image}
                      alt={aircraft.imageAlt}
                      fill
                      sizes="(max-width: 860px) 100vw, 320px"
                      placeholder="blur"
                      className={styles.image}
                    />
                  </ImageReveal>

                  <div className={styles.main}>
                    <div className={styles.passHead}>
                      <span>Fly Celesta · Special deal</span>
                      <span className={styles.passNo}>FC-{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <p className={styles.type}>{deal.type}</p>
                    <h3 className={`serif ${styles.name}`}>{aircraft.name}</h3>
                    <dl className={styles.fields}>
                      <div>
                        <dt>Class</dt>
                        <dd>{aircraft.category}</dd>
                      </div>
                      <div>
                        <dt>Seats</dt>
                        <dd>{aircraft.passengers}</dd>
                      </div>
                      <div>
                        <dt>Cruise</dt>
                        <dd>{aircraft.cruise} km/h</dd>
                      </div>
                      <div>
                        <dt>Range</dt>
                        <dd>{aircraft.range.toLocaleString("en-IN")} km</dd>
                      </div>
                    </dl>
                  </div>

                  <div className={styles.perforation} aria-hidden="true" />

                  <div className={styles.stub}>
                    <p className={styles.rateLabel}>Charter rate</p>
                    <p className={`serif ${styles.rate}`}>
                      {formatInr(deal.hourlyRate)}
                      <span>per hour</span>
                    </p>
                    <BookDeal
                      className={styles.book}
                      prefill={{
                        aircraftType: deal.type,
                        note: `I'd like to book the ${aircraft.name} charter deal (${formatInr(deal.hourlyRate)} per hour).`,
                      }}
                    >
                      Book this deal
                    </BookDeal>
                    <Barcode seed={i + 1} />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
