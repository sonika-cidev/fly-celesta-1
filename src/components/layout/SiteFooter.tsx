import { BlurFade } from "@/components/animation/BlurFade";
import { Logo } from "@/components/brand/Logo";
import { navLinks, photoCredits, site } from "@/data/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <BlurFade className={styles.brand}>
            <Logo width={260} />
            <p className={styles.blurb}>
              Charters, acquisitions, leasing and aircraft management across helicopter and fixed-wing operations.
            </p>
          </BlurFade>

          <BlurFade delay={0.1}>
            <nav className={styles.column} aria-label="Footer">
              <p className={styles.heading}>Explore</p>
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className={styles.link}>
                  {link.label}
                </a>
              ))}
              <a href="#request" className={styles.link}>
                Request a Charter
              </a>
            </nav>
          </BlurFade>

          <BlurFade delay={0.2} className={styles.column}>
            <p className={styles.heading}>Contact</p>
            <a href={site.phoneHref} className={styles.link}>
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className={styles.link}>
              {site.email}
            </a>
            <address className={styles.address}>
              {site.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </BlurFade>
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
