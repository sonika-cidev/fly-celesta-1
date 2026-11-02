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
| Blog | `/blog` (newest article featured, then 9 per page) and one page per article: `/blog/<address>` |
| FAQs | `/faq` (in the About menu); the most-asked questions also appear on the home page |
| Contact | `/contact` |
| Admin panel (private) | `/admin` — inquiry inbox · `/admin/blog` — blog posts |

The home page also shows the three newest blog articles (only once something is published) and a FAQ section.

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
- **Email notification** — with SMTP configured (below), each accepted submission is also emailed to `MAIL_TO`, with
  Reply-To set to the visitor when they gave an email address. It is sent after the visitor sees the confirmation; if
  sending fails, the error is logged as `[mail] …` and the inquiry is still in `/admin`.

## Blog

Articles are written and published from the admin panel: sign in at **`/admin`**, then **Blog** → **New post**.

- **Writing** — title, web address (filled in from the title), the article, and an optional excerpt for the blog page and
  search results (otherwise the opening of the article is used). The toolbar adds headings, bold and italic, links, lists,
  quotations, dividers and images; **Preview** shows the article as it will appear. Ctrl+S saves. The article is written
  in a small Markdown-like format (`## Heading`, `**bold**`, `[link](https://…)`, `- item`, `> quote`…), with
  *Formatting help* under the editor; it is rendered by the site itself, so no HTML or scripts can be added.
- **Images** — a cover image, and images within the article. They are resized in the browser (2000 px on the long edge,
  WebP or JPEG) and stored in the database, so they survive redeploys and need no writable folder on the host. Every image
  in an article needs a short description. Images no post uses any more are removed a day after upload.
- **Publishing** — *Draft* (visible only in the admin panel) or *Published*. The optional publish date backdates a post,
  or schedules it: a future date keeps it off the website until that day (India time).
- Blog pages are rendered for each visit from the database, so changes appear on the website immediately. Articles get
  their own title, description, social-sharing image and `BlogPosting` structured data.

## FAQs

The questions and answers are in `src/data/faq.ts`, grouped by topic. `featured: true` also shows a question on the
home page. The `/faq` page includes `FAQPage` structured data for search engines.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | MySQL (or MariaDB) connection string where inquiries and blog posts are stored, e.g. `mysql://user:password@host:3306/database`. The tables are created automatically. |
| `ADMIN_PASSWORD` | Yes, for `/admin` | Password for the admin panel (inquiries and blog) — at least 12 characters. Changing it signs everyone out. |
| `SMTP_HOST` | For email | Mail server that sends the notification emails, e.g. `mail.example.com`. Nothing is emailed without it. |
| `SMTP_CRYPTO` | Optional | `ssl` (port 465, the default), `tls` (STARTTLS, port 587) or `none`. |
| `SMTP_PORT` | Optional | Only for a non-standard port. |
| `SMTP_USER` / `SMTP_PASSWORD` | For email | Mailbox login on that server. |
| `MAIL_TO` | Optional | Who receives the emails, comma-separated. Defaults to `SMTP_USER`. |
| `MAIL_FROM` | Optional | Sender address. Defaults to `SMTP_USER`; most servers only send from their own mailboxes. |
| `INQUIRY_WEBHOOK_URL` | Optional | Also POST each new inquiry as JSON to this URL (e.g. a Zapier/Make webhook that emails the team). |

Without `DATABASE_URL` in production, the forms tell visitors to call or email instead of accepting a request — nothing is
silently lost — and the blog shows no articles. In local development (`npm run dev`) without a database, inquiries and
posts are saved to `.data/dev-store.json` (uploaded images to `.data/images/`) instead.

For local development create `.env.local` (git-ignored):

```bash
ADMIN_PASSWORD=choose-a-long-password
# DATABASE_URL=mysql://root@localhost:3306/flycelesta   (optional locally, e.g. WAMP's MySQL)
```

## Database

