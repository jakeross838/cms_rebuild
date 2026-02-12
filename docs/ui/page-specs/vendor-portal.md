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
