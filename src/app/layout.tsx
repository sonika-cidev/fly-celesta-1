import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { site } from "@/data/site";
import { DEFAULT_SHARE_IMAGE } from "@/lib/seo";
import "lenis/dist/lenis.css";
import "./globals.css";

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

// Defaults for every page; each public page sets its own title, description and canonical address (lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Helicopter Services in Kerala, Karnataka & Tamil Nadu — Fly Celesta",
    template: "%s — Fly Celesta",
  },
  description:
    "Helicopter services across Kerala, Karnataka and Tamil Nadu — private jets on rent, joyrides, shuttles, air ambulance and flower drops, plus helicopters and private jets for sale.",
  applicationName: site.name,
  authors: [{ name: site.legalName, url: site.url }],
  publisher: site.legalName,
  category: "travel",
  openGraph: { type: "website", siteName: site.name, locale: "en_IN", images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <noscript>
          <style>{`[data-anim]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
      </head>
      {/* Browser extensions (Grammarly, password managers) add attributes to <body> before React hydrates.
          This only ignores <body>'s own attributes; everything inside it is still checked. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
