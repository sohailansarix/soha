# SOHA — Premium E-Commerce Platform

SOHA is a production-ready, full-stack e-commerce platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Prisma 7**, **PostgreSQL**, **Auth.js v5**, and **shadcn/ui**.

## Features

- **Authentication & RBAC** — Credentials auth via Auth.js, role hierarchy (Guest / Customer / Admin / Super Admin).
- **Catalog** — Categories (nested), brands, products with variants, attributes, images, reviews, and related products.
- **Shopping** — Cart with save-for-later, wishlist, multi-step checkout (shipping → delivery → payment → review).
- **Customer Dashboard** — Orders, addresses, wishlist, profile management, downloadable invoices, order cancellation.
- **Admin Dashboard** — Analytics (recharts), manage products / categories / brands / orders / coupons / customers / settings, with RBAC guard.
- **Content** — Blog (with JSON-LD), FAQ, contact form, legal pages (privacy, terms, shipping, about).
- **SEO** — `sitemap.xml`, `robots.txt`, OpenGraph/Twitter metadata, JSON-LD structured data.
- **Security** — Auth middleware, security headers (CSP, X-Frame-Options, etc.), rate limiting on public endpoints, audit logging.
- **Testing** — Vitest unit/integration tests, Playwright e2e config.
- **DevOps** — Dockerfile, docker-compose (with Postgres), GitHub Actions CI.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4, Radix UI, shadcn/ui |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 + Prisma 7 |
| Auth | Auth.js v5 (`next-auth@beta`), Credentials provider, JWT sessions |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Email | Resend (wired, send pending) |
| Tests | Vitest, Playwright |

## Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

Copy the example env and fill in values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret for session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public site URL |
| `AUTH_RESEND_KEY` | Resend API key (for transactional email) |

### 3. Database

```bash
npx prisma migrate dev
npm run db:seed
```

Seed creates:
- `admin@soha.dev` / `admin123` (SUPER_ADMIN)
- `customer@soha.dev` / `customer123` (CUSTOMER)
- Sample categories, brands, products, and a `WELCOME10` coupon.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Lint |
| `npm test` | Run unit/integration tests (Vitest) |
| `npm run test:watch` | Watch mode tests |
| `npm run test:e2e` | Playwright e2e (requires running server) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Docker

```bash
docker compose up --build
```

This starts Postgres + the app on port 3000.

## Project Structure

```
src/
  app/            # App Router routes (pages + API)
    admin/        # Admin dashboard (RBAC-guarded)
    api/          # API route handlers
    dashboard/    # Customer dashboard
    products/     # Catalog + product detail
    blog/         # Blog
    ...           # static pages (contact, faq, about, legal)
  components/     # UI components (ui/, layout/, product/, home/, cart/, ...)
  lib/            # db, auth, constants, products, utils, rate-limit
  middleware.ts   # Auth + route protection
prisma/           # Schema, migrations, seed
```

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create customer account |
| POST | `/api/auth/forgot-password` | — | Request password reset (email pending) |
| POST | `/api/auth/callback/credentials` | — | Credentials sign-in |
| POST | `/api/checkout` | Customer | Place order |
| POST | `/api/reviews` | Customer | Submit product review |
| POST | `/api/newsletter` | — | Subscribe to newsletter |
| POST | `/api/contact` | — | Submit contact message |
| PATCH | `/api/account/profile` | Customer | Update profile |
| GET/POST | `/api/account/addresses` | Customer | List / create address |
| PATCH/DELETE | `/api/account/addresses/[id]` | Customer | Update / delete address |
| GET/POST | `/api/admin/products` | Admin | List / create product |
| PATCH/DELETE | `/api/admin/products/[id]` | Admin | Update / delete product |
| GET/POST | `/api/admin/categories` | Admin | List / create category |
| GET/POST | `/api/admin/brands` | Admin | List / create brand |
| GET/POST | `/api/admin/coupons` | Admin | List / create coupon |
| PATCH | `/api/admin/orders/[id]` | Admin | Update order status |

## License

MIT

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
