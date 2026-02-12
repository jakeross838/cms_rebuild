# View Plan: Warranty Claims & Management

## Views Covered
1. Warranty List
2. Warranty Detail
3. Warranty Claim Form
4. Warranty Calendar

---

## Purpose
Track warranties and manage claims:
- Product warranties (appliances, materials)
- Workmanship warranties (contractor, sub)
- Claim processing
- Expiration tracking

---

## 1. Warranty List
URL: /jobs/:id/warranties

Filters:
- Active/Expired
- By vendor
- By category
- Expiring soon

Display:
- Item description
- Vendor/manufacturer
- Start/end dates
- Status
- Claims count

---

## 2. Warranty Detail
URL: /jobs/:id/warranties/:warrantyId

Information:
- Item details
- Coverage terms
- Contact information
- Documentation
- Claim history

Attached Documents:
- Original warranty certificate
- Purchase receipts
- Installation records

---

## 3. Warranty Claim Form
URL: /jobs/:id/warranties/:warrantyId/claim

Claim Fields:
- Issue description
- Date discovered
- Photos of issue
- Urgency level
- Requested resolution

Workflow:
Submitted -> Vendor Contacted -> In Progress -> Resolved

---

## 4. Warranty Calendar
URL: /warranties/calendar

Purpose: Visual expiration timeline

Features:
- Color-coded by urgency
- Filter by job
- Expiration alerts
- Renewal reminders

---

## AI Enhancements
- Auto-extract warranty terms from documents
- Predict expiration issues
- Suggest claim language
- Track vendor warranty performance

---

## Notifications
- 90 days before expiration
- 30 days before expiration
- 7 days before expiration
- On expiration

---

## Database Schema

warranties:
- id UUID
- company_id UUID
- job_id UUID
- vendor_id UUID
- item_description TEXT
- category TEXT
- start_date DATE
- end_date DATE
- coverage_terms TEXT
- contact_name TEXT
- contact_phone TEXT
- contact_email TEXT
- documents JSONB
- status TEXT
- created_at TIMESTAMPTZ

warranty_claims:
- id UUID
- warranty_id UUID
- description TEXT
- discovered_date DATE
- photos JSONB
- urgency TEXT
- requested_resolution TEXT
- status TEXT
- resolution_notes TEXT
- resolved_at TIMESTAMPTZ
- created_at TIMESTAMPTZ
