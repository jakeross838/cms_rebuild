# View Plan: Files & Documents

## Views Covered
- File Browser (job tab)
- File Upload
- File Detail/Preview
- Folder Management

---

## Overview

**Purpose:** Centralized document management for construction project files including contracts, permits, plans, submittals, RFIs, and vendor documents.

**Key Features:**
- Folder-based organization with predefined + custom folders
- Drag-and-drop upload
- File preview (PDF, images, common formats)
- Version tracking for updated documents
- Sharing via signed URLs
- Search across file names and metadata

**Affected By:**
- Contracts (from ESTIMATES_PROPOSALS_CONTRACTS.md)
- Vendor documents (W9, insurance from VENDORS_CLIENTS_COSTCODES.md)
- Daily log photos (from SCHEDULE_LOGS_PHOTOS.md)
- Closeout documents (from PUNCH_DOCS_WARRANTIES.md)

**Affects:**
- Client Portal (shared documents)
- QuickBooks sync (invoice PDFs)

---

# FILE BROWSER

## URL
`/jobs/:id/files` (from job nav, Files tab)

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Files - Smith Residence                                             │
│                                                                     │
│ [+ Upload] [+ New Folder]                    [Search...] [Grid|List]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 📁 All Files                          45 files, 156 MB          ││
│  │                                                                 ││
│  │ SYSTEM FOLDERS                                                  ││
│  │ ├── 📁 Contracts (3)                                            ││
│  │ ├── 📁 Permits (5)                                              ││
│  │ ├── 📁 Plans & Drawings (12)                                    ││
│  │ ├── 📁 Submittals (8)                                           ││
│  │ ├── 📁 RFIs (4)                                                 ││
│  │ ├── 📁 Vendor Documents (7)                                     ││
│  │ │       └── Insurance Certs, W9s, Lien Releases                 ││
│  │ ├── 📁 Correspondence (3)                                       ││
│  │ └── 📁 Closeout (2)                                             ││
│  │                                                                 ││
│  │ CUSTOM FOLDERS                                                  ││
│  │ ├── 📁 Client Selections (1)                                    ││
│  │ └── 📁 Site Photos (formal) (0)                                 ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Folder Contents View (List Mode)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📁 Contracts                              ← Back to All Files       │
│                                                                     │
│ [+ Upload] [+ New Folder]                    [Search...] [Grid|List]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ ☐ │ Name              │ Size   │ Modified    │ Uploaded By │ ⋮  │ │
│ ├───┼───────────────────┼────────┼─────────────┼─────────────┼────┤ │
│ │ ☐ │ 📄 Prime Contract │ 2.4 MB │ Nov 15      │ Jake Ross   │ ⋮  │ │
│ │   │    v2 (current)   │        │             │             │    │ │
│ │ ☐ │ 📄 CO #1 Signed   │ 890 KB │ Dec 2       │ Jake Ross   │ ⋮  │ │
│ │ ☐ │ 📄 CO #2 Signed   │ 1.1 MB │ Dec 18      │ Jake Ross   │ ⋮  │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ Selected: 0                        [Download] [Move] [Share] [Delete]│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Folder Contents View (Grid Mode)

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📁 Plans & Drawings                       ← Back to All Files       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │               │
│  │  │  PDF   │  │  │  │  PDF   │  │  │  │  PDF   │  │               │
│  │  │ thumb  │  │  │  │ thumb  │  │  │  │ thumb  │  │               │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │               │
│  │ Floor Plans  │  │ Elevations   │  │ Electrical   │               │
│  │ A1.pdf       │  │ A2.pdf       │  │ E1.pdf       │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │               │
│  │  │  PDF   │  │  │  │  PDF   │  │  │  │  DWG   │  │               │
│  │  │ thumb  │  │  │  │ thumb  │  │  │  │ icon   │  │               │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │               │
│  │ Plumbing     │  │ HVAC         │  │ CAD File     │               │
│  │ P1.pdf       │  │ M1.pdf       │  │ site.dwg     │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## System Folders (Auto-Created)

| Folder | Description | Auto-Populated From |
|--------|-------------|---------------------|
| Contracts | Signed proposals, change orders | Contract signing flow |
| Permits | Building permits, inspections | Manual upload |
| Plans & Drawings | Architectural, structural, MEP plans | Manual upload |
| Submittals | Material submittals | Submittal workflow |
| RFIs | Request for Information docs | RFI workflow |
| Vendor Documents | W9, insurance certs, lien releases | Vendor management |
| Correspondence | Emails, letters, notices | Manual upload |
| Closeout | Warranties, manuals, as-builts | Closeout workflow |

---

# FILE UPLOAD

