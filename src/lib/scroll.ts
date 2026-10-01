import type Lenis from "lenis";

/**
 * Re-align Lenis with the real scroll position. A native scroll (keyboard, scrollbar,
 * scrollIntoView) may have happened since Lenis's last frame; without this, a glide
 * started in the same frame is computed from a stale position and lands off-target.
 */
export function syncLenis(lenis?: Lenis) {
  if (lenis && Math.abs(lenis.animatedScroll - window.scrollY) > 1) {
    lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  }
}

/** Smoothly scroll to a section (falls back to native smooth scrolling without Lenis). */
export function glideTo(lenis: Lenis | undefined, selector: string) {
  if (!lenis) {
    document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
    return;
  }
  syncLenis(lenis);
  lenis.scrollTo(selector);
}
