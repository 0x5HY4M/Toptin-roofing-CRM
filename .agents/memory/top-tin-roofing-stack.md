---
name: Top Tin Roofing CRM Stack
description: Architecture and key file locations for the Top Tin Roofing CRM platform
---

## Stack
- Frontend: React + Vite at `artifacts/top-tin-roofing/` — preview path `/`
- Backend: Express 5 at `artifacts/api-server/` — port 8080, path `/api`
- DB: PostgreSQL + Drizzle ORM at `lib/db/`
- Auth: Clerk (`@clerk/react` client, `@clerk/express` server)
- API hooks: generated at `lib/api-client-react/src/generated/api.ts`

## Key files
- DB schema: `lib/db/src/schema/index.ts` exports all 11 tables
- API routes index: `artifacts/api-server/src/routes/index.ts`
- App entry: `artifacts/top-tin-roofing/src/App.tsx`
- Layout: `artifacts/top-tin-roofing/src/components/layout/` (shell.tsx, sidebar.tsx)

## Pages built
dashboard, leads (kanban), customers, projects, estimates, invoices, crew, schedule (calendar), tasks, materials, settings

## DB push command
`pnpm --filter @workspace/db run push`

**Why:** Schema is managed by Drizzle Kit with push strategy (no migration files).

## Seeded data
8 customers, 6 crew members, 7 projects, 10 leads, 6 invoices, 10 tasks, 12 materials, 6 calendar events, 8 activity logs
