# Alfa Solution — website, CMS & business platform

Next.js 16 (App Router) + MySQL/MariaDB. One codebase runs the public website, the admin panel (CMS, CRM, careers, payments, invoices) and the APIs.

- Works locally with **XAMPP** (MySQL/MariaDB + phpMyAdmin) and in production on **Hostinger** (Node.js web app + Hostinger MySQL).
- Switching environments only changes `.env` values — no code changes.

---

## 1. Local setup (XAMPP)

**Requirements:** Node.js 20.9+ (22 LTS recommended), XAMPP with MySQL running.

1. **Create the database** — open phpMyAdmin (`http://localhost/phpmyadmin`) → *New* → name `alfa_solution`, collation `utf8mb4_unicode_ci` → *Create*.
2. **Create the tables** — choose either:
   - phpMyAdmin → select `alfa_solution` → *Import* → `database/migrations/001_initial_schema.sql`, then (optional starter content) `database/seed.sql`; **or**
   - terminal: `npm run db:setup` (runs migrations + seed).
3. **Configure** — copy `.env.example` to `.env.local`. XAMPP defaults are already filled in (`root`, empty password). Generate the two secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
4. **Install & create your admin account**
   ```bash
   npm install
   npm run admin:create -- --email you@alfasolution.net --name "Your Name" --password "a-long-unique-password"
   ```
5. **Run** — `npm run dev`, then open `http://localhost:3000` and `http://localhost:3000/admin`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server (the build does **not** need a database) |
| `npm run db:migrate` | Applies new files in `database/migrations/` (tracked in `schema_migrations`) |
| `npm run db:seed` | Adds starter content; never overwrites existing rows |
| `npm run admin:create -- --email … --name … --password … [--role …]` | Creates an admin or resets their password |
| `npm run lint` / `npm run typecheck` | Code checks |

---

## 2. Deploying to Hostinger

Node.js web apps run on Hostinger **Business** web hosting and **Cloud** plans.

1. **Database** — hPanel → *Databases* → create a MySQL database and user. Open its phpMyAdmin and import `001_initial_schema.sql`, then `seed.sql`.
2. **App** — hPanel → *Websites* → *Add website* → *Node.js web app* → connect the GitHub repo (or upload a .zip without `node_modules`, `.next` and `.env*`). Framework: Next.js, build `npm run build`, start `npm start`, Node 22.
3. **Environment variables** (hPanel → your app → *Environment variables*) — same keys as `.env.example`:
   - `NEXT_PUBLIC_SITE_URL=https://www.alfasolution.net`
   - `DB_HOST` (shown in hPanel → Databases, usually `localhost`), `DB_PORT=3306`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `SESSION_SECRET`, `CAPTCHA_SECRET` — new random values, not your local ones
   - `STORAGE_DIR` — a folder **outside** the deployed app (e.g. `/home/u123456789/alfa-storage`) so uploads and CVs survive redeploys
   - `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
   - First admin, if you can’t run `npm run admin:create` over SSH: set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD`, open `/admin/login` once, then **delete those variables**.
4. **Razorpay webhook** — Razorpay Dashboard → *Webhooks* → URL `https://www.alfasolution.net/api/payments/webhook`, events `payment.captured`, `payment.failed`, `order.paid`, and the same secret as `RAZORPAY_WEBHOOK_SECRET`.
5. **Check** — Admin → *Settings* shows whether the database, email, Razorpay and storage are configured.

Future schema changes go in a new numbered file in `database/migrations/` (e.g. `002_add_x.sql`); run `npm run db:migrate` or import it in phpMyAdmin.

---

## 3. What’s in the platform

**Public website** — Home, About, Services + a page per service, Work (portfolio with filters), case studies, **Live previews** (`/work/live`) and a full-screen **embedded preview** per project (`/work/<slug>/preview`), Team, Careers + job pages with CV upload, Blog with search / categories / tags / related posts, Pricing with online checkout, FAQ, Contact, Privacy policy, Terms, payment status, client invoice view, custom 404 and error pages. `/facilities` redirects to `/pricing`.

**Live website previews** — the real site runs inside an interactive browser frame with desktop / tablet / mobile sizes, reload, full screen and “open in new tab”. The admin checks each site’s `X-Frame-Options` / CSP `frame-ancestors` headers; sites that forbid embedding automatically show their screenshot with a link instead. A per-project override exists (auto / always live / screenshot only).

**Admin (`/admin`)**

