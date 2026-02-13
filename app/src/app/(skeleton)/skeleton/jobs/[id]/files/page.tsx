'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { JobFilesPreview } from '@/components/skeleton/previews/job-files-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Contracts', 'Plans', 'Permits', 'Files', 'Client Portal'
]

export default function FilesSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <JobFilesPreview /> : <PageSpec
        title="Files & Documents"
        phase="Phase 0 - Foundation"
        planFile="views/jobs/FILES.md"
        description="Centralized document management for all job-related files. Organize plans, permits, contracts, warranties, submittals, and more with AI-powered classification, extraction, and full-text search. Documents are versioned, searchable, shareable with clients and vendors via portals, and tracked for expiration. Submittal approval workflows route through vendor, PM, and architect review chains."
        workflow={constructionWorkflow}
        features={[
          'File browser with hierarchical folder organization and configurable templates',
          'Default folders: Plans & Specifications, Permits, Contracts, Insurance, Submittals, Change Orders, Warranties, Photos, Correspondence, Closeout',
          'Drag-and-drop multi-file upload (up to 20 files, 500MB max) with progress indicator',
          'Version control with side-by-side comparison for plan revisions',
          'AI document classification on upload (invoice, contract, plan, COI, lien waiver, permit, submittal, etc.)',
          'OCR text extraction from PDFs, images, and scans for full-text search',
          'Full-text search across all document contents with highlighted snippets',
          'Document preview without download (in-browser PDF viewer)',
          'Per-file portal visibility toggle for client portal sharing',
          'Per-file vendor sharing with configurable permissions (view, download, comment)',
          'Document expiration tracking with 90/60/30/14-day alerts (COIs, permits, licenses)',
          'Submittal approval workflow (vendor submits, PM reviews, architect approves/rejects)',
          'Approval status tracking: Draft, Submitted, Under Review, Revisions Requested, Approved, Rejected',
          'Email-to-system document ingestion (forward docs to project inbox)',
          'Document tagging with builder-defined tag library',
          'Cross-module linking: documents linked to POs, invoices, change orders, selections, RFIs, inspections',
          'Required document checklist by construction phase with missing document detection',
          'Controlled distribution lists with download receipt tracking',
          'Document redaction for sharing with subcontractors (remove pricing)',
          'Configurable retention policies (3/5/7/10 years or indefinite)',
          'Legal hold capability to suspend retention deletions',
          'Bulk download as ZIP, bulk tag, bulk share operations',
          'Soft delete (archive) with restore capability',
          'Mobile upload with auto-categorization',
          'Storage quota tracking with usage dashboard',
        ]}
        connections={[
          { name: 'Contracts', type: 'input', description: 'Executed contracts stored and AI-extracted' },
          { name: 'Client Portal', type: 'output', description: 'Portal-visible documents shared with client' },
          { name: 'Vendor Portal', type: 'output', description: 'Plans, specs, and submittals shared with vendors' },
          { name: 'Invoices', type: 'bidirectional', description: 'Invoice PDFs stored, AI-extracted, and linked to AP' },
          { name: 'Permits & Inspections', type: 'bidirectional', description: 'Permit documents tracked with expiration alerts' },
          { name: 'Warranties', type: 'input', description: 'Warranty documents stored with expiration tracking' },
          { name: 'Insurance (COIs)', type: 'bidirectional', description: 'COI documents AI-extracted, vendor compliance tracked' },
          { name: 'Change Orders', type: 'bidirectional', description: 'CO documents stored and linked to budget impact' },
          { name: 'Lien Waivers', type: 'bidirectional', description: 'Waiver PDFs AI-extracted for type, amount, and signatures' },
          { name: 'Purchase Orders', type: 'bidirectional', description: 'PO documents linked to invoices and deliveries' },
          { name: 'Selections', type: 'input', description: 'Spec book PDFs AI-extracted for product selections' },
          { name: 'RFIs', type: 'bidirectional', description: 'RFI documents linked to plan references' },
          { name: 'Submittals', type: 'bidirectional', description: 'Submittal packages with approval workflow tracking' },
          { name: 'Document Intelligence', type: 'bidirectional', description: 'AI classification, extraction, and entity matching' },
          { name: 'Notification Engine', type: 'output', description: 'Alerts on expiration, approval status, distribution' },
        ]}
        dataFields={[
          { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
          { name: 'company_id', type: 'uuid', required: true, description: 'FK to companies (multi-tenant)' },
          { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
          { name: 'folder_id', type: 'uuid', description: 'FK to document_folders' },
          { name: 'filename', type: 'string', required: true, description: 'Original file name' },
          { name: 'storage_path', type: 'string', required: true, description: 'S3/Supabase storage path' },
          { name: 'mime_type', type: 'string', required: true, description: 'MIME type' },
          { name: 'file_size', type: 'bigint', required: true, description: 'Size in bytes' },
          { name: 'document_type', type: 'string', description: 'Classified type (invoice, plan, coi, etc.)' },
          { name: 'ai_classification', type: 'string', description: 'AI-suggested document type' },
          { name: 'ai_confidence', type: 'decimal', description: 'AI classification confidence 0-1' },
          { name: 'status', type: 'string', required: true, description: 'active | archived | deleted | legal_hold' },
          { name: 'current_version_id', type: 'uuid', description: 'FK to document_versions' },
          { name: 'thumbnail_path', type: 'string', description: 'Generated thumbnail path' },
          { name: 'uploaded_by', type: 'uuid', required: true, description: 'User who uploaded' },
          { name: 'tags', type: 'string[]', description: 'User and AI-applied tags' },
          { name: 'expires_at', type: 'date', description: 'Expiration date (COIs, permits, licenses)' },
          { name: 'portal_visible', type: 'boolean', description: 'Visible in client portal' },
          { name: 'shared_with_vendors', type: 'uuid[]', description: 'Vendor IDs with access' },
          { name: 'extraction_status', type: 'string', description: 'pending | processing | completed | failed' },
          { name: 'extracted_text', type: 'text', description: 'OCR/parsed full-text content' },
          { name: 'ingested_via', type: 'string', description: 'upload | email | scan | api' },
          { name: 'created_at', type: 'timestamp', required: true, description: 'Upload timestamp' },
          { name: 'updated_at', type: 'timestamp', description: 'Last modification timestamp' },
        ]}
        aiFeatures={[
          {
            name: 'Document Auto-Classification',
            description: 'AI identifies document type on upload (invoice, contract, plan, COI, lien waiver, permit, submittal, spec book, etc.) and routes to the correct folder. Confidence scored per classification. User confirms or corrects -- corrections improve future accuracy.',
            trigger: 'On upload'
          },
          {
            name: 'OCR & Text Extraction',
            description: 'Extracts text from PDFs via pdf-parse, images via OCR (Tesseract/Cloud Vision), and Office documents. Extracted text indexed for full-text search. Results available within 60 seconds for PDFs, 2 minutes for OCR.',
            trigger: 'On upload (async)'
          },
          {
            name: 'Entity Extraction',
            description: 'Extracts structured data from documents: vendor names, amounts, dates, permit numbers, policy numbers, coverage limits, expiration dates. Matches entities to existing records (vendors, jobs, POs).',
            trigger: 'On upload'
          },
          {
            name: 'Expiration Tracking & Alerts',
            description: 'Auto-detects expiration dates from COIs, permits, and licenses. Sends alerts at 90, 60, 30, and 14 days before expiration. Dashboard widget shows expiring documents. Vendor compliance view shows expired/expiring insurance.',
            trigger: 'Daily check + on upload'
          },
          {
            name: 'Missing Document Detection',
            description: 'Identifies required documents missing for current construction phase: "Phase: Rough-in. Missing: Electrical inspection report, Plumbing inspection report. Required before drywall can proceed."',
            trigger: 'On phase advancement'
          },
          {
            name: 'Smart Full-Text Search',
            description: 'Natural language search across all document contents with highlighted matching snippets. Search by filename, tags, document type, content, date range, or uploader.',
            trigger: 'On search'
          },
          {
            name: 'Spec Book AI Extraction',
            description: 'Processes multi-page specification books: detects structure (by room, by CSI division), extracts product selections with full detail (manufacturer, model, finish, quantity), cross-references rooms with plan room schedule, calculates quantities.',
            trigger: 'On spec book upload'
          },
          {
            name: 'COI Compliance Check',
            description: 'Extracts coverage types, limits, and dates from COIs. Checks against builder minimum requirements. Flags deficiencies: "Missing workers comp" or "GL limit below $2M minimum." Verifies additional insured status.',
            trigger: 'On COI upload'
          },
          {
            name: 'Lien Waiver Extraction',
            description: 'Identifies waiver type (conditional/unconditional progress/final), vendor, amount, through-date, and signature presence. Matches to vendor and draw records. Flags missing notarization for states that require it.',
            trigger: 'On lien waiver upload'
          },
        ]}
        mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Files - Smith Residence                     [Upload] [New Folder]   │
├─────────────────────────────────────────────────────────────────────┤
│ Search: [Find in all documents...                    ] [🔍]        │
├──────────────────┬──────────────────────────────────────────────────┤
│ FOLDERS          │  📁 PLANS (12 files)                             │
│                  │                                                  │
│ 📁 Plans (12)    │  ┌─────────────────────────────────────────────┐ │
│ 📁 Permits (5)   │  │ 📄 Architectural Plans v3.pdf        8.2 MB │ │
│ 📁 Contracts (3) │  │    Updated: Jan 15 | Version 3 of 3         │ │
│ 📁 Specs (8)     │  │    🌐 Shared with: Client, All Vendors      │ │
│ 📁 Warranties (2)│  │    [Preview] [Download] [Share] [Versions]  │ │
│ 📁 Insurance (4) │  └─────────────────────────────────────────────┘ │
│ 📁 Inspections(6)│  ┌─────────────────────────────────────────────┐ │
│ 📁 Photos (156)  │  │ 📄 Structural Engineering.pdf        2.1 MB │ │
│                  │  │    Uploaded: Jan 10 | Version 1              │ │
│ ─────────────────│  │    🌐 Shared with: Framing Contractor       │ │
│ ALERTS           │  └─────────────────────────────────────────────┘ │
│ ⚠ Insurance exp  │  ┌─────────────────────────────────────────────┐ │
│   in 30 days     │  │ 📄 MEP Plans.dwg                     4.5 MB │ │
│ ⚠ Missing: Elec  │  │    Uploaded: Jan 8 | CAD Drawing            │ │
│   inspection     │  │    🌐 Shared with: Electrical, Plumbing     │ │
│                  │  └─────────────────────────────────────────────┘ │
├──────────────────┴──────────────────────────────────────────────────┤
│ AI: "2 documents expiring soon. 1 required inspection missing.      │
│ Permit expires Feb 28—renewal process typically takes 2 weeks."     │
└─────────────────────────────────────────────────────────────────────┘
`}
      />}
    </div>
  )
}
