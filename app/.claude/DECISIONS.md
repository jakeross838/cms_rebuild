# Architecture Decisions Log

> Significant technical decisions. Each entry explains context, options, and rationale.

---

## 2026-02-12 — Consolidate to 6-Phase / 50-Module Structure

**Context**: Project had evolved through multiple planning sessions with inconsistent phase numbering (8 MVP phases, 16+ post-MVP phases, enterprise phases 17-22, mobile phases 23-25). Confusing and duplicative.

**Decision**: Consolidated to 6 clean phases with 50 modules. Single authoritative source in root `CLAUDE.md`.

**Rationale**: One numbering system, one source of truth. Every module has a spec file (`docs/modules/XX-*.md`). Phases build on each other in order.

---

## 2026-02-12 — 7 Canonical Roles (Owner/Admin Split)

**Context**: Needed to define role hierarchy. Buildertrend research showed they split Owner and Admin in June 2025.

**Decision**: `owner > admin > pm > superintendent > office > field > read_only`
- Owner has billing/subscription access, Admin does not
- Old `accountant` role replaced by `office` with accounting permissions
- Custom roles inherit from a system role + add/remove permissions

**Rationale**: Matches industry standard. Solves Buildertrend pain point of no per-user overrides.

---

## 2026-02-12 — Full CRUD + Data Normalization as Platform Standard

**Context**: Materials come in named differently from every vendor. Same item has 4+ names. User needs to control naming, categories, and grouping everywhere.

**Decision**: Platform-wide standards:
1. Every list view supports full CRUD (add/edit/delete/sort/search/bulk)
2. Three-tier matching engine for all external inputs (exact → fuzzy → AI)
3. User-controlled taxonomy (never hardcode categories)
4. Soft delete only (archive with restore)

**Spec**: `docs/architecture/normalization-and-crud.md`

---

## 2026-02-12 — Multi-Tenant Data Isolation

**Decision**: Shared tables with `company_id` + Row Level Security (RLS)

**Rationale**: Supabase RLS is battle-tested, simpler than separate schemas, lower cost. Every tenant table has `company_id`, RLS policy, and filtered queries.

---

## 2026-02-12 — AI Processing Layer (Mandatory)

**Decision**: ALL data entering the system passes through AI extraction/normalization before storage. No raw input goes directly to tables.

**Spec**: `docs/architecture/ai-engine-design.md` Section 0

---

## 2026-02-12 — Permissions Mode (Open → Standard → Strict)

**Decision**: Three permission modes. V1 defaults to `open` (everyone sees everything). Infrastructure for `standard` and `strict` built from day 1 but not enforced until toggled.

**Rationale**: Lets builders start simple, tighten as they grow.

---

*Add new decisions above this line*
