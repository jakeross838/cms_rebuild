# View Plan: Vendor Portal

## Views Covered
1. Vendor Portal Login
2. Vendor Dashboard
3. PO Management (Vendor View)
4. Invoice Submission
5. Document Upload
6. Lien Release Management

---

## Purpose
External portal allowing vendors to:
- View and accept POs
- Submit invoices directly
- Upload compliance documents
- Sign lien releases digitally
- Track payment status

---

## 1. Vendor Dashboard
URL: /portal/vendor/dashboard

Features:
- Active PO summary
- Pending invoices
- Upcoming payments
- Document expiration alerts
- Messages from builder

---

## 2. PO Management
URL: /portal/vendor/pos

Vendors can:
- View PO details and scope
- Accept or decline POs
- Request clarifications
- Track change orders

---

## 3. Invoice Submission
URL: /portal/vendor/invoices/new

Features:
- Drag-drop invoice upload
- Auto-link to PO
- Line item entry
- Supporting doc attachment
- Submission confirmation

---

## 4. Document Management
URL: /portal/vendor/documents

Required Documents:
- W-9
- Insurance certificates (auto-expiration tracking)
- Licenses
- Lien waivers

AI Enhancement:
- Auto-extract expiration dates
- Remind before expiration
- Validate document completeness

---

## 5. Lien Release Management
URL: /portal/vendor/lien-releases

Features:
- View required releases per draw
- Digital signature capture
- Auto-generate from template
- Track submission status

---

## Database Schema

vendors table additions:
- portal_enabled BOOLEAN
- portal_email TEXT
- portal_password_hash TEXT
- last_portal_login TIMESTAMPTZ

vendor_portal_sessions table:
- Track active sessions
- Security audit trail

---

## Security
- Separate auth from main app
- Rate limiting on login
- Session timeout (24 hours)
- IP logging for audit

---

## Gap Items Addressed

### Section 19 — Vendor & Subcontractor Management
- **#381** Vendors on platform working for multiple builders (builder-specific data vs vendor's own profile)
- **#382** Vendor self-registration (vendor signs up, builder approves vs builder creates vendor account)
- **#383** Vendor compliance tracking (insurance, license, safety — configurable requirements per builder)
- **#384** Vendor prequalification workflows (configurable questionnaire, document requirements, approval process)
- **#385** Vendor bid management (bid invitation, submission, comparison through the platform)
- **#386** Vendor payment terms (configurable per vendor per builder — Net 30, Net 15, 2/10 Net 30)
- **#388** Vendor communication preferences (email, portal, text — configurable per vendor)
- **#393** Vendor onboarding to platform (first-time guided experience)
- **#394** Vendor support (who helps vendors with portal trouble — builder or platform support)

### Section 45 — Per-Page Feature Requirements (Vendor Profile Page)
- **#708** Contact information, addresses, key personnel
- **#709** Insurance status with expiration countdown
- **#710** License status with verification link
- **#714** Active contracts and POs
- **#719** Document repository — COI, W-9, contracts, lien waivers

### Section 16 — Invoice & Payment Processing
- **#341** Configurable invoice approval workflows
- **#345** Invoice-to-PO matching vs builders who don't use POs
- **#348** Conditional payment rules (no payment without current insurance + signed lien waiver)
- **#351** State-specific lien waiver forms
- **#353** Conditional vs unconditional waiver tracking by state
- **#358** Electronic vs wet signature requirements for lien waivers

### Section 22 — Punch Lists & Checklists
- **#419** Vendor self-inspection checklists (vendor checks their own work before requesting inspection)

---

## Additional Requirements from Gap Analysis

### Vendor Self-Registration (#382, #393)
1. **Registration flow**: Vendor visits portal URL, fills out company info, uploads required documents (W-9, insurance), submits for builder review
2. **Guided onboarding**: First-time login experience with step-by-step setup — complete profile, upload documents, review terms, accept portal agreement
3. **Multi-builder support** (#381): If vendor works for multiple builders on the platform, single login with builder-switcher to see jobs/POs per builder

### Bid Management (#385)
1. **Bid invitation inbox**: Vendor sees bid invitations with scope documents, plan references, and due dates
2. **Bid submission form**: Vendor enters bid amounts (lump sum or line-by-line), attaches supporting docs, submits through portal
3. **Bid status tracking**: Vendor sees if their bid was accepted, rejected, or if more info is needed

### Compliance Management (#383, #709, #710)
1. **Document expiration dashboard**: Vendor sees countdown timers for insurance, license, and other compliance docs
2. **Renewal reminders**: Automated reminders at 60, 30, and 7 days before document expiration
3. **Upload and auto-extract**: Upload new COI and system auto-extracts policy number, coverage amounts, expiration dates
4. **Compliance status indicator**: Green/yellow/red status visible to vendor showing their compliance standing

### Payment Tracking Enhancements
1. **Payment history**: Full history of all payments received from this builder with dates, amounts, check/ACH numbers
2. **Payment terms display** (#386): Show agreed payment terms and expected payment dates for approved invoices
3. **Conditional requirements** (#348): Clear display of what's needed before payment releases (lien waiver signed, insurance current)
4. **Retainage tracking**: View retained amounts per project and retainage release status

### Lien Waiver Enhancements (#351, #353, #358)
1. **State-specific forms**: System generates correct lien waiver form based on project state (conditional vs unconditional)
2. **Digital signature**: E-signature capability for lien waivers within the portal
3. **Waiver status per draw**: Clear view of which draws require waivers, which are submitted, which are pending
4. **Sub-tier waivers**: If vendor has sub-vendors, track their lien waivers too

### Prequalification (#384)
1. **Prequalification questionnaire**: Builder-configurable questionnaire that vendor completes during onboarding
2. **Required document checklist**: List of required documents with upload status (complete/incomplete)
3. **Approval workflow**: Vendor submits prequalification package, builder reviews and approves/rejects

### Self-Inspection Checklists (#419)
1. **Quality checklists**: Vendor can access and complete self-inspection checklists before requesting builder inspection
2. **Photo documentation**: Require before/after photos as part of checklist completion
3. **Submission for inspection**: After self-inspection passes, vendor requests formal builder inspection through portal

### Communication (#388)
1. **In-portal messaging**: Direct messaging between vendor and builder PM per job
2. **Communication preferences**: Vendor sets preferred contact method (email, portal, text)
3. **Notification settings**: Vendor configures which events trigger notifications (new PO, payment processed, document expiring)

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed and Additional Requirements from gap analysis sections 16, 19, 22, and 45 |
| Initial | Created from batch planning |
