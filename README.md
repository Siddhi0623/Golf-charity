# Fairway — Golf Charity Subscription Platform

A modern membership platform where users subscribe, enter golf scores, support a charity of their choice, and participate in a monthly community prize draw.

> **Phase 1** (this commit) — scaffold, database schema, RLS, business logic, shared libs.
> **Phase 2** (next) — auth + public marketing + dashboard.
> **Phase 3** — admin panel + draw simulator + winner verification.

## Stack

- **Next.js 15** (App Router, RSC, Server Actions)
- **TypeScript** strict, `noUncheckedIndexedAccess`
- **Tailwind CSS** + **shadcn/ui** (new-york style)
- **Supabase** (Postgres + Auth + Storage + RLS)
- **TanStack Query** for client mutations
- **React Hook Form** + **Zod** for forms
- **Vercel** for deploy

## Setup

### 1. Install dependencies

```bash
npm install
```

> The project path contains a space (`golf charity`). If a CLI tool ever complains, that's the first thing to suspect.

### 2. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Note the **Project URL**, **anon key**, **service_role key**.
2. **Authentication → URL Configuration** → Site URL: `http://localhost:3000`; redirect URLs: `http://localhost:3000/auth/callback`.
3. **Storage** → create three buckets:
   - `charity-images` — public
   - `winner-proofs` — **private**
   - `user-avatars` — public

### 3. Environment variables

```bash
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

### 4. Apply database migrations

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:push
```

This applies, in order:

- `0001_init_schema.sql` — tables, enums, indexes
- `0002_rls_policies.sql` — row-level security + storage policies
- `0003_triggers_functions.sql` — auto-profile, score cap, `publish_draw()`
- `0004_seed_charities.sql` — 6 sample charities

### 5. Generate TypeScript types

```bash
npm run db:types
```

This overwrites `src/types/database.types.ts` with the schema-derived types. Re-run after every migration.

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Promote yourself to ADMIN

After registering an account:

```bash
npm run promote-admin -- you@example.com
```

## Architecture

```
src/
  app/            App Router — (public), (auth), (app), (admin), api/
  components/     ui (shadcn), marketing, dashboard, draws, winners, admin, shared
  lib/
    supabase/     server / client / admin / middleware
    auth/         session helpers + RBAC
    draw/         generate, match, prize, jackpot
    subscription/ lifecycle + PaymentProvider (mock now, Stripe later)
    validations/  zod schemas, shared client/server
    format/       money, date, score formatters
    query/        TanStack keys + client
  server/
    actions/      Server Actions
    queries/      RSC-side data fetches
  types/          domain.ts (hand-written) + database.types.ts (generated)
middleware.ts     Edge auth + subscription gate
supabase/
  migrations/     ordered SQL
```

### Business rules encoded in the database

- **Score cap**: a `BEFORE INSERT` trigger keeps only the latest 5 scores per user.
- **Auto-profile**: a `SECURITY DEFINER` trigger on `auth.users` inserts a matching `profiles` row.
- **`publish_draw(p_draw_id)`** RPC computes winners (3/4/5 match), allocates prizes (40/35/25 split), rolls the jackpot when no 5-match, and creates `PENDING` payouts.
- **Subscription gate**: middleware blocks `/scores` and `/draws/*` when the user has no `ACTIVE` subscription. Dashboard stays read-only.
- **Per-user pool math**: the platform-retained portion of each subscription = `price × (1 − snapshotted contribution_pct)`. The snapshot lives on `subscriptions` so historical math is reproducible.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:push` | Apply migrations to linked Supabase project |
| `npm run db:reset` | Reset local Supabase + re-run migrations + seed |
| `npm run db:types` | Generate `src/types/database.types.ts` |
| `npm run promote-admin -- email` | Flip a registered user to ADMIN |
