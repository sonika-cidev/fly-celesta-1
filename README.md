# Fly Celesta — Website (Theme 2: "Porcelain & Midnight")

Fly Celesta's website, built with Next.js 16 (App Router), TypeScript, CSS Modules, Motion and Lenis.
This branch (`second-theme`) is the client-approved design; `master` holds the alternative theme.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Pages

Follows the client's sitemap:

| Page | Route |
| --- | --- |
| Home | `/` — hero, services, about, fleet carousel, charter deals, charter request form |
| Services | `/services` and one page per service: `/services/charter-services`, `/aircraft-for-sale`, `/aircraft-wanted`, `/aviation-consultancy`, `/unmanned-aviation-systems` |
| About | `/about` (Company) and `/about/career` (Career) |
| Fleet | `/fleet` — Business Jets, Helicopters and Turboprops (`#business-jets`, `#helicopters`, `#turboprops`) |
| Contact | `/contact` |
| Inquiry inbox (private) | `/admin` |

## Forms, CAPTCHA and the inquiry inbox

- **Charter request form** — home, Charter Services and Fleet pages. Fleet cards and "Book this deal" pre-fill it.
- **Enquiry form** — Contact, the other four service pages (topic pre-selected) and Career (applications).
- **CAPTCHA** — every form asks a simple sum ("5 + 4 = ?"). The question is drawn on our own server by
  [svg-captcha](https://github.com/produck/svg-captcha) (MIT) at `/api/captcha` — no third-party service. The answer
  never reaches the browser: the form receives a signed token, the server checks the answer on submit, and each question
  can be tried only once (expires after 30 minutes). A wrong answer stores nothing and shows a new question.
- **Validation** — the same rules run in the browser (errors appear as each field is left, and the first problem is
  brought into view on submit) and again on the server, so nothing invalid is stored: names in letters only, a real
  email address, phone numbers of the right length for the chosen country (10-digit mobiles for India), city or airport
  names, departure and arrival not the same, dates from today up to 12 months ahead with the return after departure,
  passenger limits per aircraft type, and message lengths. Names, routes and phone numbers are stored tidily.
- **Inquiry inbox** — every accepted submission is stored and listed at **`/admin`** (newest first, 10 per page with
  numbered pages, date and time in IST, contact details, charter details and message; filter by charter requests,
  enquiries or careers). Sign in with the admin password.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | MySQL (or MariaDB) connection string where inquiries are stored, e.g. `mysql://user:password@host:3306/database`. The tables are created automatically. |
| `ADMIN_PASSWORD` | Yes, for `/admin` | Password for the inquiry inbox — at least 12 characters. Changing it signs everyone out. |
| `INQUIRY_WEBHOOK_URL` | Optional | Also POST each new inquiry as JSON to this URL (e.g. a Zapier/Make webhook that emails the team). |

Without `DATABASE_URL` in production, the forms tell visitors to call or email instead of accepting a request — nothing is
silently lost. In local development (`npm run dev`) inquiries are saved to `.data/dev-store.json` instead.

For local development create `.env.local` (git-ignored):

```bash
ADMIN_PASSWORD=choose-a-long-password
# DATABASE_URL=mysql://root@localhost:3306/flycelesta   (optional locally, e.g. WAMP's MySQL)
```

## Database

MySQL 5.7+ / 8.x or MariaDB 10.3+. Create an empty database and a user with `CREATE`, `SELECT`, `INSERT`, `DELETE`
and `INDEX` rights on it; on first use the site creates three tables: `fc_inquiries` (the submissions), `fc_used_tokens`
(answered CAPTCHA questions) and `fc_settings` (a random signing key). The `fc_` prefix lets them share a database with
another application. Times are stored in UTC and shown in IST.

If the server requires TLS, add it to the URL: `mysql://user:password@host:3306/database?ssl={"rejectUnauthorized":true}`.
Special characters in the password must be URL-encoded (`@` → `%40`, `#` → `%23`).

## Deploying on Vercel

1. Create the MySQL database: on your hosting (with remote MySQL access allowed from any host, as Vercel has no fixed
   IP addresses) or with a managed MySQL provider.
2. **Settings** → **Environment Variables** → add `DATABASE_URL` and `ADMIN_PASSWORD` (Production and Preview).
   If a Neon/Postgres database was connected to the project earlier, disconnect it so it no longer sets `DATABASE_URL`.
3. Redeploy, then visit `/admin` and sign in.

## Structure

```
src/
  app/(site)/           public pages (layout adds header, footer, smooth scrolling)
  app/admin/            private inquiry inbox: sign-in, list, sign-out
  app/api/captcha/      issues CAPTCHA questions
  app/actions/          server actions for the charter and enquiry forms
  assets/               logo (colour + reversed) and photography
  components/forms/     CharterForm, InquiryForm, MathCaptcha, shared field styles
  components/layout/    Header (dropdown nav, menu sheet), Footer, PageHero, RouteSync
  components/sections/  page sections (Hero, Services, About, Fleet, Deals, FormSection, …)
  components/motion/    Reveal, ImageReveal, LineRise, Swoosh, MotionProvider
  data/                 navigation, services, fleet, deals and site copy
  lib/                  form validation shared by browser and server
  lib/server/           inquiry storage, CAPTCHA, admin session (server only)
```

## Before launch

- **Copy to confirm with the client:** the five service pages (Unmanned Aviation Systems is new), the career page and
  the mission/vision wording were drafted from the current flycelesta.in content.
- **Fleet specifications** are as published on flycelesta.in and indicative.
- **Photography** is from Wikimedia Commons, mostly under CC BY / CC BY-SA, which require visible credit. The footer no
  longer lists credits, so replace these photos with ones the client owns or licenses, or publish the credits again —
  sources and licences are in `src/assets/images/CREDITS.md`.
