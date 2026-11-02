import { Logo } from "@/components/brand/Logo";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Swoosh } from "@/components/motion/Swoosh";
import { ButtonInner, buttonClass } from "@/components/ui/Button";
import { RequestCharterLink } from "@/components/ui/RequestCharterLink";
import { RouteLink } from "@/components/ui/RouteLink";
import { REGION_PAGES, SERVICE_PAGES } from "@/data/navigation";
import { site } from "@/data/site";
import styles from "./Footer.module.css";

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "Company", href: "/about" },
  { label: "Career", href: "/about/career" },
  { label: "Fleet", href: "/fleet" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.signoff}>
          <p className={styles.big} aria-label="Beyond horizons.">
            <LineRise lines={["Beyond", <em key="f">horizons.</em>]} />
          </p>
          <Reveal delay={0.2} className={styles.signoffAside}>
            <p>Charter, buy, sell or consult — one call to the Fly Celesta desk.</p>
            <RequestCharterLink className={buttonClass("light")}>
              <ButtonInner>Request a charter</ButtonInner>
            </RequestCharterLink>
          </Reveal>
        </div>

        <Swoosh className={styles.swoosh} colorA="#dcc59b" colorB="rgba(243,239,231,0.5)" />

        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo variant="light" width={220} />
            <p>
              Helicopter services across Kerala, Karnataka and Tamil Nadu — private jets on rent, joyrides, shuttles, air
              ambulance and flower drops, plus helicopters and private jets for sale.
            </p>
          </div>

          <nav className={styles.column} aria-label="Services">
            <p className={styles.heading}>Services</p>
            {SERVICE_PAGES.map((service) => (
              <RouteLink key={service.slug} href={`/services/${service.slug}`}>
                {service.title}
              </RouteLink>
            ))}
          </nav>

          <nav className={styles.column} aria-label="Helicopter services">
            <p className={styles.heading}>Helicopter services</p>
            {REGION_PAGES.map((region) => (
              <RouteLink key={region.slug} href={`/helicopter-services/${region.slug}`}>
                Helicopter services in {region.name}
              </RouteLink>
            ))}
            <RouteLink href="/helicopter-services">All helicopter services</RouteLink>
          </nav>

          <nav className={styles.column} aria-label="Company">
            <p className={styles.heading}>Company</p>
            {companyLinks.map((link) => (
              <RouteLink key={link.href} href={link.href}>
                {link.label}
              </RouteLink>
            ))}
          </nav>

          <div className={styles.column}>
            <p className={styles.heading}>Contact</p>
            <a href={site.phoneHref}>{site.phone}</a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <address>
              {site.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} {site.legalName}. All rights reserved.
          </p>
          <p className={styles.credit}>
            Designed &amp; developed by{" "}
            <a href="https://www.conceptioni.com/" target="_blank" rel="noopener">
              Conception I Pvt Ltd
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
