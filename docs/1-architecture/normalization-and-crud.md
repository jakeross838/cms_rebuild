# Architecture: Data Normalization, CRUD, and Fuzzy Matching

**Status:** Architectural Standard
**Applies to:** Every module that displays, collects, or processes entity data

---

## Core Principle

**Every list in the platform is editable. Every entity is searchable. Every external input is normalized to a user-controlled canonical name.**

This is not a feature — it's a platform behavior. Users control their taxonomy. The system adapts to how vendors, subs, and external sources name things.

---

## 1. Full CRUD Everywhere

Every list/table view in the platform MUST support:

| Capability | Implementation |
|-----------|---------------|
| **Create** | "Add" button in toolbar. Opens inline row or modal form. |
| **Read** | Default view. Sortable columns, filterable, searchable. |
| **Update** | Click cell to edit inline. Enter/blur to commit. Escape to cancel. |
| **Delete** | Soft delete (archived flag). Trash icon per row. Confirmation dialog for destructive actions. |
| **Sort** | Click column header to toggle asc/desc. Visual indicator on active sort. |
| **Search** | Single search bar filters across all visible columns. Fuzzy matching on text fields. |
| **Reorder** | Drag-and-drop reordering where display order matters (categories, phases, rooms). |
| **Bulk actions** | Multi-select checkbox + action bar (delete, archive, reassign, export). |

### Where CRUD Applies

**Full CRUD (add/edit/delete):**
- Materials catalog, cost codes, assemblies, templates
- Leads, estimates, proposals, contracts
- Jobs, tasks, selections, change orders
- Vendors, clients, contacts, team members
- Invoices, POs, draws, lien waivers
- Daily logs, punch items, RFIs, submittals
- Categories, rooms, phases, trades — any user-defined taxonomy

**Read + Edit only (no user create/delete):**
- AI processing logs, audit trails, activity logs
- System-generated notifications
- Calculated views (savings, analytics, forecasts)

**Read only:**
- Historical snapshots, archived records
- External data (commodity indices, regional benchmarks)

---

## 2. Master Item Normalization

### The Problem

The same real-world entity has different names depending on the source:

```
MATERIALS:
  Gulf Lumber:   "2X4 8' SPF STUD"
  84 Lumber:     "2x4x8 Stud Grade SPF"
  Home Depot:    "2 in. x 4 in. x 96 in. Stud"
  Invoice PDF:   "SPF STUD 2x4-8"
  Your budget:   "Framing - Studs"

VENDORS:
  QuickBooks:    "Island Plumbing LLC"
  Invoice:       "Island Plumbing Co."
  Sub's email:   "Island Plumbing"
  W-9:           "Island Plumbing & Mechanical LLC"

ROOMS:
  Architect:     "Primary Suite"
  Client:        "Master Bedroom"
  Sub:           "MBR"
  Your system:   "Owner's Suite"

COST CODES:
  QuickBooks:    "5100 - Framing Labor"
  Estimator:     "Framing"
  Sub invoice:   "Rough Framing"
```

### The Solution: Canonical Names + Alias Mapping

Every normalizable entity type follows the same pattern:

```
┌─────────────────┐     ┌──────────────────┐
│  External Input  │────>│  Matching Engine  │
│  (vendor name,   │     │  1. Exact cache   │
│   invoice text,  │     │  2. Fuzzy match   │
│   import data)   │     │  3. AI classify   │
└─────────────────┘     └────────┬─────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Canonical Master Item   │
                    │  (user-controlled name,  │
                    │   category, properties)  │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │  Alias Registry          │
                    │  vendor_id + raw_text →  │
                    │  master_item_id          │
                    │  (grows with every match)│
                    └─────────────────────────┘
```

### Entity Types That Need Normalization

| Entity | Why | Example |
|--------|-----|---------|
| **Materials** | Vendors name the same product differently | "2X4 8' SPF" vs "2x4x8 Stud Grade" |
| **Vendors/Contacts** | Same company appears with slight name variations | "Island Plumbing LLC" vs "Island Plumbing Co" |
| **Cost Codes** | Different systems use different code structures | "5100" vs "Framing Labor" vs "051000" |
| **Trades** | Subs describe their trade differently | "Electrician" vs "Electrical Contractor" vs "EC" |
| **Rooms/Locations** | Architects, clients, and subs use different names | "Primary Suite" vs "Master Bedroom" vs "MBR" |
| **Task Names** | Templates vs actual task names vary | "Rough Framing" vs "Frame Walls" vs "Framing" |
| **Document Types** | Uploaded files need classification | "invoice" vs "bill" vs "statement" |

### Three-Tier Matching Algorithm

Applied every time an external text needs to resolve to a canonical item:

