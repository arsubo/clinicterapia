# ClinicTerapia — Project Instructions

This is **generic** management software for physiotherapy practices — it is not built around, owned by, or named after any single clinic or therapist. It centralizes the daily agenda, clinical records, symptom tracking, and home exercise routines.

The seed data (`prisma/seed.ts`) models one example therapist, César Fonseca, and his patients. He is a **user** of the software in the dev/demo dataset, not its owner — don't frame docs, comments, or UI copy as if the product belongs to him. The software is owned and developed by **Arnoldo Suárez — Dev&Arch**.

## Project Overview

- **Core Purpose:** Streamline clinic operations and patient follow-up.
- **Tech Stack:**
  - **Frontend:** Next.js 15 (App Router), TypeScript.
  - **Styling:** Tailwind CSS v4 (using CSS variables for design tokens).
  - **Database:** Prisma ORM with PostgreSQL (Neon).
  - **Auth:** Auth.js v5 (NextAuth) with Credentials provider and JWT sessions.
- **Architecture:** Spec-driven development. Features are defined in `specs/` before implementation.

## Building and Running

### Setup
1.  `npm install`
2.  `cp .env.example .env` (Configure `DATABASE_URL` and `AUTH_SECRET`).
3.  `npx prisma migrate dev`
4.  `npx prisma db seed`

### Development
-   `npm run dev`: Starts the development server.
-   `npm run typecheck`: Runs TypeScript compiler check.
-   `npm run lint`: Runs ESLint.
-   `npx prisma studio`: Opens the database GUI.

## Development Conventions

### 1. Localization & Timezone
-   **Fixed Locale:** `es-NI`.
-   **Fixed Timezone:** `America/Managua` (UTC-6, no DST).
-   **Rule:** ALWAYS use `src/lib/datetime.ts` for date/time handling. Never rely on the system's local time or plain `new Date()` without considering the Managua offset.

### 2. Data Access & Security
-   **Therapist Isolation:** All clinical data MUST be scoped to a `therapistId`. Queries should always include this filter.
-   **Roles:** Two roles: `THERAPIST` (access to `/app/*`) and `PATIENT` (access to `/portal/*`). Protected via `middleware.ts`.

### 3. UI & Design System
-   **Components:** Reusable UI primitives are located in `src/components/ui/`.
-   **Design Tokens:** Defined as CSS variables in `src/app/globals.css` (e.g., `--ct-primary`, `--ct-bg-page`).
-   **Visual Reference:** Use the `/design` route to verify component styles against project tokens.
-   **Typography:** Outfit (titles), Inter (body), IBM Plex Mono (technical data/hours).

### 4. Spec-Driven Workflow
-   Follow the roadmap in `specs/00-roadmap.md`.
-   Before starting a new feature, ensure the corresponding spec is "Approved".
-   Implementation should strictly adhere to the "Acceptance criteria" in the spec.

## Project Structure

-   `src/app/`: Next.js pages and layouts.
-   `src/components/ui/`: Shared UI components.
-   `src/lib/`: Shared utilities (Prisma client, Auth config, DateTime helpers).
-   `prisma/`: Database schema and seed scripts.
-   `specs/`: Detailed technical specifications and roadmap.
-   `assets/`: Mockups and design references.
