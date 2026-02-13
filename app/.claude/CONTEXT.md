# Project Context — RossOS

> Read this at the START of every session.

## Current State

**Planning & skeletons complete. Backend not started.**

| Layer | Status |
|-------|--------|
| Module specs (50) | Done — `docs/modules/01-*.md` through `50-*.md` |
| Architecture docs (11) | Done — `docs/architecture/*.md` |
| Skeleton pages (93) | Done — `app/src/app/(skeleton)/skeleton/` |
| Preview components (65) | Done — `app/src/components/skeleton/previews/` |
| Navigation config | Done — `app/src/config/navigation.ts` |
| Gap tracker | Done — `docs/checklists/gap-tracker.json` (100+ items) |
| Database schema | NOT STARTED — no migrations applied |
| Authentication | NOT STARTED |
| API endpoints | NOT STARTED (only health check + docs API exist) |
| Real data integration | NOT STARTED — all pages use mock data |
| AI processing layer | NOT STARTED |
| Multi-tenancy / RLS | NOT STARTED |
| Tests | NOT STARTED |

## Build Order

6 phases, 50 modules. Build in order — each phase depends on the previous.

- **Phase 1 — Foundation** (M01-M06): Auth, config, data model, nav, notifications, file storage
- **Phase 2 — Construction Core** (M07-M12): Schedule, daily logs, budget, vendors, invoicing, client portal
- **Phase 3 — Financial Power** (M13-M19): AI invoicing, lien waivers, draws, QuickBooks, COs, POs, reporting
- **Phase 4 — Intelligence** (M20-M28): Estimating, selections, vendor scoring, pricing, AI docs, bids, RFIs, punch
- **Phase 5 — Full Platform** (M29-M40): Portals, warranty, permits, safety, HR, CRM, marketing, contracts, mobile
- **Phase 6 — Scale & Sell** (M41-M50): Onboarding, migration, billing, white-label, API, support, training

## Next Action

Start Phase 1, Module 01: Auth & Access Control
- Read spec: `docs/modules/01-auth-and-access.md`
- Create Supabase tables + RLS policies
- Build auth API endpoints
- Connect to skeleton pages

## Key Architecture Rules

See root `CLAUDE.md` for all rules. Key ones:
- Multi-tenant: every table has `company_id`, every query filters by it, RLS on everything
- Full CRUD on every list view
- All external inputs normalized through 3-tier matching engine
- User-controlled taxonomy (never hardcode categories)
- Soft delete only (archive with restore)
- AI processing layer for all data ingestion

## Supabase

```
Project ID:  yprbbomuhugtgyqmrnhr
Name:        RossOS
```

---

*Last Updated: 2026-02-12*