## Upload Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Upload Files                                                  [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Upload to: [📁 Plans & Drawings          ▼]                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │       ┌─────────────────────────────────────────────┐           ││
│  │       │                                             │           ││
│  │       │     📁 Drag and drop files here            │           ││
│  │       │                                             │           ││
│  │       │     or click to browse                     │           ││
│  │       │                                             │           ││
│  │       │     Supported: PDF, DOC, DOCX, XLS, XLSX,  │           ││
│  │       │     JPG, PNG, DWG, DXF (max 50MB each)     │           ││
│  │       │                                             │           ││
│  │       └─────────────────────────────────────────────┘           ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  QUEUED FILES                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 📄 floor-plans-v2.pdf        2.4 MB    [████████████] 100%  ✓  ││
│  │ 📄 electrical-layout.pdf     1.8 MB    [████████░░░░]  67%     ││
│  │ 📄 site-survey.dwg           5.2 MB    [██░░░░░░░░░░]  15%     ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ☐ Replace existing file if same name                              │
│  ☐ Share with client portal                                        │
│                                                                     │
│                                            [Cancel]  [Upload All]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Upload Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| folder_id | uuid | Yes | Target folder |
| files | file[] | Yes | One or more files |
| replace_existing | boolean | No | Replace if same name exists |
| share_portal | boolean | No | Make visible in client portal |
| description | text | No | Optional file description |

---

# FILE DETAIL / PREVIEW

## URL
`/jobs/:id/files/:fileId`

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← Back to Plans & Drawings                                          │
│                                                                     │
│ floor-plans-v2.pdf                         [Download] [Share] [⋮]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  │                                                                 ││
│  │                                                                 ││
│  │                     PDF PREVIEW                                 ││
│  │                                                                 ││
│  │                   (embedded viewer)                             ││
│  │                                                                 ││
│  │                                                                 ││
│  │                                                                 ││
│  │  [◀ Prev]  Page 1 of 3  [Next ▶]                  [🔍+] [🔍-]  ││
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  FILE DETAILS                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Name:         floor-plans-v2.pdf                                   │
│  Size:         2.4 MB                                               │
│  Type:         PDF Document                                         │
│  Folder:       Plans & Drawings                                     │
│  Uploaded:     Nov 15, 2024 at 2:30 PM                             │
│  Uploaded By:  Jake Ross                                            │
│  Description:  Updated floor plans with client revisions            │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  VERSION HISTORY                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Version  │ Uploaded         │ By        │ Notes       │ Action  ││
│  ├──────────┼──────────────────┼───────────┼─────────────┼─────────┤│
│  │ v2 (cur) │ Nov 15, 2:30 PM  │ Jake Ross │ Client revs │         ││
│  │ v1       │ Nov 1, 10:15 AM  │ Jake Ross │ Initial     │[Download]│
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  SHARING                                                            │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ☐ Visible in Client Portal                                        │
│                                                                     │
│  Share Link: [Generate Link]                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## File Preview Support

| File Type | Preview Method |
|-----------|----------------|
| PDF | Embedded PDF.js viewer |
| Images (JPG, PNG, GIF, WebP) | Native image display |
| Word (DOC, DOCX) | Convert to PDF for preview |
| Excel (XLS, XLSX) | Table preview (first sheet) |
| CAD (DWG, DXF) | Thumbnail only, download to view |
| Other | Icon + download link |

---

# NEW FOLDER

## New Folder Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  New Folder                                                    [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Folder Name *                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Client Correspondence                                           ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Parent Folder                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 📁 Root (top level)                                         ▼  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Description                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                                                                 ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ☐ Make visible in Client Portal                                   │
│                                                                     │
│                                            [Cancel]  [Create Folder]│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

# SHARE FILE

## Share Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│  Share File                                                    [X]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📄 floor-plans-v2.pdf                                             │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  SHARE LINK                                                         │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ https://app.rossbuilt.com/share/f8a2b3c4...             [Copy] ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Link expires: [7 days ▼]                                          │
│                                                                     │
│  ☐ Require password                                                │
│     Password: [••••••••]                                           │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  EMAIL DIRECTLY                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  To: ┌─────────────────────────────────────────────────────────────┐│
│      │ john.smith@email.com                                        ││
│      └─────────────────────────────────────────────────────────────┘│
│                                                                     │
│  Message:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ Here are the updated floor plans for your review.               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│                                              [Cancel]  [Send Email] │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```sql
-- Folders
folders (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES jobs NOT NULL,
  parent_folder_id uuid REFERENCES folders,  -- for nested folders

  name text NOT NULL,
  description text,
  is_system boolean DEFAULT false,           -- system folders can't be deleted
  system_type text,                          -- contracts, permits, plans, etc.
  portal_visible boolean DEFAULT false,      -- show in client portal

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,

  UNIQUE(job_id, parent_folder_id, name)
)

-- Files
files (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies NOT NULL,
  job_id uuid REFERENCES jobs NOT NULL,
  folder_id uuid REFERENCES folders,

  name text NOT NULL,
  description text,

  -- Storage
  storage_path text NOT NULL,                -- Supabase storage path
  url text,                                  -- Cached signed URL
  thumbnail_url text,                        -- For images/PDFs

  -- Metadata
  size_bytes bigint,
  mime_type text,
  file_extension text,

  -- Versioning
  version integer DEFAULT 1,
  previous_version_id uuid REFERENCES files,
  is_current boolean DEFAULT true,

  -- Sharing
  portal_visible boolean DEFAULT false,

  -- Entity linking (optional)
  entity_type text,                          -- contract, submittal, rfi, vendor, etc.
  entity_id uuid,

  uploaded_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES users
)

-- File Share Links
file_shares (
  id uuid PRIMARY KEY,
  file_id uuid REFERENCES files NOT NULL,

  share_token text UNIQUE NOT NULL,
  expires_at timestamptz,
  password_hash text,                        -- optional password protection

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users,

  access_count integer DEFAULT 0,
  last_accessed_at timestamptz
)
```

