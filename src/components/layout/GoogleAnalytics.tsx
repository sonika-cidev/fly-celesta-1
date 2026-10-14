import Script from "next/script";

const MEASUREMENT_ID = "G-ZFBN8LBL5M";

/**
 * Google Analytics 4 (gtag.js) on the public pages, loaded after the page becomes interactive.
 * Production builds only, so local development visits aren't counted. Client-side navigations are
 * recorded by GA's enhanced measurement ("page changes based on browser history events").
 */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
