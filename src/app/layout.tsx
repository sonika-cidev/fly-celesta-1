import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fly Celesta — Private Jet & Helicopter Charter",
  description:
    "Helicopter and private jet charters, aircraft acquisitions, leasing and management from Bengaluru, India. Fly Celesta — beyond horizons.",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <noscript>
          <style>{`[data-anim]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
