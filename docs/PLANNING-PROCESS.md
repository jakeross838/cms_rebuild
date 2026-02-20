# BuildDesk Planning Process

**MANDATORY RULES FOR ALL FUTURE PLANNING**

This document defines the **required process** for all planning, feature additions, and documentation updates. Following this process is non-negotiable - it prevents documentation scatter and ensures everything stays organized.

---

## Core Principle: Clean As You Go

> **Every new idea must update existing documents, not create new scattered files.**

When you add something new, you MUST:
1. Update the relevant existing document(s)
2. Update INDEX.md if structure changes
3. Update UI previews if there's a UI component
4. Update FEATURE-IMPLEMENTATION-MASTER.md if it's a feature
5. Update BUILD_PLAN.md if it affects timeline/phases

---

## Document Hierarchy

```
MANDATORY UPDATE ORDER (Top to Bottom)

┌─────────────────────────────────────────────────────────┐
│  1. INDEX.md                                            │
│     └── Update if: New docs created, structure changed  │
├─────────────────────────────────────────────────────────┤
│  2. FEATURE-IMPLEMENTATION-MASTER.md                    │
│     └── Update if: Any feature added/changed            │
│     └── Contains: All DB schemas, all features          │
├─────────────────────────────────────────────────────────┤
│  3. BUILD_PLAN.md                                       │
│     └── Update if: Timeline, phases, or scope changes   │
├─────────────────────────────────────────────────────────┤
│  4. Specific Feature Doc (2-features/FEATURE-*.md)      │
│     └── Update if: Detailed feature changes             │
│     └── Only create new if: Major new feature category  │
├─────────────────────────────────────────────────────────┤
│  5. Module Doc (3-modules/##-*.md)                      │
│     └── Update if: Module specification changes         │
├─────────────────────────────────────────────────────────┤
│  6. UI Preview Component (app/src/components/skeleton/) │
│     └── Update if: Any UI-facing feature added          │
├─────────────────────────────────────────────────────────┤
│  7. UI Page Spec (4-ui/page-specs/*.md)                 │
│     └── Update if: Page behavior or data changes        │
└─────────────────────────────────────────────────────────┘
```

---

## The 7-Step Planning Checklist

**EVERY planning session MUST complete these steps:**

### Step 1: Check If Document Exists
Before creating ANY new document:
- [ ] Search `docs/` for existing coverage
- [ ] Check `INDEX.md` for related documents
- [ ] Check `FEATURE-IMPLEMENTATION-MASTER.md` for feature coverage

**Rule:** If a document covers 50%+ of your topic, UPDATE IT instead of creating new.

### Step 2: Update Primary Documents
For EVERY change, update these in order:

- [ ] **FEATURE-IMPLEMENTATION-MASTER.md** - Add/update feature entry
  - Database tables (with full schema)
  - Implementation priority
  - Dependencies

- [ ] **INDEX.md** - Update if:
  - New document created
  - Document moved
  - New category added

- [ ] **BUILD_PLAN.md** - Update if:
  - New phase needed
  - Timeline affected
  - Dependencies changed

### Step 3: Update or Create Feature Doc
- [ ] If feature fits existing `2-features/FEATURE-*.md` → **UPDATE IT**
- [ ] If truly new category → Create `2-features/FEATURE-[NAME].md`
- [ ] Include: Database schemas, API specs, business rules

### Step 4: Update Module Doc
- [ ] Find relevant module in `3-modules/##-*.md`
- [ ] Add new functionality to existing module spec
- [ ] Update data fields, workflows, integrations

### Step 5: Create/Update UI Preview
- [ ] If feature has UI → Create or update preview component
- [ ] Location: `app/src/components/skeleton/previews/`
- [ ] Create route: `app/src/app/(skeleton)/skeleton/[feature]/page.tsx`

### Step 6: Update UI Page Specs
- [ ] Find relevant page spec in `4-ui/page-specs/`
- [ ] Add new fields, actions, behaviors
- [ ] Update wireframes/mockups if needed

### Step 7: Verify Completeness
- [ ] Run this checklist:
  ```
  ✓ INDEX.md reflects change?
  ✓ FEATURE-IMPLEMENTATION-MASTER.md has schemas?
  ✓ Module doc updated?
  ✓ UI preview exists/updated?
  ✓ Page spec updated?
  ✓ No orphan documents created?
  ```

---

## Document Locations (FIXED - Do Not Deviate)

| Type | Location | Naming Convention |
|------|----------|-------------------|
| Master Index | `docs/INDEX.md` | - |
| Feature Master | `docs/2-features/FEATURE-IMPLEMENTATION-MASTER.md` | - |
| Feature Details | `docs/2-features/FEATURE-*.md` | FEATURE-[NAME].md |
| Module Specs | `docs/3-modules/##-*.md` | ##-[name].md |
| Architecture | `docs/1-architecture/*.md` | lowercase-with-dashes.md |
| AI Architecture | `docs/1-architecture/ai/*.md` | lowercase-with-dashes.md |
| UI Page Specs | `docs/4-ui/page-specs/*.md` | lowercase-page-name.md |
| UI Previews | `app/src/components/skeleton/previews/*.tsx` | feature-name-preview.tsx |
| Preview Routes | `app/src/app/(skeleton)/skeleton/[feature]/page.tsx` | page.tsx |
| Research | `docs/5-research/*.md` | lowercase-with-dashes.md |
| Checklists | `docs/6-checklists/*.md` | lowercase-with-dashes.md |
| Active Tasks | `docs/_tasks/*.md` | lowercase-with-dashes.md |
| Archived Docs | `docs/_archive/` | Original names |

