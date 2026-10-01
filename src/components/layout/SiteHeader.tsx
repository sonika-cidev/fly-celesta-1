"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState, type MouseEvent } from "react";
import { Magnetic } from "@/components/animation/Magnetic";
import { ScrollProgress } from "@/components/animation/ScrollProgress";
import { TextRollOnHover } from "@/components/animation/TextRoll";
import { Logo } from "@/components/brand/Logo";
import { navLinks } from "@/data/site";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Freeze the page (smooth scroll included) while the mobile drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [menuOpen, lenis]);

  const close = () => setMenuOpen(false);

  // Drawer links: restart scrolling first, then glide to the section
  const goTo = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    close();
    if (!lenis) return;
    e.preventDefault();
    lenis.start();
    lenis.scrollTo(href);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${menuOpen ? styles.open : ""}`}>
      <ScrollProgress />
      <div className={styles.bar}>
        <a href="#top" className={styles.brand} aria-label="Fly Celesta — back to top" onClick={close}>
          <Logo variant="light" width={210} preload className={styles.logo} />
        </a>

        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              <TextRollOnHover>{link.label}</TextRollOnHover>
            </a>
          ))}
          <Magnetic intensity={0.25} range={110}>
            <a href="#request" className={styles.enquire}>
              Request a Charter
            </a>
          </Magnetic>
        </nav>

        <button
          type="button"
          className={styles.toggle}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" className={styles.drawer} aria-hidden={!menuOpen} inert={!menuOpen} data-lenis-prevent>
        <nav className={styles.drawerNav} aria-label="Mobile">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.drawerLink}
              style={{ transitionDelay: menuOpen ? `${180 + i * 70}ms` : "0ms" }}
              onClick={(e) => goTo(e, link.href)}
            >
              <span className={styles.drawerIndex}>0{i + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <a href="#request" className={styles.drawerCta} onClick={(e) => goTo(e, "#request")}>
          Request a Charter →
        </a>
      </div>
    </header>
  );
}
