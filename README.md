# Fly Celesta — Homepage (Theme 2: "Porcelain & Midnight")

Second design option for the Fly Celesta homepage, deployed separately from the first theme (`master`).
Same sections, content and functionality; an entirely different visual concept.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Concept

A light, editorial take on private aviation: porcelain surfaces, midnight ink and champagne accents drawn from the
logo; Cormorant Garamond (mixed case, gold italics) with Jost; rounded aircraft-window frames with a fine bezel; midnight
panels with rounded tops that slide over the sections before them; a floating glass header; boarding-pass deals.

## Sections

Banner (centred headline, scroll-widening cinematic photo) → Services (landscape window cards) → About
(story, mission & vision, values) → Fleet (filterable carousel of all 15 aircraft) → Charter Deals (boarding passes)
→ Request a Charter (form) → Footer.

## Structure

```
src/
  app/                  layout (fonts, metadata, motion provider), page, design tokens, icon
  app/actions/          charter-request.ts — server action behind the request form
  assets/               logo (colour + reversed) and photography
  components/
    motion/             MotionProvider (Lenis + reduced motion), Reveal, ImageReveal, LineRise, Swoosh
    brand/Logo          width-driven, never cropped
    layout/             Header (floating pill, menu sheet), Footer
    sections/           Hero, Services, About, Fleet, Deals, Charter (+ their client parts)
    ui/                 Button, SectionHeading
  data/                 site.ts, services.ts, fleet.ts, deals.ts — content shared with theme 1
  lib/                  charter.ts (fields, validation, prefill event) · scroll.ts (Lenis glide helpers)
```

Fleet cards ("Request this aircraft") and "Book this deal" buttons pre-fill the charter form. Aircraft photos sit
in landscape frames close to their own proportions, so no aircraft is cropped at the sides.

## Deploying (Vercel)

Set **`CHARTER_REQUEST_WEBHOOK_URL`** in the project's environment variables — the form POSTs each request there as
JSON (e.g. a Zapier/Make webhook that emails the charter desk). Without it, production shows visitors the phone
number and email instead of accepting the request, so nothing is silently lost.

## Before launch

- Mission and vision wording in `src/data/site.ts` was drafted from the current "Our Story" copy — confirm it.
- Fleet specifications are as published on flycelesta.in and indicative.
- Photography is from Wikimedia Commons (CC BY / CC BY-SA); keep the footer credits while it's used.
