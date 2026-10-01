# Fly Celesta — Homepage

Homepage for Fly Celesta Private Limited (private jet & helicopter charter, acquisitions, leasing and aircraft
management), built with Next.js 16 (App Router), TypeScript, CSS Modules, Motion and Lenis.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Sections

Banner → Services → About (mission & vision) → Fleet → Charter Deals → Request a Charter (form).
Copy, fleet specifications, deal rates and contact details come from the current flycelesta.in site.

## Structure

```
src/
  app/                  layout (fonts, metadata, motion provider), page, global tokens, icon
  app/actions/          charter-request.ts — server action behind the request form
  assets/brand/         logo.png (full colour) · logo-light.png (reversed, for dark backgrounds)
  assets/images/        hero, about, services/*, fleet/* (statically imported → AVIF/WebP + blur-up)
  components/
    animation/          motion primitives (see "Animation" below)
    brand/Logo          width-driven, never cropped (height follows the native aspect ratio)
    layout/             SiteHeader (sticky, scroll progress, mobile drawer) · SiteFooter
    sections/           Hero, Services + ServiceStack, About, Fleet + FleetShowcase, Deals, CharterRequest + CharterForm
    ui/                 Button, Eyebrow, Marquee, RevealTitle, Figures
  data/                 site.ts (contact, nav, about copy, photo credits) · services.ts · fleet.ts · deals.ts
  lib/charter.ts        form field names, validation and types shared by the form and the server action
```

Content lives in `src/data/`, so services, aircraft and deals can be changed without touching components.
Design tokens (navy, gold, ivory, easing, spacing) are CSS variables in `src/app/globals.css`.

## Animation

Adapted from 21st.dev components (MIT — see `THIRD_PARTY_NOTICES.md`), restyled with CSS Modules:
Vertical Cut Reveal (headings), Blur Fade (scroll-in), Text Reveal (scroll-lit statement), Number Ticker (deal rates),
Magic Card (card spotlight), Border Beam (mission/vision), Magnetic (CTAs), Text Roll (nav hover) and Scroll Progress.
Services use sticky stacking cards (each card pins and the next slides over it; covered cards recede and dim) —
on screens shorter than ~720px they fall back to a normal list.
Lenis provides smooth scrolling and animated anchor links. All motion respects `prefers-reduced-motion`.

## Request-a-charter form

The form validates on the client and again in `src/app/actions/charter-request.ts`, then POSTs the request as JSON to
the URL in **`CHARTER_REQUEST_WEBHOOK_URL`** (for example a Zapier/Make webhook that emails the charter desk or
creates a CRM lead). Set it in the hosting environment or `.env.local`:

```bash
CHARTER_REQUEST_WEBHOOK_URL=https://hooks.example.com/charter-requests
```

Without it, development logs the request to the server console and shows the success state; production shows the
visitor a message to call or email instead, so no request is silently lost.

## Before launch

- **Mission and vision** wording in `src/data/site.ts` was drafted from the current "Our Story" copy — confirm it.
- **Fleet specifications** are as published on flycelesta.in and indicative; confirm per available airframe.
- **Photography** comes from Wikimedia Commons under CC BY / CC BY-SA licences. The footer credits are required while
  these images are used; replace them with owned photography when available and update `photoCredits`.