---

## API Endpoints

### Folders
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:jobId/folders` | List all folders for job |
| POST | `/api/jobs/:jobId/folders` | Create folder |
| PATCH | `/api/folders/:id` | Update folder |
| DELETE | `/api/folders/:id` | Delete folder (if empty) |

### Files
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/jobs/:jobId/files` | List all files (with folder filter) |
| GET | `/api/files/:id` | Get file details |
| POST | `/api/jobs/:jobId/files/upload` | Upload file(s) |
| PATCH | `/api/files/:id` | Update file metadata |
| DELETE | `/api/files/:id` | Delete file |
| POST | `/api/files/:id/move` | Move file to different folder |
| GET | `/api/files/:id/download` | Get download URL |
| GET | `/api/files/:id/versions` | Get version history |

### Sharing
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/files/:id/share` | Create share link |
| DELETE | `/api/file-shares/:id` | Revoke share link |
| GET | `/api/share/:token` | Access shared file (public) |
| POST | `/api/share/:token/verify` | Verify password (if protected) |

### Bulk Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/files/bulk/download` | Download multiple as ZIP |
| POST | `/api/files/bulk/move` | Move multiple files |
| POST | `/api/files/bulk/delete` | Delete multiple files |

---

## Component Structure

```
app/jobs/[id]/files/
├── page.tsx                    (file browser)
├── [fileId]/
│   └── page.tsx                (file detail/preview)
└── upload/
    └── page.tsx                (upload page, if not modal)

components/files/
├── FileBrowser.tsx             (main browser component)
├── FolderTree.tsx              (folder navigation)
├── FileList.tsx                (list view)
├── FileGrid.tsx                (grid view)
├── FileCard.tsx                (single file in grid)
├── FileRow.tsx                 (single file in list)
├── FilePreview.tsx             (preview component)
├── FileUploader.tsx            (upload dropzone)
├── FileUploadProgress.tsx      (upload progress)
├── FolderCreateModal.tsx       (new folder)
├── FileShareModal.tsx          (share dialog)
├── FileMoveModal.tsx           (move to folder)
├── FileVersionHistory.tsx      (version list)
└── FileActions.tsx             (context menu actions)
```

---

## Affected By Changes To
- Jobs (files are job-scoped)
- Users (upload tracking, share permissions)
- Company settings (storage limits, file types)

## Affects
- All views that reference documents (contracts, permits, plans)
- Daily logs (attached photos become files)
- Closeout (final documents, warranties)
- Client Portal (shared files visible to client)
- Activity logs (file upload/share actions)

---

## Mobile Considerations

- Full-width file list (no grid on mobile)
- Bottom sheet for file actions
- Native share integration
- Camera upload for quick document capture
- Offline: Show cached thumbnails, queue uploads
- Pull-to-refresh folder contents

---

## Search & Filtering

### Search
- File name
- Description
- Folder name

### Filters
| Filter | Options |
|--------|---------|
| Folder | All, specific folder |
| File Type | PDF, Images, Documents, Spreadsheets, CAD, Other |
| Uploaded By | Team member |
| Date Range | Uploaded date |
| Portal Visible | Yes/No |

---

## Gap Items Addressed