**Tier 1: Cached Exact Match** (< 1ms)
- Check alias registry: `(source, raw_text) → canonical_id`
- If found with confidence >= 0.95: auto-match, no human review
- Cache hit rate improves over time (target: 90%+ after 500 matches)

**Tier 2: Fuzzy Match** (< 50ms)
- Compare against all known aliases using:
  - Levenshtein distance (edit distance)
  - Token-based similarity (word overlap)
  - Phonetic matching (Soundex/Metaphone)
  - Abbreviation expansion ("MBR" → "Master Bedroom")
- Score > 0.9: auto-match, record new alias
- Score 0.7-0.9: suggest match, queue for human confirmation
- Score < 0.7: pass to AI

**Tier 3: AI Classification** (< 2s)
- Send text + context to Claude for classification
- AI suggests: match to existing canonical item, OR create new item
- Confidence < 0.85: queue for human review
- After human confirms: record alias for future exact matches

### Human Review Queue

Items that can't be auto-matched go to a review queue:

```
┌────────────────────────────────────────────────────────────┐
│ Item Review Queue                                    3 new │
├────────────────────────────────────────────────────────────┤
│ "AZEK TIMBERTECH 1X6X20 MAHOGANY"     from Gulf Lumber    │
│   AI suggests: TimberTech Composite 1x6x20 → 72% conf     │
│   [Confirm]  [Edit & Confirm]  [Create New Item]  [Skip]  │
├────────────────────────────────────────────────────────────┤
│ "PELLA 250 DH 3060"                   from BuilderFirst   │
│   No match found                                           │
│   [Create New Item]  [Search Catalog]  [Skip]              │
└────────────────────────────────────────────────────────────┘
```

---

## 3. User-Controlled Taxonomy

### Categories Are Not Hardcoded

Categories, subcategories, and groupings are **user-defined**. The system suggests categories based on AI classification, but the user has final control.

**Rules:**
- Users can create, rename, merge, split, reorder, and delete categories
- When a category is deleted, items are moved to a parent or "Uncategorized"
- Category hierarchy supports up to 3 levels (category → subcategory → group)
- Display order is user-controlled (drag-and-drop), not alphabetical by default
- Categories are per-company (multi-tenant isolation)

### Where User-Controlled Taxonomy Applies

| Entity | Taxonomy Levels | Default Seed |
|--------|----------------|--------------|
| Materials | Category → Subcategory | Framing, Sheet Goods, Roofing, Concrete, etc. |
| Cost Codes | Division → Category → Code | CSI MasterFormat divisions |
| Vendors | Trade → Specialty | Electrical, Plumbing, HVAC, etc. |
| Tasks | Phase → Category | Pre-con, Rough, Finish, Closeout |
| Documents | Type → Subtype | Invoices, Contracts, Photos, Plans |
| Rooms | Floor → Room | 1st Floor, 2nd Floor → rooms within |
| Selections | Category → Subcategory | Flooring, Countertops, Fixtures, etc. |

### Organic Growth

Categories are seeded with sensible defaults but **grow organically** as data enters the system:

1. New invoice arrives with a material not yet categorized
2. AI suggests a category based on the item description
3. User confirms or changes the category
4. Category catalog grows naturally from real data
5. Over time, the builder's catalog reflects their actual purchasing patterns

---

## 4. Search Architecture

### Platform-Wide Search

Every list view has a search bar. Search behavior:

**Text fields:** Fuzzy matching with typo tolerance
- "drywal" matches "Drywall"
- "2x4 stud" matches "2x4x8 SPF Stud"
- "island plumb" matches "Island Plumbing LLC"

**Numeric fields:** Range-aware
- "$500" finds items near $500
- ">1000" finds items above $1,000

**Date fields:** Natural language
- "last week" / "this month" / "before March"

**Status/enum fields:** Exact match with autocomplete
- "act" → "active"

### Search Implementation

```
User types → Debounce (200ms) → Tokenize → Match per column:
  - Text: trigram similarity + prefix match
  - Number: range comparison
  - Enum: exact prefix match
  - Date: parsed natural language
→ Score & rank results → Display with match highlighting
```

### Global Search (Cmd+K)

In addition to per-list search, a global search (Cmd+K / Ctrl+K) searches across ALL entity types:
- Materials, vendors, jobs, clients, invoices, POs, tasks, documents
- Results grouped by entity type
- Recent searches preserved
- Keyboard navigation

---

## 5. Soft Delete & Archiving

**Nothing is truly deleted.** Every delete action is a soft delete:

```sql
-- Every deletable table has:
archived_at TIMESTAMPTZ DEFAULT NULL
archived_by UUID REFERENCES users(id)
```

