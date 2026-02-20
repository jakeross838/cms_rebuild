# View Plan: Templates & Library

## Views Covered
1. Template Library
2. Template Editor
3. Assembly Templates (Estimates)

---

## Purpose
Manage reusable templates:
- Estimate assemblies
- Email templates
- Contract templates
- Report templates
- Checklist templates

---

## 1. Template Library
URL: /settings/templates

Categories:
- Estimate Assemblies
- Email Templates
- Contract Templates
- Checklist Templates
- Report Templates

Features:
- Search and filter
- Preview templates
- Usage analytics
- Version history

---

## 2. Estimate Assemblies
URL: /settings/templates/assemblies

Purpose: Pre-built groups of line items for estimates

Example Assembly: Foundation
- Excavation
- Footings
- Foundation walls
- Waterproofing
- Backfill
- Foundation drain

Features:
- Drag-drop line item ordering
- Variable quantity items
- Cost code assignment
- Default pricing (updatable)
- Copy/duplicate assemblies

---

## 3. Email Templates
URL: /settings/templates/emails

Template Types:
- Weekly client update
- Invoice submission confirmation
- Draw request notification
- Selection reminder
- Warranty information

Variables Available:
- {{client_name}}
- {{job_name}}
- {{job_address}}
- {{amount}}
- {{due_date}}
- {{company_name}}

AI Enhancement:
- Suggest templates based on context
- Auto-fill variables
- Tone adjustment options

---

## 4. Contract Templates
URL: /settings/templates/contracts

Features:
- Rich text editor
- Variable insertion
- Section library
- Legal clause bank
- Version control

---

## Database Schema

templates:
- id UUID
- company_id UUID
- type TEXT (assembly/email/contract/checklist/report)
- name TEXT
- description TEXT
- content JSONB
- is_default BOOLEAN
- usage_count INTEGER
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ

estimate_assemblies:
- id UUID
- company_id UUID
- name TEXT
- description TEXT
- cost_code_id UUID
- line_items JSONB
- total_estimate DECIMAL
- is_active BOOLEAN

---

## Gap Items Addressed

### From Section 45: Per-Page Feature Requirements — Settings/Admin (Items 781-796)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 788 | Template management — document templates, estimate templates, checklist templates, email templates | Template Library covers all categories: Estimate Assemblies, Email, Contract, Checklist, Report templates |
| 789 | Custom field management — create/edit custom fields on any entity | Requires: custom field definitions stored as templates so builders can extend any entity |
| 784 | Cost code management — create, edit, organize cost code structure | Estimate Assemblies link to cost codes; Requires: cost code template import/export |

### From Section 11: Estimating & Budgeting
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 415-446 | Estimating workflows | Assembly templates are the foundation — must support variable quantities, regional pricing, and cost code mapping |

### From Section 12: Contracts & Legal
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 447-462 | Contract workflows | Contract Templates section covers rich text editing, variable insertion, section library, and legal clause bank |

### From Section 25: Reporting & Dashboards (Items 449-458)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 449 | Report templates customizable per builder | Report Templates category in library with usage analytics |
| 450 | Report builder for non-technical users | Requires: drag-and-drop report template builder (not just predefined templates) |
| 451 | Report branding (builder's logo, colors, layout) | Requires: branding variables in report templates ({{company_logo}}, {{company_colors}}) |

### From Section 30: Notifications (Items 481-485)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 483 | Notification templates (builder customizes automated message text) | Email Templates section with variable insertion covers this; Requires: notification-specific template category |

### From Section 22: Punch Lists & Checklists (Items 411-420)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 412 | Punch list templates by project type | Checklist Templates category; Requires: project-type tagging so correct templates auto-apply |
| 415 | Pre-punch quality checklists during construction | Checklist Templates must support phase-specific quality gate templates |
| 419 | Vendor self-inspection checklists | Checklist Templates must include vendor-facing inspection checklists |

### From Configuration Engine (Section 1, Items 16-19)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 16 | Configurable workflows — who approves what, at what thresholds | Requires: workflow templates with approval chain definitions |
| 17 | Custom cost code hierarchies (CSI, custom, hybrid) | Estimate Assemblies support cost_code_id linking; Requires: cost code structure templates |
| 18 | Custom phase structures per builder | Requires: phase template definitions in template library |
| 19 | Customizable terminology per tenant | Requires: terminology mapping templates (e.g., "subcontractor" vs. "trade partner") |

### From Edge Cases
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 327 | Platform-provided vs. builder-created document templates | Template library needs is_default flag for platform templates vs. builder-created |
| 612 | Builder expands into light commercial — different contract types | Contract templates must support multiple contract type categories (residential, commercial, T&M, cost-plus) |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 1, 11, 12, 22, 25, 30, 45 |
| Initial | Created from view planning |
