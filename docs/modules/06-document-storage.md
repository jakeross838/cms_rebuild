# Module 6: File/Document Storage & Management

**Phase:** 1 - Foundation
**Status:** TODO
**Priority:** High -- nearly every module attaches, references, or generates documents

---

## Overview

This module provides the shared infrastructure for all file and document operations across the platform. Construction projects generate enormous volumes of documents -- plans, specifications, contracts, invoices, COIs, permits, photos, submittals, lien waivers, and daily logs. The system must handle upload, organized storage, versioning, access control, full-text search, AI-assisted classification, expiration tracking, plan markup, and controlled distribution. Because builders vary dramatically in how they organize documents (some are meticulous folder organizers, others dump everything in one place), the system must support both structured folder templates and flexible tagging/search as primary organization strategies.

---

## Gap Items Addressed

| Gap # | Summary |
|-------|---------|
| 326 | Storage allocation per tenant and overage handling |
| 327 | Platform-provided vs. builder-created document templates |
| 328 | Document sharing between tenants (builder shares with vendor on platform) |
| 329 | Full-text search of PDFs, images via OCR |
| 330 | Builder-configurable document tagging and categorization |
| 331 | Configurable document retention policies (7 years, forever, etc.) |
| 332 | Document redaction (remove pricing before sharing with a sub) |
| 333 | Document version comparison (diff between plan revision A and B) |
| 334 | Document approval workflows (submittals: vendor -> builder -> architect) |
| 335 | Controlled document distribution with receipt confirmation |
| 336 | Document expiration tracking (COIs, licenses -- auto-alert) |
| 337 | Documents requiring wet signatures |
| 338 | DocuSign / HelloSign e-signature integration |
| 339 | Email-to-system document ingestion (forward-to-file) |
| 340 | Configurable folder structure templates per project type |

Also references:
| 504 | AI auto-classification of incoming documents (from Section 32) |
| 526 | Global search includes document content (from Section 34) |

---

## Detailed Requirements

### 6.1 File Storage Architecture (Gap 326)

**Storage Backend**
- Primary: Supabase Storage (backed by S3-compatible object storage).
- Files stored with path structure: `/{builder_id}/{project_id}/{folder_path}/{file_uuid}_{original_name}`.
- Original filename preserved in metadata; UUID prefix prevents collisions.
- All files encrypted at rest (S3 server-side encryption).
- Signed URLs for download with configurable expiration (default 1 hour).

**Storage Allocation (Gap 326)**
- Per-builder storage quota defined by subscription tier:
  - Starter: 50 GB
  - Professional: 250 GB
  - Enterprise: 1 TB (soft limit, negotiable)
- Usage tracked in `builder_storage_usage` (updated on upload/delete via triggers or async job).
- Warning notifications at 80% and 95% usage.
- Overage options (configurable by platform admin): hard block, soft block with warning, auto-upgrade, or pay-per-GB overage billing.
- Storage dashboard in builder admin showing usage by project, by file type, and trend over time.

**Upload Handling**
- Drag-and-drop upload with progress indicator.
- Multi-file upload support (up to 20 files simultaneously).
- Max file size: 500 MB (configurable per tier; plans and videos may be large).
- Supported types: all common document and image types. Executable files (.exe, .bat, .sh) blocked.
- Virus scanning on upload via ClamAV or cloud-based scanner before storage.
- Thumbnail generation for images and first-page preview for PDFs (async via background job).

### 6.2 Folder Organization & Templates (Gap 340)

**Folder Structure**
- Hierarchical folder tree per project.
- Default folder structure template configurable per builder (stored in `builder_document_settings`).
- Example default template:
  ```
  /Plans & Specifications
    /Architectural
    /Structural
    /MEP
    /Civil
  /Contracts
  /Insurance & Compliance
  /Invoices
  /Change Orders
  /Submittals
  /Photos
  /Correspondence
  /Permits & Inspections
  /Closeout
  ```
- When a new project is created, the builder's folder template is auto-created.
- Builders can define multiple templates (e.g., "Custom Home" vs. "Remodel" vs. "Commercial") and select per project.
- Folders can be created ad-hoc beyond the template.
- Folder renaming and moving supported (updates all child paths).

### 6.3 Tagging & Categorization (Gap 330, 504)

**Manual Tagging**
- Each document can have multiple tags (free-text, builder-defined tag library, or both).
- Builder admins define a tag library (e.g., "Framing", "Electrical", "Client-Facing", "Confidential").
- Tags are searchable and filterable in the document browser.