- Active items: `WHERE archived_at IS NULL`
- Archived items visible in "Archive" view
- Restore from archive at any time
- Hard delete only after 90 days in archive (configurable)
- Audit trail records all archive/restore actions

---

## 6. Database Pattern

### Canonical Tables

Every normalizable entity type follows this schema pattern:

```sql
-- Master catalog (user-controlled canonical items)
CREATE TABLE master_{entity_type} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,                    -- canonical name (user-controlled)
  category TEXT,                         -- user-defined category
  subcategory TEXT,                      -- user-defined subcategory
  properties JSONB DEFAULT '{}',         -- entity-specific fields
  sort_order INTEGER DEFAULT 0,          -- user-controlled display order
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alias registry (maps external names to canonical items)
CREATE TABLE {entity_type}_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES master_{entity_type}(id),
  source TEXT NOT NULL,                  -- vendor_id, system name, import source
  raw_text TEXT NOT NULL,                -- the original external text
  match_method TEXT NOT NULL,            -- 'exact' | 'fuzzy' | 'ai' | 'manual'
  confidence DECIMAL(3,2) NOT NULL,      -- 0.00 to 1.00
  confirmed_by UUID REFERENCES users(id),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source, raw_text)
);

-- User-defined categories
CREATE TABLE {entity_type}_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES {entity_type}_categories(id),
  sort_order INTEGER DEFAULT 0,
  color TEXT,                            -- optional display color
  icon TEXT,                             -- optional icon identifier
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. UI Pattern Library

### Standard List View

Every list view follows this layout:

```
┌─────────────────────────────────────────────────────────────┐
│ [Search bar............] [Filters ▼] [Sort ▼] [+ Add New]  │
├─────────────────────────────────────────────────────────────┤
│ Category: [All] [Framing] [Roofing] [Electrical] ...        │
├──────┬──────────────┬──────────┬─────────┬──────┬──────────┤
│ ☐    │ Name ▼       │ Category │ Vendor  │ Cost │ Actions  │
├──────┼──────────────┼──────────┼─────────┼──────┼──────────┤
│ ☐    │ 2x4x8 SPF   │ Framing  │ Gulf    │ $3.85│ ✏️ 🗑️    │
│ ☐    │ 2x6x8 SPF   │ Framing  │ Gulf    │ $5.95│ ✏️ 🗑️    │
│ ☐    │ 3/4" CDX Ply │ Sheet    │ 84 Lbr  │ $52  │ ✏️ 🗑️    │
├──────┴──────────────┴──────────┴─────────┴──────┴──────────┤
│ ☐ Select all    [Archive Selected] [Export]    1-25 of 248  │
└─────────────────────────────────────────────────────────────┘
```

### Inline Edit Pattern

```
Click cell → Cell becomes editable input
  Text:     <input type="text" />
  Number:   <input type="number" /> with currency formatting
  Date:     <input type="date" />
  Boolean:  <input type="checkbox" />
  Enum:     <select> dropdown
  UUID:     Read-only (non-editable)

Enter/blur → Commit change (optimistic update)
Escape     → Cancel edit, revert to previous value
Tab        → Commit and move to next cell
```

### Fuzzy Match Indicator

When the system matches an external input to a canonical item:

```
┌──────────────────────────────────────────────┐
│ "2X4 8' SPF STUD"  →  2x4x8 SPF Stud  ✓ 97%│
│                        [matched via cache]    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ "AZEK COMP 1X6X20"  →  TimberTech 1x6x20 ?  │
│                        72% confidence         │
│          [Confirm] [Edit] [New Item] [Skip]   │
└──────────────────────────────────────────────┘
```

---

## 8. Rules for Implementation

1. **Every list view supports CRUD.** No read-only lists unless explicitly marked (audit logs, system events).
2. **Every text input from external sources goes through normalization.** Invoice line items, imported data, API inputs, vendor quotes.
3. **Users own the taxonomy.** Categories, labels, sort order — all user-controlled. Never hardcode categories.
4. **Fuzzy search is the default.** Exact match is a special case, not the norm.
5. **Soft delete only.** Nothing is permanently deleted without explicit user action + confirmation.
6. **The alias registry is append-only.** Every confirmed match creates a new alias entry for faster future matching.
7. **Confidence is visible.** When AI matches something, show the confidence score. Don't hide uncertainty.
8. **Human-in-the-loop for low confidence.** Below 85% confidence, queue for human review. Never silently accept a bad match.
9. **CRUD patterns are consistent.** Same keyboard shortcuts, same button placement, same edit behavior across all modules.
10. **Search is instant.** Debounce at 200ms, results appear as you type. No "search" button needed.
