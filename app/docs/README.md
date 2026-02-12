# RossOS Development Standards

> **Mission**: Build a scalable, maintainable multi-tenant construction management SaaS capable of serving 10,000+ companies and 1,000,000+ users.

## Quick Links

| Document | Purpose |
|----------|---------|
| [Code Standards](./standards/CODE_STANDARDS.md) | Naming, formatting, file organization |
| [Database Standards](./standards/DATABASE_STANDARDS.md) | SQL, migrations, RLS policies |
| [Component Standards](./standards/COMPONENT_STANDARDS.md) | React components, styling, UI patterns |
| [API Standards](./standards/API_STANDARDS.md) | Endpoints, responses, error handling |
| [Testing Standards](./standards/TESTING_STANDARDS.md) | Unit, integration, E2E testing |
| [Git Workflow](./standards/GIT_WORKFLOW.md) | Branching, commits, PRs, releases |

## Guides

| Guide | Purpose |
|-------|---------|
| [New Feature Guide](./guides/NEW_FEATURE.md) | Step-by-step feature development |
| [Bug Fix Guide](./guides/BUG_FIX.md) | Debugging and fix process |
| [Database Migration Guide](./guides/DATABASE_MIGRATION.md) | Creating and applying migrations |
| [Onboarding Guide](./guides/ONBOARDING.md) | New developer setup |

## Templates

| Template | Purpose |
|----------|---------|
| [Feature Spec](./templates/FEATURE_SPEC.md) | Planning new features |
| [PR Template](./templates/PULL_REQUEST.md) | Pull request checklist |
| [Bug Report](./templates/BUG_REPORT.md) | Bug documentation |

---

## Core Principles

### 1. Multi-Tenant First
Every piece of code must consider tenant isolation:
- All database queries filter by `company_id`
- All cache keys include `company_id`
- All API responses are scoped to the user's company
- Never expose data from other tenants

### 2. Type Safety
TypeScript is mandatory:
- No `any` types (use `unknown` and type guards)
- All function parameters and returns typed
- Database types auto-generated from Supabase
- Strict mode enabled

### 3. Consistent Patterns
Follow established patterns:
- One way to do each thing
- Copy existing patterns, don't invent new ones
- When in doubt, check existing code first

### 4. Security by Default
Security is not optional:
- RLS on every table
- Input validation on every endpoint
- Rate limiting on all APIs
- Audit logging for sensitive operations

### 5. Performance Aware
Build for scale from day one:
- Indexed queries only
- Pagination required for lists
- Caching where appropriate
- Lazy loading for heavy components

---

## Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes (login, signup)
│   │   ├── (dashboard)/       # Main app routes
│   │   ├── (skeleton)/        # UI Preview/skeleton pages
│   │   └── api/               # API routes
│   │
│   ├── components/            # React components
│   │   ├── ui/               # Base UI components (shadcn)
│   │   ├── forms/            # Form components
│   │   ├── tables/           # Table components
│   │   ├── charts/           # Chart components
│   │   └── [feature]/        # Feature-specific components
│   │
│   ├── lib/                   # Core libraries
│   │   ├── supabase/         # Supabase client
│   │   ├── cache/            # Caching utilities
│   │   ├── queue/            # Job queue
│   │   ├── rate-limit/       # Rate limiting
│   │   ├── monitoring/       # Logging, metrics
│   │   └── utils/            # General utilities
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript types
│   └── styles/                # Global styles
│
├── supabase/
│   └── migrations/            # Database migrations
│
├── tests/                     # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── docs/                      # Documentation
    ├── standards/
    ├── guides/
    └── templates/
```

---

## Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FEATURE WORKFLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PLAN          2. BUILD           3. TEST         4. SHIP    │
│  ─────────        ─────────          ─────────       ─────────  │
│  □ Spec doc       □ Database         □ Unit tests   □ PR review │
│  □ Design         □ API              □ Integration  □ QA test   │
│  □ Breakdown      □ Components       □ E2E          □ Deploy    │
│                   □ Integration                     □ Monitor   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

See [New Feature Guide](./guides/NEW_FEATURE.md) for detailed process.

---

## Quick Reference

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (utilities) | kebab-case | `format-date.ts` |
| Files (pages) | kebab-case | `user-settings/page.tsx` |
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserProfile` |
| Database tables | snake_case | `user_profiles` |
| Database columns | snake_case | `created_at` |
| API routes | kebab-case | `/api/user-profiles` |
| CSS classes | kebab-case | `user-profile-card` |
| Env variables | SCREAMING_SNAKE | `DATABASE_URL` |

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run typecheck        # TypeScript check

# Testing
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests only

# Database
npm run db:generate      # Generate types from Supabase
npm run db:migrate       # Apply migrations
npm run db:reset         # Reset local database
```