**AI Auto-Classification (Gap 504)**
- On upload, an async job sends the document to an AI classifier.
- Classification model identifies document type: invoice, contract, plan, COI, lien waiver, permit, photo, specification, submittal, correspondence, other.
- AI-suggested tags and document type displayed to user with confidence score.
- User confirms or corrects classification (corrections feed back into model improvement).
- V1: rule-based classifier using filename patterns + first-page OCR keywords. V2: ML model trained on platform-wide data.

### 6.4 Full-Text Search (Gap 329, 526)

**Text Extraction Pipeline**
- PDFs: text extracted via `pdf-parse` or Apache Tika.
- Images (scanned documents, photos with text): OCR via Tesseract or cloud OCR (Google Vision, AWS Textract).
- Office documents (.docx, .xlsx): text extracted via appropriate libraries.
- Extracted text stored in `document_search_content` table and indexed into the global `search_index` (Module 4).

**Search Capabilities**
- Search within a project's documents or across all projects.
- Search by: filename, tags, document type, content (full-text), date range, uploader.
- Results show matching snippet with search term highlighted.
- Performance: extraction runs async; search available after extraction completes (typically < 60 seconds for PDFs, < 2 minutes for OCR).

### 6.5 Version Control (Gap 333)

**Versioning Model**
- Every file has a version history. Uploading a new version of an existing file creates a new version entry.
- Previous versions are retained and downloadable.
- Each version records: version number, uploader, upload date, file size, optional change notes.
- "Current version" is always the latest unless explicitly pinned.

**Version Comparison (Gap 333)**
- For plans (PDFs/images): overlay comparison showing additions (green), deletions (red), unchanged (grey).
- Side-by-side view and slider (swipe between versions) for visual comparison.
- For text documents: text diff showing line-level changes.
- V1: side-by-side and slider view for plans. Text diff for documents. Full overlay diff is Phase 2.

### 6.6 Document Approval Workflows / Submittals (Gap 334)

**Submittal Workflow**
- Configurable approval chain per document type (e.g., submittals: vendor submits -> PM reviews -> architect approves).
- Workflow steps: Submit, Review, Request Revisions, Approve, Reject.
- Each step records: reviewer, action, timestamp, comments.
- Notifications sent at each step transition (integrates with Module 5).
- Due dates on review steps with overdue escalation.

**Status Tracking**
- Document-level status: Draft, Submitted, Under Review, Revisions Requested, Approved, Rejected.
- Dashboard widget showing submittal status summary per project.
- Submittal log exportable as PDF for compliance records.

### 6.7 Controlled Distribution (Gap 335)

**Distribution Lists**
- When a new plan revision is uploaded, the system can auto-distribute to a predefined recipient list.
- Recipients: internal team members, external contacts (subs, architect, engineers).
- Distribution via email with secure download link (signed URL with expiration).
- Receipt confirmation: system tracks who downloaded the document and when.
- Reminder sent if recipient has not acknowledged within configurable window (e.g., 48 hours).

**Distribution Log**
- Full audit trail: who was sent what version, when, and whether they downloaded it.
- Useful for legal protection: "We sent the updated plans to all subs on this date."

### 6.8 Expiration Tracking (Gap 336)

**Expirable Document Types**
- Certificates of Insurance (COIs): expiration date, renewal alerts.
- Licenses (contractor licenses, trade licenses): expiration date, state, license number.
- Permits: expiration or required renewal dates.
- Warranties: start date, duration, expiration.

**Alert System**
- Configurable alert windows per document type: 90 days, 60 days, 30 days, 14 days, expired.
- Alerts sent to: document owner, project manager, and builder admin.
- Dashboard widget: "Expiring Documents" showing documents expiring in the next 30/60/90 days.
- Expired documents flagged with a visual indicator in all views.
- Vendor compliance view: show all vendors with expired or expiring insurance/licenses.

### 6.9 E-Signature Integration (Gap 337, 338)

**Supported Providers**
- DocuSign (primary integration, V1).
- HelloSign / Dropbox Sign (Phase 2).
- Built-in simple signature capture for low-ceremony documents (Phase 2).

**Workflow**
- User selects document, marks signature/initial fields, assigns signers.
- Document sent to e-signature provider via API.
- Status tracked: sent, viewed, signed, declined, voided.
- Signed document auto-filed back into the project's document folder.
- Notification sent when signature completed or if approaching deadline.

