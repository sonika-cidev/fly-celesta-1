import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RouteSync } from "@/components/layout/RouteSync";
import { MotionProvider } from "@/components/motion/MotionProvider";

/** Public website: smooth scrolling, header and footer around every page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <MotionProvider>
      <RouteSync />
      <Header />
      <main>{children}</main>
      <Footer />
    </MotionProvider>
  );
}
