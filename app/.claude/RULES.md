# Autonomous Build Rules

> All rules are now consolidated in the root `CLAUDE.md`.
> This file is kept for backward compatibility but the root file is the source of truth.

See: `../../CLAUDE.md`

## Quick Reference

### Per-Feature Loop
1. Read the spec (`docs/modules/XX-*.md`)
2. Write acceptance tests (red-green)
3. Build minimum code to pass tests
4. Validate: `tsc` → acceptance → unit → integration
5. E2E verify if UI involved
6. Commit

### Before Every Commit
```bash
cd app && npm run validate
```

### Multi-Tenant (every table)
- `company_id` column
- RLS policy
- Query filter
- Cache key includes `company_id`

### Do NOT
- Skip validation
- Hardcode categories
- Hard delete anything
- Accept raw external input without normalization
- Use `any` types
- Commit broken code