---

## When to Create vs Update

### CREATE NEW DOCUMENT ONLY IF:
1. ✅ It's a completely new feature category (not covered anywhere)
2. ✅ The existing doc would exceed 3000 lines with your additions
3. ✅ It's a new module (51+) not in the 01-50 plan

### UPDATE EXISTING DOCUMENT IF:
1. ✅ Topic is partially covered (even 10% overlap)
2. ✅ It's an enhancement to existing feature
3. ✅ It's additional schemas for existing category
4. ✅ It's compliance/regulatory additions to existing feature

---

## Research-to-Documentation Flow

When conducting research (like NotebookLM deep dives):

```
Research Findings
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 1. Create RESEARCH-[TOPIC].md in docs/5-research/    │
│    - Raw findings, sources, recommendations          │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 2. Update FEATURE-IMPLEMENTATION-MASTER.md           │
│    - Add new tables, update counts                   │
│    - Add implementation phases                       │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 3. Update or Create 2-features/FEATURE-*.md          │
│    - Full database schemas                           │
│    - Business logic                                  │
│    - API specifications                              │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 4. Create UI Preview Component                       │
│    - Visual mockup of feature                        │
│    - Interactive demo                                │
└──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────┐
│ 5. Update INDEX.md                                   │
│    - Add new docs to index                           │
│    - Update statistics                               │
└──────────────────────────────────────────────────────┘
```

---

## Pre-Planning Prompt

**Copy this prompt before ANY planning session:**

```
PLANNING SESSION RULES:
1. I will NOT create scattered documentation
2. I will UPDATE existing docs before creating new ones
3. I will follow the 7-Step Planning Checklist
4. I will update these documents in order:
   - FEATURE-IMPLEMENTATION-MASTER.md
   - INDEX.md (if structure changes)
   - Relevant FEATURE-*.md
   - Relevant module doc
   - UI preview component
   - Page specs
5. At the end, I will verify the checklist is complete
```

---

## Anti-Patterns (DO NOT DO)

### ❌ BAD: Creating scattered files
```
docs/new-idea.md
docs/another-thought.md
docs/compliance-notes.md
docs/random-research.md
```

### ✅ GOOD: Updating existing structure
```
docs/2-features/FEATURE-IMPLEMENTATION-MASTER.md  ← Add feature here
docs/2-features/FEATURE-COMPLIANCE-BILLING.md     ← Add compliance details here
docs/5-research/RESEARCH-FINDINGS.md              ← Add research here
```

### ❌ BAD: Creating one-off feature docs
```
docs/lien-waivers.md
docs/certified-payroll.md
docs/overhead-allocation.md
```

### ✅ GOOD: Consolidating into categories
```
docs/2-features/FEATURE-COMPLIANCE-BILLING.md     ← Contains ALL: lien waivers, certified payroll, AIA billing
docs/2-features/FEATURE-JOB-COSTING-ENHANCED.md   ← Contains ALL: overhead, burden, bonuses, WIP
```

---

## Session End Checklist

**Run this at the END of every planning session:**

```markdown
## Planning Session Verification

### Documents Updated
- [ ] FEATURE-IMPLEMENTATION-MASTER.md updated with new schemas/features
- [ ] INDEX.md updated if any docs added/moved
- [ ] BUILD_PLAN.md updated if timeline affected

### Feature Documentation
- [ ] New features added to existing FEATURE-*.md (not new files)
- [ ] Database schemas included with all fields
- [ ] Business rules documented

### UI Components
- [ ] UI preview component created/updated
- [ ] Preview route page created
- [ ] Page specs updated in 4-ui/page-specs/

### No Orphans
- [ ] No standalone markdown files created at root
- [ ] No duplicate content across documents
- [ ] All new docs registered in INDEX.md

### Statistics Updated
- [ ] Table counts in FEATURE-IMPLEMENTATION-MASTER.md correct
- [ ] File counts in INDEX.md correct
```

---

## Enforcement

This process is enforced by:

1. **INDEX.md** - Master index that must reflect all docs
2. **This document** - Referenced at start of planning sessions
3. **Session End Checklist** - Run after every planning session
4. **Code Review** - Check for doc scatter in PRs

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────┐
│                 PLANNING QUICK REFERENCE               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  NEW FEATURE?                                          │
│  → Update FEATURE-IMPLEMENTATION-MASTER.md             │
│  → Update/Create FEATURE-*.md (consolidate!)           │
│  → Create UI preview + route                           │
│  → Update module doc                                   │
│  → Update INDEX.md                                     │
│                                                        │
│  NEW RESEARCH?                                         │
│  → Create 5-research/RESEARCH-[TOPIC].md               │
│  → Extract findings into existing feature docs         │
│  → Update FEATURE-IMPLEMENTATION-MASTER.md             │
│                                                        │
│  NEW MODULE?                                           │
│  → Only if truly new (51+)                             │
│  → Add to 3-modules/##-[name].md                       │
│  → Update INDEX.md                                     │
│                                                        │
│  NEVER:                                                │
│  → Create random root-level docs                       │
│  → Create one-off feature files                        │
│  → Leave docs unindexed                                │
│  → Skip UI preview for UI features                     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

*This document is MANDATORY for all planning sessions.*
*Last Updated: February 2026*
