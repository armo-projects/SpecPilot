# AGENTS.md

## Scope
- Keep diffs tight and limited to the requested change.
- Do not do unrelated refactors, renames, formatting-only edits, or cleanup.
- Preserve the current server/client split, export flows, and spec-generation flows unless the task requires changing them.
- Avoid committing incidental build or generated-file noise.

## Repo Shape
- `app/*`: App Router pages and API route handlers.
- `components/*`: UI and feature components. Add `"use client"` only when hooks or browser APIs are needed.
- `server/services/*`: business logic, Prisma access, OpenAI calls, and export/markdown assembly. Keep DB and external API work here, not in route handlers or client components.
- `lib/validations/*`: shared Zod schemas for request, query, and AI-output contracts.
- `types/*`: shared domain/API/export types.
- `prisma/*`: schema, migrations, and seed data.

## Conventions
- Use TypeScript and `@/` imports.
- Keep server-only modules marked with `import "server-only";` when they must not run on the client.
- Reuse shared Zod schemas at boundaries. Route handlers usually `parse(...)`; use `safeParse(...)` when validating persisted or AI-generated data that may fail without throwing.
- Keep Prisma-to-UI mapping in services. Do not leak raw Prisma payloads or JSON blobs directly into UI code.
- Preserve current naming patterns such as `*ForMockUser` service entry points while the app is still mock-auth based.
- API routes should return `NextResponse.json(...)`, handle `ZodError` as `400`, use `404` for missing resources, `409` for missing plan/prompt conflicts, and log unexpected failures with `console.error("Failed to ...", error)`.
- Prefer explicit service-layer error types for domain-specific failures when a route needs to map them cleanly.
- In client forms/actions, reuse shared schemas, keep local submit/error state, and use `sonner` to surface user-facing failures where the surrounding UI already does.
- Co-locate focused Vitest tests next to changed services/components with `*.test.ts` or `*.test.tsx`. The default Vitest environment is Node; add `// @vitest-environment jsdom` for DOM tests.

## Validation
- Use `pnpm` for repo commands.
- Main checks:
  - `pnpm test`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
- `pnpm check` runs the repo's combined lint/typecheck/build script.

## Final Response
- Summary of what changed
- Exact files changed
- Assumptions/defaults chosen
- Validation commands run and results
- Remaining risks, blockers, or follow-ups
