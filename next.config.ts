import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-hosting (DirectAdmin/cPanel Node.js app): `next build` writes a self-contained server to .next/standalone
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  // svg-captcha reads its font file from disk at runtime, so it must not be bundled (mysql2 is loaded as-is too)…
  serverExternalPackages: ["svg-captcha", "mysql2"],
  // …and the font has to ship with the function that draws the questions.
  outputFileTracingIncludes: {
    "/api/captcha": ["./node_modules/svg-captcha/fonts/**/*"],
  },
  // The development file store (.data/) holds local test inquiries and a signing key; never ship it.
  outputFileTracingExcludes: {
    "/*": ["./.data/**/*"],
  },
};

export default nextConfig;
