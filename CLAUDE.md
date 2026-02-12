# CLAUDE.md — Build Rules for RossOS Construction Intelligence Platform

## Project Overview

- **Stack:** Next.js 16 (App Router) + Supabase + Tailwind CSS v4 + TypeScript
- **App directory:** `app/` (all code, configs, and tests live here)
- **Source:** `app/src/` with `@/` path alias
- **Docs:** `docs/` — 50 module specs across 6 phases, architecture docs, gap tracker
- **Skeleton:** `app/src/app/(skeleton)/skeleton/` — UI prototype for all views

## Spec-Driven Development Workflow

**Every feature follows this loop. No exceptions.**

### 1. READ the spec first
- Check `docs/modules/` for the module spec
- Check `docs/specs/` and `docs/architecture/` for system-level requirements
- Check `docs/checklists/` for tracked gap items related to this feature
- Understand what "done" looks like BEFORE writing code

### 2. WRITE acceptance tests
- Create or update a test file in `tests/acceptance/` that encodes the spec requirements
- Each test should map to a specific plan requirement
- Tests should FAIL before implementation (red-green workflow)
- Include comments linking back to the source spec

### 3. BUILD the feature
- Write the minimum code to pass the acceptance tests
- Follow existing patterns in the codebase
- Keep changes focused — one feature per cycle

### 4. VALIDATE before moving on
Run ALL checks in this order:
```bash
cd app
npx tsc --noEmit                    # Type check
npx vitest run tests/acceptance/    # Plan adherence
npx vitest run tests/unit/          # Unit tests
npx vitest run tests/integration/   # Integration tests
```
**Do NOT move to the next task until all checks pass.**

### 5. E2E verify (when UI is involved)
```bash
npx playwright test tests/e2e/     # Browser tests
```

## Test Commands

```bash
# All Vitest tests (unit + integration + acceptance)
npm test

# Only acceptance tests (plan adherence)
npm run test:acceptance

# Only unit tests
npm run test:unit

# Only integration tests
npm run test:integration

# E2E browser tests
npm run test:e2e

# Type checking only
npm run test:types

# Full validation (types + all vitest + e2e)
npm run validate
```

## Test File Conventions

| Directory | Purpose | Runner |
|-----------|---------|--------|
| `tests/acceptance/` | Plan adherence — does it match the spec? | Vitest |
| `tests/unit/` | Individual functions, hooks, utils | Vitest |
| `tests/integration/` | Components with mocked data | Vitest |
| `tests/e2e/` | Browser flows against running app | Playwright |

### Naming
- Vitest: `*.test.ts` or `*.test.tsx`
- Playwright: `*.spec.ts`
- Name tests after the feature: `navigation.test.ts`, `leads.test.ts`

### Acceptance Test Template
```ts
import { describe, test, expect } from 'vitest'

/**
 * Acceptance tests for [Feature Name]
 * Source spec: docs/modules/[spec-file].md
 * Plan section: [which section of the plan this covers]
 */
describe('[Feature] Plan Adherence', () => {
  test('[specific requirement from spec]', () => {
    // Assert implementation matches plan
  })
})
```

## Code Conventions

- **Path alias:** Always use `@/` imports, never relative `../`
- **Components:** `app/src/components/` — organized by feature (skeleton/, ui/, layout/)
- **Config:** `app/src/config/` — data structures like navigation, feature flags
- **Types:** `app/src/types/` — shared TypeScript types
- **Lib:** `app/src/lib/` — utilities, Supabase clients
- **Styling:** Tailwind CSS utility classes, use `cn()` from `@/lib/utils` for conditional classes

## Key Architecture Decisions

- **Single unified nav bar** — `UnifiedNav` component detects context (company vs job) and transforms
- **Nav config is data-driven** — all nav items defined in `src/config/navigation.ts`
- **Job context detection** via `usePathname()` + `useParams()`
- **Skeleton mode** is a visual prototype — no real data, mock data only
- **Layouts nest:** (skeleton)/layout.tsx → skeleton/layout.tsx → jobs/[id]/layout.tsx

## Do NOT

- Skip the validation step — ever
- Write more than one feature before validating
- Change nav config without updating acceptance tests
- Add dependencies without checking if an existing one covers the need
- Create new files when editing an existing one would work
- Add error handling for impossible scenarios
- Over-abstract — three similar lines > a premature utility function