**Wet Signature Handling (Gap 337)**
- For jurisdictions or document types requiring wet signatures, the system supports:
  - Print document flow with signature placeholder.
  - Upload signed scan back into the system.
  - Mark document as "wet signature required" to prevent e-signature workflow.

### 6.10 Email-to-System Ingestion (Gap 339)

**Inbound Email Processing**
- Each builder gets a unique inbound email address: `docs-{builder_slug}@inbound.platform.com`.
- Each project can have its own address: `docs-{builder_slug}-{project_code}@inbound.platform.com`.
- Emails forwarded to these addresses are processed:
  1. Attachments extracted.
  2. Sender matched to a contact in the system.
  3. AI classification applied.
  4. Files placed in an "Inbox" folder for the project (or builder-level inbox if no project match).
  5. Notification sent to the PM: "3 new documents received via email from {sender}."
- Email body stored as metadata on the document for context.

### 6.11 Document Sharing Between Tenants (Gap 328)

**Cross-Tenant Sharing**
- A builder can share a document with an external party via a secure, expiring link (no login required).
- If the recipient is also a platform user (e.g., a vendor on the platform), the document appears in their "Shared with Me" section.
- Sharing permissions: view only, view + download, view + download + comment.
- Shared documents do not count against the recipient's storage quota.
- Sharing can be revoked at any time.

### 6.12 Document Redaction (Gap 332)

**Redaction Tool**
- In-browser PDF viewer with redaction capability.
- User draws redaction rectangles over sensitive content (pricing, personal info).
- Redacted version saved as a new file (original preserved with full access restricted to authorized roles).
- Redaction is permanent in the output file (not just an overlay -- content is removed from the PDF).
- Use case: redact pricing from plans before sharing with a subcontractor.

### 6.13 Document Retention (Gap 331)

**Retention Policies**
- Builder-configurable retention rules per document category.
- Options: retain 3 years, 5 years, 7 years, 10 years, indefinitely after project closeout.
- Retention clock starts at project closeout date.
- When retention period expires:
  - Option A: auto-archive to cold storage (reduced cost, slower retrieval).
  - Option B: auto-delete with 30-day grace period and notification.
  - Option C: flag for manual review.
- Legal hold: admin can place a project on legal hold, which suspends all retention deletions.

### 6.14 Document Templates (Gap 327)

**Platform Templates**
- Platform provides standard document templates: contract templates, change order forms, daily log forms, punch list templates.
- Templates are read-only for builders but can be cloned and customized.

**Builder Templates**
- Builders can upload their own templates (letterheads, custom forms, report templates).
- Templates support variable placeholders (project name, date, builder name, client name) that auto-fill when generating a document.
- Template library accessible from any document creation context.

---

## Database Tables

