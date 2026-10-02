"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { syncLenis } from "@/lib/scroll";

/** After a page change, re-measure the page and align Lenis with the scroll position Next.js set. */
export function RouteSync() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const frame = requestAnimationFrame(() => {
      lenis.resize();
      syncLenis(lenis);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return null;
}