MySQL 5.7+ / 8.x or MariaDB 10.3+. Create an empty database and a user with `CREATE`, `SELECT`, `INSERT`, `UPDATE`,
`DELETE` and `INDEX` rights on it (on cPanel, *All privileges* is simplest); on first use the site creates its tables:
`fc_inquiries` (the submissions), `fc_used_tokens` (answered CAPTCHA questions), `fc_settings` (a random signing key),
`fc_posts` (blog posts) and `fc_images` (images uploaded for the blog). A database already in use by an earlier version
gains the blog tables automatically — there is nothing to import. The `fc_` prefix lets the tables share a database with
another application. Times are stored in UTC and shown in IST.

If the server requires TLS, add it to the URL: `mysql://user:password@host:3306/database?ssl={"rejectUnauthorized":true}`.
Special characters in the password must be URL-encoded (`@` → `%40`, `#` → `%23`).

## Deploying on Vercel

1. Create the MySQL database: on your hosting (with remote MySQL access allowed from any host, as Vercel has no fixed
   IP addresses) or with a managed MySQL provider.
2. **Settings** → **Environment Variables** → add `DATABASE_URL` and `ADMIN_PASSWORD` (Production and Preview).
   If a Neon/Postgres database was connected to the project earlier, disconnect it so it no longer sets `DATABASE_URL`.
3. Redeploy, then visit `/admin` and sign in.

## Deploying on DirectAdmin / cPanel (Setup Node.js App)

```bash
npm run package:hosting   # → deploy/fly-celesta-hosting.zip
```

The script builds the standalone server and makes it portable to a Linux host: it adds the static assets, drops
`.data/`, replaces Turbopack's links for `mysql2`/`svg-captcha` with real copies, and swaps sharp's binaries for Linux
x64 ones (plus the WebAssembly build as a fallback for older Linux).

1. **Setup Node.js App** → create an app: Node.js 20 or newer, mode Production, an application root such as
   `flycelesta-app` (outside `public_html`), application URL the domain, startup file `server.js`.
2. Upload the zip into the application root and extract it there, so `server.js` sits at the top level.
   Do **not** press "Run NPM Install": everything the server needs is already in the zip.
3. Add the environment variables `DATABASE_URL` (`mysql://user:password@localhost:3306/database`) and `ADMIN_PASSWORD`,
   then restart the app.

To update the site, run the script again, upload and extract over the old files, and restart the app.

## Structure

```
src/
  app/(site)/           public pages (layout adds header, footer, smooth scrolling), including blog/ and faq/
  app/admin/            private admin panel: sign-in, inquiry inbox, sign-out
  app/admin/blog/       blog posts: list, editor (toolbar, preview, image upload), server actions
  app/media/            serves images uploaded for the blog (/media/<id>.webp)
  app/api/captcha/      issues CAPTCHA questions
  app/actions/          server actions for the charter and enquiry forms
  assets/               logo (colour + reversed) and photography
  components/blog/      PostBody (renders an article), PostCard and grid, pagination
  components/forms/     CharterForm, InquiryForm, MathCaptcha, shared field styles
  components/layout/    Header (dropdown nav, menu sheet), Footer, PageHero, RouteSync
  components/sections/  page sections (Hero, Services, About, Fleet, Deals, LatestPosts, Faq, FormSection, …)
  components/motion/    Reveal, ImageReveal, LineRise, Swoosh, MotionProvider
  data/                 navigation, services, fleet, deals, FAQs and site copy
  lib/                  form and blog-post validation shared by browser and server, the article format (blog-markup)
  lib/server/           storage (inquiries, posts, images), CAPTCHA, admin session (server only)
```

## Before launch

- **Copy to confirm with the client:** the five service pages (Unmanned Aviation Systems is new), the career page and
  the mission/vision wording were drafted from the current flycelesta.in content. The FAQ answers (`src/data/faq.ts`)
  were drafted from that copy and general charter practice — confirm them too, especially pricing, documents and
  helicopter landing permissions.
- **Fleet specifications** are as published on flycelesta.in and indicative.
- **Photography** is from Wikimedia Commons, mostly under CC BY / CC BY-SA, which require visible credit. The footer no
  longer lists credits, so replace these photos with ones the client owns or licenses, or publish the credits again —
  sources and licences are in `src/assets/images/CREDITS.md`.
