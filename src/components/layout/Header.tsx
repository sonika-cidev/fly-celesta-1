"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { RequestCharterLink } from "@/components/ui/RequestCharterLink";
import { SmartLink } from "@/components/ui/SmartLink";
import { navigation, type NavItem } from "@/data/navigation";
import { site } from "@/data/site";
import { glideTo } from "@/lib/scroll";
import styles from "./Header.module.css";

const EASE = [0.22, 1, 0.36, 1] as const;

const Chevron = () => (
  <svg className={styles.chevron} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3.8 5 6.6l3-2.8" />
  </svg>
);

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The menu belongs to the page it was opened on, so it closes itself on navigation
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuPath(null);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [open, lenis]);

  const isActive = (item: NavItem) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

  // Menu-sheet links: close the sheet; a section on this page needs the scroller restarted first
  const onSheetLink = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuPath(null);
    const [path, hash] = href.split("#");
    if (path === "" || path === pathname) {
      e.preventDefault();
      lenis?.start();
      glideTo(lenis, hash ? `#${hash}` : "#top");
    }
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${open ? styles.menuOpen : ""}`}>
      <div className={styles.bar}>
        <nav className={styles.nav} aria-label="Primary">
          <ul className={styles.menu}>
            {navigation.map((item) => (
              <li key={item.label} className={styles.item}>
                <SmartLink href={item.href} className={styles.link} aria-current={isActive(item) ? "page" : undefined}>
                  {item.label}
                  {item.children && <Chevron />}
                </SmartLink>
                {item.children && (
                  <div className={styles.dropdown}>
                    <ul className={styles.dropdownList}>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <SmartLink href={child.href} className={styles.dropdownLink}>
                            <span className={`serif ${styles.dropdownLabel}`}>{child.label}</span>
                            <span className={styles.dropdownNote}>{child.note}</span>
                          </SmartLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <SmartLink href="/#top" className={styles.brand} aria-label="Fly Celesta — home">
          <Logo width={172} preload className={styles.logo} />
        </SmartLink>

        <div className={styles.actions}>
          <a href={site.phoneHref} className={styles.phone}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M6.6 2.8 4.4 3.3c-.8.2-1.3 1-1.2 1.8.9 6 5.3 10.4 11.3 11.3.8.1 1.6-.4 1.8-1.2l.5-2.2-3.3-1.6-1.6 1.7c-2.3-1-4.1-2.8-5-5.1l1.6-1.6z" />
            </svg>
            {site.phone}
          </a>
          <RequestCharterLink className={styles.cta}>Request a charter</RequestCharterLink>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="menu-sheet"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setMenuPath(open ? null : pathname)}
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
            <nav aria-label="Menu">
              <ul className={styles.sheetNav}>
                {navigation.map((item, i) => (
                  <motion.li
                    key={item.label}
                    className={styles.sheetItem}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.06 }}
                  >
                    <SmartLink
                      href={item.href}
                      className={styles.sheetLink}
                      aria-current={isActive(item) ? "page" : undefined}
                      onClick={(e) => onSheetLink(e, item.href)}
                    >
                      <span className={styles.sheetIndex}>0{i + 1}</span>
                      {item.label}
                    </SmartLink>
                    {item.children && (
                      <ul className={styles.sheetChildren}>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <SmartLink href={child.href} onClick={(e) => onSheetLink(e, child.href)}>
                              {child.label}
                            </SmartLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
                <motion.li
                  className={styles.sheetItem}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 + navigation.length * 0.06 }}
                >
                  <RequestCharterLink className={`${styles.sheetLink} ${styles.sheetCta}`} onNavigate={() => setMenuPath(null)}>
                    Request a charter
                  </RequestCharterLink>
                </motion.li>
              </ul>
            </nav>
            <motion.div className={styles.sheetContact} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>
              <a href={site.phoneHref}>{site.phone}</a>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
