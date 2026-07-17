# SOHA — Deployment Guide

A complete, step-by-step guide to deploying the **SOHA** e-commerce platform
(Next.js 16 App Router · React 19 · Prisma 7 · PostgreSQL 16 · Auth.js v5) to
production.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Option A — Docker Compose (fastest, single host)](#3-option-a--docker-compose)
4. [Option B — Manual / VPS (Node + PostgreSQL)](#4-option-b--manual--vps)
5. [Option C — Managed Platforms (Vercel / Render / Railway)](#5-option-c--managed-platforms)
6. [Database Migrations & Seeding](#6-database-migrations--seeding)
7. [Reverse Proxy & HTTPS (Nginx + Let's Encrypt)](#7-reverse-proxy--https)
8. [CI/CD (GitHub Actions)](#8-cicd-github-actions)
9. [Post-Deployment Checklist](#9-post-deployment-checklist)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js     | 20+     | Used by the Docker image and CI. |
| PostgreSQL  | 16      | Required. Use the `postgres:16` image or a managed DB. |
| npm         | 10+     | Only needed for non-Docker installs. |
| Docker       | 24+     | Only for Options A / container deploys. |
| Git         | any     | To pull the source. |

The app listens on **port 3000** by default (`npm run start` → `next start`).

---

## 2. Environment Variables

Create a `.env` file in the project root (there is **no** `.env.example`
shipped — copy the block below). All variables are read at build **and** runtime
except those prefixed `NEXT_PUBLIC_`, which are inlined at build time.

```dotenv
# ---- Database ----
# PostgreSQL connection string used by Prisma 7 (datasource in prisma.config.ts).
DATABASE_URL="postgresql://soha:soha@db:5432/soha?schema=public"

# ---- Auth.js v5 ----
# Generate with:  openssl rand -base64 32
NEXTAUTH_SECRET="replace-with-a-long-random-string"
# Must equal the public origin users will hit (no trailing slash).
NEXTAUTH_URL="https://your-domain.com"

# ---- Public site config (inlined at build time) ----
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="SOHA"

# ---- Email (Resend, optional — wired but send is pending) ----
AUTH_RESEND_KEY=""

# ---- Payments (optional — checkout supports STRIPE / RAZORPAY / COD) ----
STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
```

> **Important:** `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_APP_NAME` are baked into
> the client bundle at build time. If you change the domain, you must **rebuild**
> (or, on Vercel, redeploy) — restarting the server is not enough.

### Generating a secret

```bash
openssl rand -base64 32
```

---

## 3. Option A — Docker Compose

Best for a single VPS / self-hosted box. Spins up PostgreSQL + the app together.

### 3.1 Configure env

```bash
cp .env .env   # (create .env from section 2)
# Edit DATABASE_URL to use the compose service host "db":
#   DATABASE_URL="postgresql://soha:soha@db:5432/soha?schema=public"
# Set NEXTAUTH_URL / NEXT_PUBLIC_APP_URL to your real domain.
```

### 3.2 Build & start

```bash
docker compose up --build -d
```

This:
1. Starts `db` (postgres:16-alpine) with a persistent volume `soha_pgdata`.
2. Waits for the DB health check (`pg_isready`).
3. Builds the `app` image (multi-stage Dockerfile: deps → build → runtime).
4. Runs `prisma generate` during build and starts `next start` on port 3000.

### 3.3 Run migrations + seed

```bash
# Apply migrations
docker compose exec app npx prisma migrate deploy

# (Optional) seed sample data — creates admin@soha.dev / admin123
docker compose exec app npm run db:seed
```

### 3.4 Update

```bash
git pull
docker compose up --build -d
docker compose exec app npx prisma migrate deploy
```

> The Dockerfile copies `prisma/` and runs `prisma generate`, but does **not**
> run `migrate deploy` automatically. Always run it after a build that includes
> new migrations.

---

## 4. Option B — Manual / VPS

For a bare Ubuntu/Debian server with Node 20 and PostgreSQL 16 installed.

### 4.1 Install Node 20 (if needed)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 4.2 PostgreSQL

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER soha WITH PASSWORD 'soha';"
sudo -u postgres psql -c "CREATE DATABASE soha OWNER soha;"
```

Set `DATABASE_URL="postgresql://soha:soha@localhost:5432/soha?schema=public"`.

### 4.3 Build & run

```bash
git clone <your-repo> && cd SOHA
npm ci
npx prisma generate
npx prisma migrate deploy      # apply schema to the DB
npm run build                  # production build (needs DB reachable for /sitemap.xml)
npm run db:seed                # optional sample data

# Start (use a process manager in production)
npm run start
```

### 4.4 Run as a service (PM2)

```bash
sudo npm i -g pm2
pm2 start npm --name soha -- run start
pm2 save && pm2 startup
```

> The production build statically prerenders `/sitemap.xml`, which queries the
> database. Ensure `DATABASE_URL` is reachable **at build time**, or the build
> will fail (the sitemap falls back to static routes only if the DB is
> unreachable, but a correct sitemap needs the DB).

---

## 5. Option C — Managed Platforms

### 5.1 Vercel

The repo already includes a `vercel.json` that runs
`prisma migrate deploy || true && next build` as the build command (the `|| true`
means a missing/unreachable DB won't abort the build), plus a `postinstall`
script that runs `prisma generate`. This avoids the two most common Vercel
failures: a missing Prisma client at runtime, and a hard build failure when the
DB isn't reachable during build.

1. Import the repo at vercel.com (framework auto-detected as Next.js).
2. **Add env vars** from section 2 in the project settings
   (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, …).
   `DATABASE_URL` **must** be set in **Production AND Preview** environments —
   the app needs it at runtime, and `migrate deploy` applies migrations when it
   is present. If it is missing at build time, the build still succeeds but
   migrations are skipped (you must apply them manually — see step 6).
3. **Postgres:** use Vercel Postgres, Neon, Supabase, or any hosted PG. Set
   `DATABASE_URL` to it.
4. **Node version:** `engines.node` requires `>=20` (Vercel auto-selects a
   compatible 20.x/22.x release).
5. Deploy. `NEXT_PUBLIC_*` vars are inlined at build — redeploy after changing.
6. **Migrations:** if `DATABASE_URL` was set before the build, migrations apply
   automatically (check build logs for "All migrations have been successfully
   applied"). If it was NOT set, apply them manually after adding the var:
   `npx prisma migrate deploy` against the production `DATABASE_URL` (run locally
   or via `vercel env pull` + the command). Then redeploy.

### 5.2 Render / Railway

- Use the included **Dockerfile** (Render "Docker" type / Railway "Dockerfile").
- Provide the env vars from section 2.
- Add a **start command** / release step: `prisma migrate deploy`.
- Point `DATABASE_URL` at the platform's managed Postgres (internal host).

---

## 6. Database Migrations & Seeding

Prisma 7 uses `prisma.config.ts` (no `url` in `schema.prisma`). Migrations live
in `prisma/migrations/`.

```bash
# Apply all pending migrations (idempotent, safe to re-run)
npx prisma migrate deploy

# Dev-only: create + apply a new migration interactively
npx prisma migrate dev --name <description>

# Seed (admin@soha.dev / admin123, customer@soha.dev / customer123, sample data)
npm run db:seed

# Inspect data
npx prisma studio
```

> **CI note:** the GitHub Actions workflow already runs `prisma migrate deploy`
> against a Postgres service container, so migrations are applied automatically
> on every build.

### 6.1 Seeding on Vercel / managed Postgres

Vercel does **not** run the seed for you, and `tsx` is not on the global PATH, so
seed from your local machine against the production `DATABASE_URL`:

```bash
# Point at the hosted DB and seed (creates admin@soha.dev / admin123,
# customer@soha.dev / customer123, and sample data)
env DATABASE_URL="<your-production-database-url>" npx tsx prisma/seed.ts
```

This creates the `SUPER_ADMIN` account used to access `/admin`. Re-run any time
you need fresh sample data (it uses `upsert`, so it is safe to repeat).

**Default credentials after seeding:**
| Role | Email | Password |
|------|-------|----------|
| SUPER_ADMIN | `admin@soha.dev` | `admin123` |
| CUSTOMER | `customer@soha.dev` | `customer123` |

> Change these passwords in production.

---

## 6.2 Product image uploads (Cloudinary)

The admin product form supports **both** pasting an image URL **and** uploading a
file directly. Uploads go through `/api/admin/upload` → Cloudinary and the
returned URL is stored in the `ProductImage` table (same as a pasted URL).

**Required env vars (Vercel Production + Preview, and local `.env`):**
```
CLOUDINARY_CLOUD_NAME=   # from https://cloudinary.com/console
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
If these are missing, the "Upload" button returns a clear 500 error but pasting
a URL still works. Uploaded files are stored under the `soha/products` folder in
your Cloudinary account (max 5 MB each). `res.cloudinary.com` is already allowed
in `next.config.ts` `images.remotePatterns`.

---

## 7. Reverse Proxy & HTTPS

Expose port 3000 behind Nginx with TLS. Example `/etc/nginx/sites-available/soha`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Auth.js / NextAuth callbacks need correct forwarded headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable + obtain cert:

```bash
sudo ln -s /etc/nginx/sites-available/soha /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

Set `NEXTAUTH_URL="https://your-domain.com"` and
`NEXT_PUBLIC_APP_URL="https://your-domain.com"` to match.

---

## 8. CI/CD (GitHub Actions)

The repo includes `.github/workflows/ci.yml`. On every push to `main`/`master`
and on PRs it:

1. Spins up a **Postgres 16 service container** (health-checked).
2. Installs deps, generates the Prisma client.
3. Runs `prisma migrate deploy` (applies all migrations to the service DB).
4. Type-checks, runs unit tests (Vitest), then `npm run build`.

Because the build prerenders `/sitemap.xml` (which queries the DB), the Postgres
service is required — without it the build fails with `ECONNREFUSED`. The
sitemap also has a `try/catch` fallback to static routes so a transient DB
outage won't hard-fail the build.

To deploy from CI, add a deploy step (e.g. SSH to your VPS, or a platform CLI)
after the build step, and supply `NEXTAUTH_SECRET` as a repo secret.

---

## 9. Post-Deployment Checklist

- [ ] `DATABASE_URL` points at the production database (not `localhost` from your laptop).
- [ ] `NEXTAUTH_SECRET` is a strong, unique value (not the default).
- [ ] `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` use **https://** + your domain.
- [ ] `prisma migrate deploy` has been run against production.
- [ ] App responds at `https://your-domain.com` (200 on `/`).
- [ ] `/sitemap.xml` and `/robots.txt` return 200.
- [ ] Log in as `admin@soha.dev` and confirm the admin dashboard loads.
- [ ] Product detail pages render variant selectors (dynamic options).
- [ ] Checkout flow reaches the review step without DB errors.
- [ ] TLS certificate is valid and auto-renews.

### Default credentials (change immediately in production)

| Role        | Email               | Password     |
|-------------|---------------------|--------------|
| SUPER_ADMIN | `admin@soha.dev`    | `admin123`   |
| CUSTOMER    | `customer@soha.dev` | `customer123`|

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Build fails with `ECONNREFUSED` on `/sitemap.xml` | No DB reachable at build time | Provide a DB (CI service container, or run `prisma migrate deploy` + build with `DATABASE_URL` set). |
| `PrismaClientKnownRequestError: column "Product.price" does not exist` | Stale Prisma client / DB not migrated | Run `npx prisma generate` and `npx prisma migrate deploy`. |
| Auth redirects loop / session not persisting | `NEXTAUTH_URL` mismatch or secret changed | Set `NEXTAUTH_URL` to the exact origin; keep `NEXTAUTH_SECRET` stable. |
| Images from `picsum.photos` / `unsplash` blocked | `next.config.ts` remotePatterns | Add the host to `images.remotePatterns`, or use your own CDN. |
| `NEXT_PUBLIC_*` changes not reflected | Inlined at build time | Rebuild / redeploy after editing. |
| 502 from Nginx | App not listening / crashed | `pm2 logs soha` or `docker compose logs app`; confirm port 3000. |

### Useful commands

```bash
# View runtime logs
pm2 logs soha            # PM2
docker compose logs -f app   # Docker

# Force a clean rebuild of the Prisma client
npx prisma generate

# Verify DB connectivity
psql "$DATABASE_URL" -c "SELECT 1"
```
