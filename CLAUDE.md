# ClinicTerapia — Project Instructions

This project is a management application for César Fonseca's physiotherapy clinic. It centralizes the daily agenda, clinical records, symptom tracking, and home exercise routines, with a separate portal where each patient sees their own routine.

## Project Overview

- **Core Purpose:** Streamline clinic operations and patient follow-up.
- **Tech Stack:**
  - **Frontend:** Next.js 15 (App Router, `src/` directory), TypeScript.
  - **Styling:** Tailwind CSS v4 (CSS variables for design tokens, no `tailwind.config` theme extension needed for colors/fonts).
  - **Database:** Prisma ORM with PostgreSQL (Neon).
  - **Auth:** Auth.js v5 (NextAuth) with Credentials provider (`bcrypt`) and JWT sessions.
- **Architecture:** Spec-driven development. Features are defined in `specs/` before implementation.
- **Status:** SPEC 01 (foundation, design system, auth, agenda) is implemented. See `specs/00-roadmap.md` for what's next.

## Building and Running

### Setup
1. `npm install`
2. `cp .env.example .env` (configure `DATABASE_URL` and `AUTH_SECRET`, e.g. `npx auth secret`).
3. `npx prisma migrate dev`
4. `npx prisma db seed`

### Development
- `npm run dev`: starts the dev server (Turbopack).
- `npm run typecheck`: TypeScript compiler check, no emit.
- `npm run lint`: ESLint.
- `npx prisma studio`: opens the database GUI.
- `npx prisma db seed`: reseeds without dropping the schema (`prisma/seed.ts` deletes and recreates all rows).
- `npx prisma migrate reset`: full reset + reseed. Destructive — ask before running against a shared database.

### Test accounts (seed)
- Therapist: `cesar@pauta.clinic` / `clinicterapia123`
- Any patient (e.g. `lucia@pauta.clinic`): `paciente123`

## Development Conventions

### 1. Localization & Timezone
- **Fixed locale:** `es-NI`.
- **Fixed timezone:** `America/Managua` (UTC-6, no DST).
- **Rule:** ALWAYS format dates/times through `src/lib/datetime.ts` (`formatTimeManagua`, `formatWeekdayDateManagua`, `managuaDateTimeToUtc`, `todayInManagua`). Never use `Date.prototype.toLocaleString()`/`getHours()`/etc. without an explicit `timeZone`, and never rely on the server's local time or `TZ` env var — the whole point of this helper is to be immune to it.

### 2. Data Access & Security
- **Therapist isolation:** all clinical data MUST be scoped to `therapistId` (directly or via `patient.therapistId`). No query should omit that filter.
- **Roles:** `THERAPIST` (access to `/app/*`) and `PATIENT` (access to `/portal/*`), enforced by `src/middleware.ts`.
- **⚠️ Middleware location:** because the App Router lives under `src/app`, the middleware file MUST be at `src/middleware.ts`, not at the project root — Next.js silently ignores a root-level `middleware.ts` in this layout and the route protection just stops working with no error. If auth-gated routes stop redirecting, check this first.
- `AUTH_SECRET` must be a real generated value in `.env` — an empty string breaks JWT session creation/verification with no obvious error either.

### 3. UI & Design System
- **Components:** reusable UI primitives live in `src/components/ui/` (`Card`, `StatTile`, `StatusPill`, `Button`, `Eyebrow`, `Avatar`, `SectionHeader`, `EmptyState`).
- **Feature components:** grouped by domain, e.g. `src/components/agenda/`, `src/components/shell/` (the `AppShell` nav).
- **Design tokens:** CSS variables in `src/app/globals.css` (`--ct-primary`, `--ct-bg-page`, `--ct-rail-dark`, etc.), re-exposed as Tailwind utilities via `@theme inline`.
- **Visual reference:** the `/design` route renders every token and primitive for comparison against `assets/*.png` mockups.
- **Typography:** Outfit (headings), Inter (body), IBM Plex Mono (hours, eyebrows — uppercase + letter-spacing).
- **Responsive breakpoint:** the whole app (tab bar vs. rail, StatTile grid vs. mobile chips, side panels) hinges on Tailwind's `md:` (768px). Keep new responsive UI on that same breakpoint unless a spec says otherwise.

### 4. Spec-Driven Workflow
- Follow the roadmap in `specs/00-roadmap.md`.
- Before starting a new feature, confirm the corresponding spec's state means "Approved" (`Aprobado`).
- Implementation must strictly follow the spec's "Plan de implementación" and "Acceptance criteria" — flag disagreements as observations, don't silently deviate.
- When a spec's acceptance criteria are all verified, update its `Estado` to `Implementado` (see `specs/01-fundacion-design-system-y-acceso.md` for the pattern of checking off criteria with a short verification note).

## Project Structure

- `src/app/`: Next.js pages and layouts (`app/acceso`, `app/app/*` routes for the therapist, `app/api/auth` for Auth.js).
- `src/middleware.ts`: route protection — see the location warning above.
- `src/components/ui/`: shared UI primitives.
- `src/components/{agenda,shell}/`: feature-specific components.
- `src/lib/`: shared utilities — `prisma.ts` (client singleton), `auth.ts`/`auth.config.ts` (Auth.js), `datetime.ts` (Managua-fixed formatting), `adherence.ts` (routine adherence calculation).
- `prisma/`: `schema.prisma` (full MVP schema, several tables unused until later specs), `seed.ts`, `migrations/`.
- `specs/`: roadmap and per-feature specs (objective, scope, data model, plan, acceptance criteria, decisions).
- `assets/`: mockup PNGs used as the visual source of truth.