### From Section 15: Document Management (Items 326-340)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 326 | Storage allocation per tenant (and overage handling) | Requires: storage quota display in settings, overage alerts, and upgrade prompts |
| 327 | Platform-provided vs. builder-created document templates | System Folders are auto-created; Requires: platform-provided document templates (marked as is_system) distinct from builder-created |
| 328 | Document sharing between tenants (builder shares spec with vendor on platform) | Share Modal with signed URLs and email; Requires: cross-tenant sharing when vendor is also a platform user |
| 329 | Full-text search across all document types (PDFs via OCR, images) | Search section covers file name, description, folder name; Requires: full-text content search with OCR for scanned documents |
| 330 | Builder-configurable document tagging/categorization | System folders + custom folders provide structure; Requires: tag/label system on files for flexible categorization |
| 331 | Document retention policies (configurable per builder — 7 years, forever) | Requires: retention policy settings per document type with auto-archive and deletion scheduling |
| 332 | Document redaction (redact pricing from plans before sharing) | Requires: in-browser redaction tool for PDFs before sharing with subcontractors |
| 333 | Document version comparison (diff between plan revision A and B) | Version History section shows versions; Requires: visual diff/comparison tool highlighting changes between versions |
| 334 | Document approval workflows (submittals: vendor -> builder -> architect) | entity_type field links files to submittals; Requires: approval workflow status on document-level |
| 335 | Controlled document distribution (new revision -> auto-send, confirm receipt) | Share Modal supports email; Requires: distribution list with read-receipt tracking for plan revisions |
| 336 | Document expiration tracking with auto-alerts (insurance, permits) | Requires: expiration_date field on files with configurable alert schedule (30d, 7d, expired) |
| 337 | Documents requiring wet signatures (some jurisdictions) | Requires: wet signature requirement flag with workflow to track physical signature status |
| 338 | E-signature platform integration (DocuSign, HelloSign) | Requires: e-signature integration category in integrations hub, triggered from document detail view |
| 339 | Documents received via email (forward-to-system auto-filing) | Requires: dedicated email address per project that auto-files attachments into appropriate folders |
| 340 | Folder structure templates (pre-built per new project, configurable) | System Folders section defines defaults; Requires: configurable folder templates in builder settings |

### From Section 45: Per-Page Feature Requirements — Document Management (Items 754-768)
| Gap # | Description | How This Spec Addresses It |
|-------|-------------|---------------------------|
| 754 | Folder tree navigation — configurable per project | Folder tree with system + custom folders, parent_folder_id for nesting |
| 755 | Drag-and-drop upload with auto-categorization | Upload Modal supports drag-and-drop; Requires: AI auto-categorization of uploaded files into folders |
| 756 | Bulk upload with progress indicator | Upload Modal shows per-file progress bars |
| 757 | Full-text search across all documents | Requires: content-level search beyond just metadata (see item 329) |
| 758 | Filter by document type, trade, date, uploaded by | Filter section covers file type, uploaded by, date range, portal visibility |
| 759 | Version history per document with comparison tool | Version History in File Detail; Requires: side-by-side comparison viewer |
| 760 | Document preview without downloading | File Preview section with PDF.js viewer and native image display |
| 761 | Annotation/markup tools on documents | Requires: in-browser annotation overlay for PDFs and images |
| 762 | Sharing controls — who can see this document | portal_visible flag and share links with password/expiration; Requires: granular per-user sharing controls |
| 763 | Expiration tracking with alerts (insurance, permits) | Requires: expiration_date field and alert system (see item 336) |
| 764 | Download with watermark option | Requires: dynamic watermark overlay (builder name + date) on download |
| 765 | Batch operations — move, tag, delete, share | Bulk Operations API section covers bulk download, move, delete |
| 766 | Recent documents and favorites | Requires: recently_viewed and is_favorite fields for quick access section |
| 767 | Document status indicators (draft, pending review, approved, expired) | Requires: status field on files with visual badges |
| 768 | Integration with e-signature platforms | See item 338 |

### From Edge Cases (Sections 44, 46, 48)
| Gap # | Description | Relevance |
|-------|-------------|-----------|
| 600 | Builder acquires in-progress project — onboard mid-stream | Document import must support bulk upload of existing project files with metadata |
| 606 | Key employee incapacitated — complete documentation | All files must be accessible by role, not locked to uploader; admin override access |
| 611 | Project featured on TV — photo approval workflows | Requires: approval status on photos/media before external sharing |
| 798 | Litigation hold — prevent deletion during legal proceedings | Requires: legal hold flag that blocks all delete operations on project documents |
| 802 | Expert witness documentation support | Requires: organized export of complete project file set with audit trail for legal proceedings |
| 828 | Large plan set rendering on mobile — progressive loading | Mobile section mentions cached thumbnails; Requires: progressive tile loading for large PDFs |
| 836 | File format handling (PDFs, DWGs, Excel, Word, images, videos) | File Preview Support table covers major formats; Requires: video playback support |
| 841 | Search performance — full-text across millions of records | Requires: search indexing strategy (Elasticsearch or similar) for large document repositories |

---

## Revision History
| Date | Change |
|------|--------|
| 2026-02-11 | Added Gap Items Addressed section from gap analysis sections 15, 44-48 |
| Initial | Created from audit finding - Files/Documents view was missing |
