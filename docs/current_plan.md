# Current Execution Plan

**Status**: 🟡 In Progress - Handing off to Claude Code
**Goal**: Execute Foundation Hardening (Phase 0C) and Code Quality Hardening (Phase 0D)

This document is the bridge between **Gemini** (The Planner) and **Claude Code** (The Executor).

## Instructions for Claude Code
Please execute the following tasks sequentially. Once all tasks are checked off, update the Status above to "🟢 Completed" and summarize the specific changes made. Halt and request intervention if you run into any build or typechecking errors that you cannot quickly resolve.

> **Execution Command**:
> `claude --dangerously-skip-permissions -p "execute docs/current_plan.md"`

## Task List

### Phase 0C: Foundation Hardening

- [ ] **0C.1 Core Table Migrations (`supabase/migrations/*`)**:
  - Add `deleted_at TIMESTAMPTZ DEFAULT NULL` to the `companies`, `clients`, `jobs`, `vendors`, `invoices`, `draws`, and `cost_codes` tables via a new Supabase migration.
  - Add a partial index `WHERE deleted_at IS NULL` on `company_id` for each of these tables.
  - Add an `updated_at` trigger to any of these tables that do not currently have one.
  - Adjust RLS Policies via migration:
    - Drop `FOR DELETE` policies on: `clients`, `jobs`, `vendors`, `invoices`, `draws`.
    - Change existing `FOR SELECT` policies to append `AND deleted_at IS NULL`.
    - Add `FOR UPDATE` policies that restrict modifying `deleted_at` to authorized roles (e.g., owner/admin).
  - Add a SQL comment about moving to JWT-based `company_id` optimization in the future.

- [ ] **0C.2 Environment Variable Validation (`src/lib/env.ts`)**:
  - Rename any references to `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.example`, `.env.local` (if exists), and all code files.
  - Create `src/lib/env.ts`. Use Zod to define a schema and validate all required environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` for server).
  - Ensure the app fails fast at startup if these are missing.
  - Update `server.ts`, `client.ts`, `middleware.ts`, and `createApiHandler` (or any equivalent auth init logic) to import from `src/lib/env.ts` instead of `process.env`.

- [ ] **0C.3 Optimize Supabase Client Initialization (`src/lib/api/middleware.ts` or equivalent API route middleware)**:
  - Find `createApiHandler`. Ensure a single Supabase client instance is instantiated per API request and reused for both auth checks and permission validations. 

- [ ] **0C.4 SSR Prefetch Pattern (`(authenticated)/layout.tsx`)**:
  - Create `src/lib/query/get-query-client.ts` as a factory returning a new QueryClient instance.
  - In `src/app/(authenticated)/layout.tsx`, wrap the children with `<HydrationBoundary state={dehydrate(queryClient)}>` to pass data from Server Components to Client Components.
  - Pre-fetch global data if applicable (e.g., auth user state).

- [ ] **0C.5 Missing Loading / Unauthorized States**:
  - Create `src/app/loading.tsx` using a branded skeleton or spinner.
  - Create `src/app/(authenticated)/loading.tsx`.
  - Create `src/app/unauthorized.tsx` calling Next.js `unauthorized()` styled 401 page.

### Phase 0D: Code Quality Hardening

- [ ] **0D.1 Supabase Types & "as any" Purge**:
  - Run `npx supabase gen types typescript --local > src/types/database.types.ts` (adjust path as needed) to sync the latest schema.
  - Eliminate all `as any` or `as unknown as` assertions across the codebase.
  - Examples found in: `src/app/(authenticated)/jobs/new/page.tsx`, `src/app/(authenticated)/jobs/page.tsx`, `src/lib/monitoring/index.ts`, `src/lib/queue/index.ts`, `src/app/api/v1/users/route.ts`.

- [ ] **0D.2 Explicit Types for Functions & Error Handlers**:
  - Add explicit return types to exported functions (e.g., `createLogger()`, `registerJobHandler()`, `extractFrontmatter()`).
  - Add a utility function `getErrorMessage(error: unknown): string` in a `utils` file and use it to strictly type any untyped `catch (error)` parameters throughout the `src/` directory.

- [ ] **0D.3 Centralize Magic Constants**:
  - Identify magic arrays/objects (like `US_STATES` or `CONTRACT_TYPES` currently hardcoded in `jobs/new/page.tsx`).
  - Move these constants into a new `src/config/constants.ts` file, and import them where needed.

- [ ] **0D.4 Barrel Exports**:
  - Create `index.ts` in `src/components/ui/` and export all files within.
  - Create `index.ts` in `src/components/layout/` and export all files within.
  - Add `export * from './roles'` and `export * from './users'` to `src/lib/validation/schemas/index.ts`.

- [ ] **0D.5 Dead Code**:
  - Remove empty attributes or blatantly unused imports across `src/app`.

### Verification

- [ ] Run `npx tsc --noEmit` and confirm zero errors.
- [ ] Run `npx vitest run tests/acceptance/` and confirm all tests pass.
- [ ] Perform a simple local build `npm run build` to confirm the application bundle packages correctly.
