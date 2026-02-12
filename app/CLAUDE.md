# Claude Code Project Instructions

> This file is automatically read when opening the project.
> It contains rules and context for autonomous development.

## Project: RossOS - Construction Management SaaS

Multi-tenant platform targeting 10,000+ companies and 1,000,000+ users.

## First: Read Context

**ALWAYS** start by reading these files:
1. `.claude/CONTEXT.md` - Current project state
2. `.claude/CURRENT_PHASE.md` - Active work
3. `.claude/RULES.md` - Autonomous operation rules

## Autonomous Operation Rules

### Auto-Commit Protocol

Commit after completing:
- Any database migration
- Any API endpoint (full CRUD)
- Any component/page
- Any bug fix
- Any defined task

**Before every commit:**
```bash
npm run lint && npm run typecheck && npm run build
```

### Commit Format
```
<type>(<scope>): <description>

[body]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Phase Management

1. Update `.claude/CURRENT_PHASE.md` when starting work
2. Check off tasks as completed
3. Update `.claude/CONTEXT.md` every 30 min or major milestone
4. Archive phase file when complete
5. Always push after phase completion

## Code Standards

### Multi-Tenant (CRITICAL)
- Every tenant table has `company_id`
- Every query filters by `company_id`
- RLS enabled on all tenant tables
- Cache keys include `company_id`

### TypeScript
- No `any` types
- Explicit return types
- Use `type` imports

### Components
- Follow patterns in existing code
- Use shadcn/ui components
- Tailwind for styling

### API
- Use `createApiHandler` wrapper
- Include rate limiting
- Validate with Zod

## Key Paths

```
/c/Users/Jake/cms_rebuild/app          # Project root
.claude/                                # Context files
src/app/(dashboard)/                    # Main app pages
src/app/(skeleton)/skeleton/            # Skeleton/preview pages
src/app/api/                           # API routes
src/components/                        # React components
src/lib/                               # Utilities
supabase/migrations/                   # SQL migrations
docs/                                  # Documentation
```

## Supabase

```
Project ID: yprbbomuhugtgyqmrnhr
Name: RossOS
```

## Quick Commands

```bash
# Development
npm run dev

# Validation (run before commit)
npm run validate

# Commit pattern
git add . && git commit -m "message" && git push
```

## When Stuck

1. Read relevant docs in `docs/standards/`
2. Check existing code for patterns
3. Document blocker in `.claude/BLOCKERS.md`
4. Ask user for guidance

## Session End Checklist

- [ ] All work committed
- [ ] `.claude/CONTEXT.md` updated
- [ ] `.claude/CURRENT_PHASE.md` updated
- [ ] Pushed to remote
- [ ] Created HANDOFF.md if work incomplete
