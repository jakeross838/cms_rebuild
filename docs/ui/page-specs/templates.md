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
