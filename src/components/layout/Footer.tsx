import { Logo } from "@/components/brand/Logo";
import { LineRise } from "@/components/motion/LineRise";
import { Reveal } from "@/components/motion/Reveal";
import { Swoosh } from "@/components/motion/Swoosh";
import { Button } from "@/components/ui/Button";
import { navLinks, photoCredits, site } from "@/data/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.signoff}>
          <p className={styles.big} aria-label="Beyond horizons.">
            <LineRise lines={["Beyond", <em key="f">horizons.</em>]} />
          </p>
          <Reveal delay={0.2} className={styles.signoffAside}>
            <p>Charter, acquire, lease or manage — one call to the Fly Celesta desk.</p>
            <Button href="#request" variant="light">
              Request a charter
            </Button>
          </Reveal>
        </div>

        <Swoosh className={styles.swoosh} colorA="#dcc59b" colorB="rgba(243,239,231,0.5)" />

        <div className={styles.grid}>
          <div className={styles.brand}>
            <Logo variant="light" width={220} />
            <p>Charters, acquisitions, leasing and aircraft management across helicopter and fixed-wing operations.</p>
          </div>

          <nav className={styles.column} aria-label="Footer">
            <p className={styles.heading}>Explore</p>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#request">Request a Charter</a>
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
          <details className={styles.credits}>
            <summary>Photo credits</summary>
            <p>
              Photography via Wikimedia Commons:{" "}
              {photoCredits.map((c, i) => (
                <span key={c.subject}>
                  {c.subject} © {c.author} ({c.license}){i < photoCredits.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </details>
        </div>
      </div>
    </footer>
  );
}