```sql
-- Folders per project
CREATE TABLE document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  project_id UUID REFERENCES projects(id),   -- NULL for builder-level folders
  parent_folder_id UUID REFERENCES document_folders(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,                         -- materialized path: '/Plans/Architectural'
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, project_id, path)
);

-- Documents (files)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  project_id UUID REFERENCES projects(id),
  folder_id UUID REFERENCES document_folders(id),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,                 -- path in S3/Supabase storage
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,                  -- bytes
  document_type TEXT,                         -- 'invoice', 'plan', 'coi', 'contract', etc.
  ai_classification TEXT,                     -- AI-suggested type
  ai_confidence NUMERIC(3,2),                 -- 0.00 to 1.00
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'legal_hold')),
  current_version_id UUID,                    -- FK to document_versions
  thumbnail_path TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_documents_builder ON documents(builder_id, project_id, folder_id);
CREATE INDEX idx_documents_type ON documents(builder_id, document_type);

-- Document versions
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  version_number INT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  change_notes TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Document tags
CREATE TABLE document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, tag)
);
CREATE INDEX idx_doc_tags ON document_tags(tag);

-- Builder tag library
CREATE TABLE builder_tag_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  tag TEXT NOT NULL,
  category TEXT,                              -- grouping for UI
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, tag)
);

-- Full-text search content extracted from documents
CREATE TABLE document_search_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id),
  extracted_text TEXT,
  tsv_content TSVECTOR,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_method TEXT,                     -- 'pdf_parse', 'ocr', 'office_extract'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, version_id)
);
CREATE INDEX idx_doc_search_tsv ON document_search_content USING GIN(tsv_content);

-- Document expiration tracking
CREATE TABLE document_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  expiration_date DATE NOT NULL,
  entity_type TEXT,                           -- 'vendor', 'employee', 'project'
  entity_id UUID,                             -- FK to vendor/employee/project
  alert_90_sent BOOLEAN DEFAULT false,
  alert_60_sent BOOLEAN DEFAULT false,
  alert_30_sent BOOLEAN DEFAULT false,
  alert_14_sent BOOLEAN DEFAULT false,
  alert_expired_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_doc_exp_date ON document_expirations(builder_id, expiration_date);

-- Document approval / submittal workflows
CREATE TABLE document_approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id),
  document_type TEXT NOT NULL,                -- which document types use this workflow
  steps JSONB NOT NULL,                       -- [{step: 1, role: 'pm', action: 'review'}, ...]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, document_type)
);

CREATE TABLE document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  workflow_id UUID NOT NULL REFERENCES document_approval_workflows(id),
  current_step INT DEFAULT 1,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'revisions_requested', 'approved', 'rejected')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE document_approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES document_approvals(id),
  step_number INT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submit', 'review', 'approve', 'reject', 'request_revisions')),
  user_id UUID NOT NULL REFERENCES users(id),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Document distribution tracking
CREATE TABLE document_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  version_id UUID NOT NULL REFERENCES document_versions(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES users(id), -- NULL if external
  recipient_name TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  download_url TEXT,
  url_expires_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ
);
CREATE INDEX idx_distrib_doc ON document_distributions(document_id, version_id);

-- Document sharing (cross-tenant or external)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  shared_by UUID NOT NULL REFERENCES users(id),
  shared_with_email TEXT,                     -- external email
  shared_with_user_id UUID REFERENCES users(id), -- if platform user
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'view_download', 'view_download_comment')),
  share_token TEXT NOT NULL UNIQUE,           -- for secure link
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Builder document settings
CREATE TABLE builder_document_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id) UNIQUE,
  folder_templates JSONB DEFAULT '[]',        -- [{name: "Custom Home", folders: [...]}]
  retention_policy JSONB DEFAULT '{}',        -- {document_type: {years: 7, action: "archive"}}
  inbound_email_prefix TEXT,                  -- e.g., 'rossbuilt'
  max_file_size_mb INT DEFAULT 500,
  blocked_extensions TEXT[] DEFAULT '{exe,bat,sh,cmd,ps1}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Builder storage usage tracking
CREATE TABLE builder_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id) UNIQUE,
  total_bytes BIGINT DEFAULT 0,
  file_count INT DEFAULT 0,
  quota_bytes BIGINT NOT NULL,                -- from subscription tier
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

-- E-signature tracking
CREATE TABLE document_esignatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  builder_id UUID NOT NULL REFERENCES builders(id),
  provider TEXT NOT NULL CHECK (provider IN ('docusign', 'hellosign', 'internal')),
  provider_envelope_id TEXT,                  -- external ID
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'declined', 'voided')),
  signers JSONB NOT NULL,                     -- [{name, email, role, status, signed_at}]
  signed_document_path TEXT,                  -- path to completed signed file
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **File Operations** | | |
| POST | `/api/v2/documents/upload` | Upload file(s) -- multipart form data |
| GET | `/api/v2/documents/:id` | Get document metadata |
| GET | `/api/v2/documents/:id/download` | Get signed download URL |
| DELETE | `/api/v2/documents/:id` | Soft delete document |
| PUT | `/api/v2/documents/:id` | Update metadata (tags, type, folder) |
| POST | `/api/v2/documents/:id/versions` | Upload new version |
| GET | `/api/v2/documents/:id/versions` | List version history |
| GET | `/api/v2/documents/:id/versions/:version/download` | Download specific version |
| **Folder Operations** | | |
| GET | `/api/v2/projects/:project_id/folders` | Get folder tree for project |
| POST | `/api/v2/projects/:project_id/folders` | Create folder |
| PUT | `/api/v2/folders/:id` | Rename or move folder |
| DELETE | `/api/v2/folders/:id` | Delete folder (must be empty or recursive) |
| **Search & Browse** | | |
| GET | `/api/v2/documents?project_id=&folder_id=&type=&tag=&q=` | Browse/search documents |
| GET | `/api/v2/documents/search?q=&content=true` | Full-text content search |
| GET | `/api/v2/documents/expiring?days=30` | Documents expiring within N days |
| **Expiration** | | |
| POST | `/api/v2/documents/:id/expiration` | Set expiration date |
| PUT | `/api/v2/documents/:id/expiration` | Update expiration date |
| GET | `/api/v2/documents/expirations` | List all tracked expirations |
| **Approval Workflows** | | |
| POST | `/api/v2/documents/:id/submit` | Submit document for approval |
| POST | `/api/v2/documents/:id/approve` | Approve document at current step |
| POST | `/api/v2/documents/:id/reject` | Reject document |
| POST | `/api/v2/documents/:id/request-revisions` | Request revisions with comments |
| GET | `/api/v2/documents/approvals?status=` | List pending approvals |
| **Distribution** | | |
| POST | `/api/v2/documents/:id/distribute` | Send document to distribution list |
| GET | `/api/v2/documents/:id/distributions` | Get distribution/receipt status |
| **Sharing** | | |
| POST | `/api/v2/documents/:id/share` | Create share link |
| DELETE | `/api/v2/documents/shares/:share_id` | Revoke share |
| GET | `/api/v2/shared/:token` | Public access via share token |
| GET | `/api/v2/documents/shared-with-me` | Documents shared with current user |
| **E-Signature** | | |
| POST | `/api/v2/documents/:id/esign` | Initiate e-signature workflow |
| GET | `/api/v2/documents/:id/esign/status` | Check e-signature status |
| POST | `/api/v2/webhooks/docusign` | DocuSign callback webhook |
| **Admin** | | |
| GET | `/api/v2/admin/documents/settings` | Get builder document settings |
| PUT | `/api/v2/admin/documents/settings` | Update settings (templates, retention, etc.) |
| GET | `/api/v2/admin/documents/storage-usage` | Get storage usage report |
| GET | `/api/v2/admin/documents/tag-library` | Get tag library |
| POST | `/api/v2/admin/documents/tag-library` | Add tag to library |
| DELETE | `/api/v2/admin/documents/tag-library/:tag_id` | Remove tag from library |
| **Email Ingestion** | | |
| POST | `/api/v2/webhooks/inbound-email` | Inbound email processing webhook |

---

## Dependencies

| Module | Reason |
|--------|--------|
| Module 1: Auth & Access | File/folder permissions, role-based access to redaction and admin |
| Module 2: Multi-Tenant Core | `builder_id` on all queries, storage quotas per tenant |
| Module 3: Core Data Model | Project association, vendor/contact linking for COIs |
| Module 4: Navigation & Search | Documents indexed in global search, expiration widget on dashboard |
| Module 5: Notification Engine | Expiration alerts, distribution reminders, approval step notifications |
| Supabase Storage / S3 | File storage backend |
| Redis / BullMQ | Background jobs for text extraction, thumbnail generation, AI classification |
| Tesseract or Cloud OCR | OCR for scanned documents and images |
| DocuSign API | E-signature integration |
| ClamAV or cloud scanner | Virus scanning on upload |
| SendGrid (via Module 5) | Email delivery for distribution and e-signature requests |

---

## Open Questions

1. **OCR cost**: Cloud OCR (Google Vision, AWS Textract) provides higher accuracy but costs per page. Should OCR be a premium feature, or included for all tiers with a monthly page limit?
2. **Plan markup tool**: Should we build an in-browser plan markup tool (annotations, measurements, callouts on PDFs/images) for V1, or integrate with a third-party viewer like Bluebeam Revu or PlanGrid's viewer? Building our own is a significant effort.
3. **Video support**: Construction walkthrough videos and drone footage can be very large. Should we support direct video upload and playback, or integrate with YouTube/Vimeo for hosting with private links?
4. **Redaction implementation**: PDF redaction that truly removes content (not just overlays) requires server-side PDF manipulation. Library choice: pdf-lib (JS), Poppler (C++), or cloud service?
5. **Version comparison for plans**: True overlay diff of architectural plans is technically challenging (alignment, scale differences). Is side-by-side + slider sufficient for V1, with true overlay diff as a Phase 2 premium feature?
6. **Email ingestion domain**: Do we use a subdomain of the main platform domain for inbound email, or a separate domain? Separate domain avoids spam reputation issues on the main domain.
7. **Document template engine**: For generating documents with variable substitution (contracts, change orders), should we use a dedicated template engine (Carbone, Docxtemplater) or build with basic find-and-replace on .docx/.pdf?
8. **AI classification training**: V1 uses rule-based classification. When should ML-based classification be introduced, and do we need a minimum number of classified documents per builder before ML becomes useful?
