# Aisle — wedding planning tool

A production-shaped starting point: Next.js 14 (App Router) + TypeScript, Postgres via Prisma,
NextAuth for accounts, the Anthropic API for the planning chat and document drafting, and Vercel
Blob for mood board images and generated PDFs.

## What's built

- **Accounts** — email/password signup and login (NextAuth credentials provider). Each account owns
  one `Wedding` record for v1.
- **Planning chat** (`/dashboard/chat`) — persistent conversation with Claude. The system prompt is
  rebuilt on every message from the wedding's real date, venue, budget, style preferences, and mood
  board tags, so the assistant has current context instead of relying on chat history alone.
- **Mood board** (`/dashboard/moodboard`) — upload images (stored in Vercel Blob) or paste
  Pinterest/Etsy links.
- **Guests, vendors, budget** (`/dashboard/guests`, `/vendors`, `/budget`) — CRUD tables backed by
  Postgres.
- **Documents** (`/dashboard/documents`) — generates a timeline, checklist, vendor brief, or seating
  worksheet: Claude drafts the content, `pdfkit` renders it to a PDF, the PDF is stored in Blob.

## Why these choices (read before you change them)

- **No Zola / The Knot / Minted API integration.** These platforms don't expose public developer
  APIs for third-party apps — they're closed consumer products, not developer platforms. If you want
  real interop later, the realistic paths are: (a) CSV import/export where they support it, (b)
  browser automation against a user's logged-in session (fragile, and likely against their ToS — read
  it before building this), or (c) just building better native guest/registry/vendor tracking here so
  couples don't need to bounce back to those tools. I did not build any of these in v1 — don't wire up
  fake "Connect to Zola" buttons that don't do anything.
- **Next.js pinned to 14.2.35, not the current 16.x latest.** Next 15 made route params
  (`{ params }`) async by default, which touches every dynamic API route in this repo
  (`guests/[id]`, `vendors/[id]`, `budget/[id]`). I didn't want to guess at that migration blind. If
  you want to move to 15/16, budget a focused pass for it — don't just bump the version number.
- **One wedding per account.** Fine for a personal tool or an early beta with couples you onboard
  by hand. Before taking outside signups at any real volume, decide whether you actually want
  multi-wedding-per-account (planners managing several couples) — that changes the `Wedding` model's
  relationship to `User` from 1:many-but-used-as-1 to a real multi-tenant shape, and it's much easier
  to build that in now than to retrofit once there's real customer data.
- **Document generation is synchronous.** A chat call plus a PDF render currently happens inside one
  request. Fine at this scale; if generation ever starts timing out (long documents, slow model
  responses), move it to a background job (Vercel queues, Inngest, etc.) and poll or stream status
  back to the client instead.

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Get a Postgres database.** Easiest options: [Vercel Postgres](https://vercel.com/storage/postgres)
   or [Supabase](https://supabase.com) (you've used Supabase before — either works fine here since
   this is plain Postgres via Prisma, not tied to Supabase-specific features).

3. **Copy the env file and fill it in**
   ```bash
   cp .env.example .env
   ```
   - `DATABASE_URL` — your Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `ANTHROPIC_API_KEY` — from the [Anthropic Console](https://console.anthropic.com)
   - `BLOB_READ_WRITE_TOKEN` — from your Vercel project's Storage tab once you create a Blob store

4. **Push the schema and (optionally) seed a demo account**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed   # creates demo@aisle.app / password123, pre-filled with your wedding details
   ```

5. **Run it**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`.

## Testing and CI

- Run `npm run test:watch` while developing.
- Run `npm run test:run` for a one-off local check, which matches the GitHub Actions job.
- GitHub Actions now runs install, Prisma client generation, lint, build, and tests on pushes and
   pull requests to `main`.
- If you add tests that touch the database, point CI at a dedicated test `DATABASE_URL` instead of
   production credentials.

## Pushing to GitHub

```bash
git add -A
git commit -m "Initial scaffold: auth, planning chat, mood board, guests, vendors, budget, documents"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

## Deploying to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Add the same environment variables from `.env` in the Vercel project settings
   (Settings → Environment Variables). Set `NEXTAUTH_URL` to your production URL.
3. Add a **Vercel Blob** store from the Storage tab — it'll inject `BLOB_READ_WRITE_TOKEN`
   automatically.
4. Add a **Vercel Postgres** store (or point `DATABASE_URL` at your existing Supabase/Neon instance).
5. Deploy. Run `npx prisma migrate deploy` against the production `DATABASE_URL` before or right after
   first deploy so the schema exists.

## Immediate next steps, in rough priority order

1. **Auth hardening** — add email verification and password reset before any real customer signs up
   with a real password.
2. **Rate limiting on `/api/chat` and `/api/documents/generate`** — both call the Anthropic API
   directly with no throttling; a stuck client or a bad actor can run up your bill fast.
3. **Multi-wedding data model decision** — see above, easier now than later.
4. **Mood board link previews** — currently stores the raw URL with no thumbnail. An unfurl
   service (e.g. Microlink, Iframely) can fetch title/image without you needing platform API access.
5. **Error boundaries + empty/loading states** — the current pages assume the happy path. Worth a
   pass before anyone but you touches it.