| Area | What you can do |
|---|---|
| Dashboard | Enquiries, clients, projects, revenue, outstanding invoices, applicants, monthly revenue & enquiry charts, recent activity, quick actions |
| Enquiries | Pipeline statuses, internal notes, reply/call, convert to client |
| Clients & Projects | Client records with GSTIN/address, history timeline, projects with status, budget, deliverables checklist and payment progress |
| Payments | Send payment links (advance / milestone / remaining), record bank/UPI/cash payments, check status with Razorpay, cancel, resend receipts |
| Invoices | Automatic invoice on every successful payment, manual invoices with line items, PDF download, client share link, email with PDF attached |
| Pages & content | Homepage, About, navigation & footer, announcement banner, SEO (defaults + per-page), privacy & terms, team, testimonials, FAQs, pricing packages |
| Services, Portfolio, Blog | Full CRUD, rich-text editor with image upload, SEO fields, slugs, drafts, scheduled publishing, categories & tags |
| Careers | Jobs (draft / open / closed, closing date), applicants with status, notes and CV download |
| Media | Image library |
| Users | Roles: Super admin, Admin, Content editor, HR, Accounts & sales |
| Activity log | Every admin change, sign-in and CV download |

---

## 4. Security

- Passwords hashed with bcrypt (cost 12); account locks for 15 min after 5 failed sign-ins; IP rate limit on sign-in.
- Sessions: random 256-bit token in an `httpOnly`, `SameSite=Lax` (and `__Host-`/`Secure` in production) cookie; the database stores only an HMAC of the token. Sliding 8-hour expiry; deactivating a user or resetting their password signs them out.
- Every admin page, server action and admin API re-checks the session **and** the role’s permission on the server. `src/proxy.ts` only short-circuits signed-out visitors.
- CSRF: server actions are origin-checked by Next.js; public POST APIs reject other origins; the webhook is verified by signature instead.
- SQL: all queries use placeholders (`mysql2`); column names come only from code.
- Validation: every form is validated on the server (Zod); rich text is sanitised (`sanitize-html`) before saving.
- Uploads: file type detected from the file’s bytes (not its name), size-limited, random file names, stored outside `public/`. CVs are only downloadable by HR/admin roles.
- Rate limits (stored in MySQL, so they survive restarts): contact form, job applications, payment orders, uploads, invoice downloads.
- Payments: amounts are always calculated on the server from the database. The browser only gets the public key id and an order id. Payment success requires a valid HMAC signature **and** a matching amount/order fetched back from Razorpay; webhooks are signature-checked and de-duplicated; finalisation is idempotent with row locks; invoice numbers are allocated under a lock (`PREFIX/2026-27/0001`, Indian financial year).
- Security headers: CSP, `X-Frame-Options`, `nosniff`, Referrer-Policy, Permissions-Policy, HSTS (production). Admin pages are `noindex`.
- Secrets only in environment variables; `.env*` and `storage/` are git-ignored.

---

## 5. Project structure

```
database/
  migrations/001_initial_schema.sql   tables, keys, relations (import in phpMyAdmin or npm run db:migrate)
  seed.sql                            starter content for phpMyAdmin import
scripts/                              db-migrate, db-seed, create-admin (+ seed-data.mjs)
src/
  proxy.ts                            redirects signed-out /admin visitors to the login page
  app/
    (site)/                           public pages (header/footer layout)
    (preview)/work/[slug]/preview     full-screen embedded preview
    admin/login                       sign-in
    admin/(panel)/                    admin screens, each with its own actions.ts
    api/                              contact, careers, payments (order/verify/webhook), invoices, admin uploads/downloads
    media/[...path]                   serves uploaded images
    sitemap.ts, robots.ts
  components/site | admin | shared    UI
  lib/                                shared helpers: formatting, RBAC, validation schemas, content field definitions
  server/                             server-only code
    db.ts, env.ts, settings.ts, storage.ts, mail.ts, seo.ts, audit.ts
    auth/                             sessions, guards, bootstrap
    security/                         rate limiting, origin checks, sanitising
    finance/                          Razorpay client, payments, invoices, PDF
    repos/                            data access per domain
```

---

## 6. Before you launch — please review

- **Prices** on the three website packages (₹14,999 / ₹34,999 / ₹69,999) are placeholders. Set real prices in Admin → Pricing, or untick “Allow online purchase”.
- **Privacy policy & Terms** are a sensible starting draft, not legal advice — have them reviewed.
- **Billing details:** add your GSTIN, registered address and bank details in Admin → Settings → Billing & invoices. If you’re not GST-registered, set the tax rate to 0.
- **Testimonials:** the old site’s “Sample Client” reviews were not carried over. Add real ones in Admin → Testimonials.
- **Team:** add team members in Admin → Team (the page shows a friendly empty state until then).
- **Email:** verify your sending domain in Resend so emails from `noreply@alfasolution.net` are delivered.
- **Razorpay:** test with `rzp_test_` keys first, then switch to live keys after KYC.
- The seeded blog posts and the draft “Frontend developer” job are examples — edit, keep or delete them.
