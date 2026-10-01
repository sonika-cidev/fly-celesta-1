"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type MouseEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { navLinks, site } from "@/data/site";
import { glideTo } from "@/lib/scroll";
import styles from "./Header.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Freeze the page while the menu sheet is open
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  const goTo = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setOpen(false);
    if (!lenis) return;
    e.preventDefault();
    lenis.start();
    glideTo(lenis, href);
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${open ? styles.menuOpen : ""}`}>
      <div className={styles.bar}>
        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#top" className={styles.brand} aria-label="Fly Celesta — back to top">
          <Logo width={172} preload className={styles.logo} />
        </a>

        <div className={styles.actions}>
          <a href={site.phoneHref} className={styles.phone}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M6.6 2.8 4.4 3.3c-.8.2-1.3 1-1.2 1.8.9 6 5.3 10.4 11.3 11.3.8.1 1.6-.4 1.8-1.2l.5-2.2-3.3-1.6-1.6 1.7c-2.3-1-4.1-2.8-5-5.1l1.6-1.6z" />
            </svg>
            {site.phone}
          </a>
          <a href="#request" className={styles.cta}>
            Request a charter
          </a>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="menu-sheet"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-sheet"
            className={styles.sheet}
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            data-lenis-prevent
          >
            <nav className={styles.sheetNav} aria-label="Menu">
              {[...navLinks, { label: "Request a charter", href: "#request" }].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className={styles.sheetLink}
                  onClick={(e) => goTo(e, link.href)}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.06 }}
                >
                  <span className={styles.sheetIndex}>0{i + 1}</span>
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              className={styles.sheetContact}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <a href={site.phoneHref}>{site.phone}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
