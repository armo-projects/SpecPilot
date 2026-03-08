# SpecPilot

SpecPilot is an AI planning and handoff layer that turns rough product requests into structured execution-ready specs.

## One-Line Pitch

Paste a feature request, generate a validated technical plan, then copy/export it for human implementation or AI coding tools.

## What V2 Adds

- Handoff actions on spec detail pages:
  - Copy full plan
  - Copy selected sections
  - Export Markdown
  - Open Print/PDF view
- Export mode presets with selectable sections.
- Canonical export renderer (single markdown source for copy, download, and print/PDF flows).
- Print-friendly route for browser `Print / Save as PDF`.

## Core Features

- Create, edit, and manage specs.
- AI generation with OpenAI Responses API + structured outputs.
- Typed validation of request payloads and AI output.
- Versioned plans (`v1`, `v2`, ...).
- Generation run telemetry (status, tokens, latency).
- Handoff/export workflows designed for reuse in downstream tools.

## Export Modes

| Mode | Purpose | Default sections |
| --- | --- | --- |
| `human` | Full engineering spec for review and implementation | All sections |
| `codex_ready` | Implementation-oriented prompt for AI coding tools | Product request, context, requirements, assumptions, tasks, schema, API, edge cases, tests, risks |
| `compact_brief` | Fast execution brief | Summary, requirements, tasks, API, tests, risks |

Supported formats from API:

- `markdown` (`.md` download)
- `text` (plain text payload derived from canonical markdown)

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style component primitives
- Prisma ORM
- PostgreSQL (Docker local)
- Zod
- OpenAI Node SDK (Responses API)
- React Markdown + remark-gfm (print view rendering)
- Sonner (toasts)

## Architecture Overview

- `app/*`: pages and route handlers.
- `components/*`: reusable UI + feature components.
- `server/services/*`: business logic (spec CRUD, AI generation, export rendering/services).
- `lib/validations/*`: Zod schemas for input and contracts.
- `types/*`: shared domain/API/export types.
- `prisma/*`: schema, migrations, seed.

Export flow:

1. UI captures mode + selected sections.
2. Export API or print route validates query via shared export schema.
3. Server export service fetches spec and latest plan.
4. Canonical markdown renderer generates deterministic artifact.
5. Artifact is reused for:
   - clipboard copy
   - markdown download
   - print/PDF rendering

## Folder Structure (Key Areas)

```txt
app/
  (app)/
    specs/[id]/
  (print)/
    specs/[id]/print/
  api/specs/[id]/
    export/
    generate/
components/
  specs/
    spec-handoff-actions.tsx
    spec-export-options.tsx
    spec-print-document.tsx
    spec-print-toolbar.tsx
server/services/
  spec-export.renderer.ts
  spec-export.service.ts
  spec-export.templates.ts
lib/validations/
  export.schema.ts
types/
  export.ts
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

Copy `.env.example` to `.env`:

```bash
# macOS/Linux
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Yes | Public app name used in UI. |
| `NODE_ENV` | Yes | Runtime environment. |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma. |
| `OPENAI_API_KEY` | Yes (for generation/export-ready data) | Key used for AI plan generation. |
| `OPENAI_MODEL` | Yes | Model used by generation service (default `gpt-4.1-mini`). |
| `MOCK_USER_EMAIL` | Yes | Single-user identity for MVP/V2 flow. |

## Database Setup

```bash
pnpm db:up
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
```

Useful commands:

- `pnpm prisma:studio`
- `pnpm db:logs`
- `pnpm db:down`

## Run App

```bash
pnpm dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/dashboard`

## Handoff/Export Workflow

1. Open a generated spec detail page.
2. Choose export mode and section selection.
3. Use one of:
   - `Copy Full Plan`
   - `Copy Selected`
   - `Export Markdown`
   - `Open PDF View`
4. In print view, click `Print / Save as PDF`.

Notes:

- At least one section must remain selected.
- Mode defaults can be restored from the export options panel.
- Missing plan/generating states disable handoff actions with clear guidance.

## Export API Usage

### Route

`GET /api/specs/:id/export`

### Query Params

- `mode`: `human | codex_ready | compact_brief`
- `format`: `markdown | text`
- `sections`: comma-separated section keys or repeated query entries

### Example

```bash
curl "http://localhost:3000/api/specs/<SPEC_ID>/export?mode=codex_ready&format=markdown&sections=summary,requirements,frontend_tasks"
```

### Response Behavior

- `markdown`:
  - `Content-Type: text/markdown`
  - `Content-Disposition: attachment; filename="...md"`
- `text`:
  - `Content-Type: text/plain`

Error statuses:

- `400` invalid query
- `404` spec not found
- `409` missing generated plan

## Print/PDF Flow

- Print route: `/specs/:id/print?mode=...&sections=...`
- Uses the same canonical markdown export path as API/download/copy.
- Toolbar is hidden in print media.
- Browser-native print dialog is used for PDF generation.

## Demo Script

1. Create a spec from `/specs/new`.
2. Generate a plan.
3. Open detail page.
4. Switch between `Human`, `Codex-Ready`, and `Compact Brief`.
5. Copy selected sections.
6. Export markdown.
7. Open PDF view and save as PDF.

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Or run all:

```bash
pnpm check
```

## Known Limitations

- Authentication is mock single-user (`MOCK_USER_EMAIL`).
- PDF generation is browser print-based (no server-side PDF binary generation).
- Export content quality still depends on AI generation quality.
- No automated end-to-end suite yet; verification is currently static checks + manual flow tests.

## Future Improvements

- Real auth and multi-user accounts.
- Workspace/team sharing.
- Generation diff and comparison view.
- Saved export presets per user.
- Optional background jobs for long-running generations.
