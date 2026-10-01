import type { Metadata, Viewport } from "next";
import { Italiana, Manrope } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { MotionProvider } from "@/components/animation/MotionProvider";

const italiana = Italiana({
  variable: "--font-italiana",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fly Celesta — Private Jet & Helicopter Charter",
  description:
    "Helicopter and private jet charters, aircraft acquisitions, leasing and management from Bengaluru, India. Fly Celesta — beyond horizons.",
};

export const viewport: Viewport = {
  themeColor: "#061733",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${italiana.variable} ${manrope.variable}`}>
      <head>
        <noscript>
          <style>{`[data-anim]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
