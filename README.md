# SpecPilot

SpecPilot is an AI-powered planning assistant that transforms feature requests into structured technical implementation plans.

## One-Line Pitch

Paste a product request, and SpecPilot generates a validated, versioned engineering plan you can review, edit, and regenerate.

## Features

- Modern Next.js App Router frontend with polished dashboard and spec detail UX.
- Create, view, and update specs with typed request validation.
- AI generation using OpenAI Responses API with strict structured output schema.
- Server-side Zod validation of AI output with one retry on schema failure.
- Versioned plans (`v1`, `v2`, ...) per spec with generation run history.
- Status-driven workflow: `DRAFT`, `GENERATING`, `COMPLETED`, `FAILED`.
- Failure-safe persistence: invalid AI output never corrupts stored plan data.
- Local PostgreSQL via Docker + Prisma ORM + seedable mock user.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style component baseline
- Prisma ORM
- PostgreSQL (Docker local)
- Zod
- OpenAI Node SDK (Responses API, Structured Outputs)
- Sonner (toasts)

## Architecture Overview

- `app/*`: Pages and API route handlers.
- `components/*`: UI building blocks and feature components.
- `server/services/*`: Server-only business logic for specs and AI generation.
- `server/auth/*`: Mock user provider for single-user MVP flow.
- `lib/*`: Shared runtime utilities (env, db, openai, formatting, validation).
- `prisma/*`: Database schema, migrations, and seed script.
- `types/*`: Shared domain and API shape types.

Data flow (generation path):

1. User creates or regenerates a spec from UI/API.
2. Route handler calls server service.
3. Service builds prompt and calls OpenAI Responses API with strict schema format.
4. Output is JSON-parsed and validated by Zod.
5. On success: `SpecPlan` + `GenerationRun(SUCCEEDED)` are persisted and spec marked `COMPLETED`.
6. On failure: generation run is recorded as `FAILED`, spec marked `FAILED`, and UI shows actionable retry feedback.

## Folder Structure Summary

```txt
app/
  (app)/
    dashboard/
    specs/
      new/
      [id]/
  api/
    health/
    specs/
      [id]/
        generate/
components/
  layout/
  specs/
  ui/
lib/
  validations/
prisma/
  migrations/
server/
  auth/
  services/
types/
```

## Local Setup

### Prerequisites

- Node.js 20+
- Corepack enabled (`corepack enable`)
- Docker Desktop (or Docker Engine)

### Install

```bash
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
# macOS/Linux
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Yes | Public app name shown in UI. |
| `NODE_ENV` | Yes | Runtime environment (`development` locally). |
| `DATABASE_URL` | Yes | Prisma PostgreSQL connection string. |
| `OPENAI_API_KEY` | Required for generation | API key used by `/api/specs` and `/api/specs/:id/generate` generation path. |
| `OPENAI_MODEL` | Yes | Model name used by generation service (default: `gpt-4.1-mini`). |
| `MOCK_USER_EMAIL` | Yes | Single-user identity for MVP flows and seed. |

## Database Setup

Start local Postgres:

```bash
pnpm db:up
```

Generate Prisma client:

```bash
pnpm prisma:generate
```

Run migrations (local dev):

```bash
pnpm db:migrate
```

Seed demo user:

```bash
pnpm db:seed
```

Optional:

- Open Prisma Studio: `pnpm prisma:studio`
- Stop DB: `pnpm db:down`
- View DB logs: `pnpm db:logs`

## Run The App

```bash
pnpm dev
```

Open:

- `http://localhost:3000/` (landing)
- `http://localhost:3000/dashboard`
- `http://localhost:3000/api/health`

## Migrations and Deployment Notes

- Create/apply local migration: `pnpm db:migrate`
- Apply existing migrations in deploy environment: `pnpm db:migrate:deploy`
- Reset local database (destructive): `pnpm db:reset`

## AI Generation (High Level)

SpecPilot builds a practical prompt from:

- title
- raw product request
- optional context
- priority

It then calls OpenAI Responses API with a strict JSON schema contract for:

- summary
- requirements
- assumptions
- frontend tasks
- backend tasks
- database schema proposal
- API endpoint suggestions
- edge cases
- test cases
- risks

The response is validated server-side with Zod. If invalid, one corrective retry is attempted. Only valid structured output is persisted as `SpecPlan`.

## Demo Flow

1. Open `/dashboard`.
2. Click `Create Spec`.
3. Enter:
   - Title: `Invoice extraction MVP`
   - Prompt: `Users should upload invoices and extract line items automatically.`
   - Context: `MVP scope only`
4. Submit and wait for generation.
5. Open detail page to inspect:
   - plan sections
   - latest generation telemetry
   - version history
6. Click `Regenerate Plan` to create `v2`.
7. Edit input and save changes, then regenerate again.

## Quality Checks

Run all release-readiness checks:

```bash
pnpm check
```

Or individually:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## API Surface (MVP)

- `GET /api/health`
- `GET /api/specs`
- `POST /api/specs`
- `GET /api/specs/:id`
- `PATCH /api/specs/:id`
- `POST /api/specs/:id/generate`

## Screenshots

Add project screenshots here before publishing:

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/spec-detail.png`
- `docs/screenshots/generation-failure.png`

Example markdown:

```md
![Landing](docs/screenshots/landing.png)
![Dashboard](docs/screenshots/dashboard.png)
![Spec Detail](docs/screenshots/spec-detail.png)
```

## Known Limitations

- Uses mock single-user identity (`MOCK_USER_EMAIL`), no full auth yet.
- No team collaboration or workspaces in MVP.
- No RAG/document ingestion.
- Structured output quality still depends on model behavior and prompt quality.
- No automated integration test suite yet (manual and type/lint/build checks are in place).

## Future Improvements

- Real authentication and user sessions.
- Team workspaces and access control.
- Plan diff/compare UI between versions.
- Export plans to Markdown/PDF.
- Prompt templates by use-case.
- Context file upload and RAG over product docs.
- Background job queue for long-running generation.
- Observability dashboards for generation quality and latency.
