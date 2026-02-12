# Module 13: Full Invoice Processing with AI

**Phase:** 3 - Financial Power
**Status:** TODO
**Last Updated:** 2026-02-11

---

## Overview

AI-powered invoice processing that automates data extraction from uploaded invoice documents (PDF, email, photo) using OCR and machine learning. The system auto-codes invoices based on vendor history, provides confidence scoring on all extracted fields, and learns from human corrections to improve accuracy over time. This module extends Module 11 (Basic Invoicing) -- it does not replace it. All AI outputs feed into the same approval workflow, cost coding, and payment pipeline. AI capabilities are configurable per builder and gated by subscription tier.

---

## Gap Items Addressed

| Gap # | Description | How Addressed |
|-------|-------------|---------------|
| 344 | Per-tenant invoice pattern learning | AI model learns vendor-to-cost-code mappings per builder |
| 498 | AI-powered data entry (upload bid, AI extracts line items) | OCR extraction pipeline for invoices, bids, and receipts |
| 491 | Per-tenant vs. cross-tenant AI learning | Hybrid model: shared base + per-builder fine-tuning layer |
| 492 | AI model training per builder | Per-builder correction history drives personalized suggestions |
| 493 | AI accuracy transparency (confidence scoring) | Confidence scores on every extracted field with data point counts |
| 494 | AI cold-start for new customers | Industry benchmarks + vendor database for initial suggestions |
| 495 | AI feature availability by subscription tier | Feature flags gate AI capabilities: off, suggestions, automation |
| 496 | AI data requirements (minimum history) | Progressive activation: basic matching at 5 invoices, full AI at 50+ |
| 497 | AI recommendations that are wrong (feedback loop) | Correction workflow feeds back into per-builder model |
| 501 | AI suggestions vs. automation (configurable) | Builder setting: suggest-only, auto-fill-with-review, or full-auto |
| 502 | AI anomaly detection | Invoice amount anomaly detection against vendor/scope history |
| 503 | AI transparency (explain recommendations) | "Why this suggestion" tooltip showing reasoning and data sources |
| 504 | AI document classification | Auto-classify uploaded documents: invoice, receipt, bid, lien waiver, COI |

---

## Detailed Requirements

### 1. Document Ingestion

- **Upload channels:**
  - Direct upload via web UI (drag-and-drop, file picker)
  - Mobile camera capture (photo of paper invoice)
  - Email forwarding (dedicated builder-specific email address: `invoices-{builder_code}@platform.com`)
  - Batch upload (multiple files at once, up to 50)
  - API upload for third-party integrations
- **Supported formats:** PDF, JPEG, PNG, HEIC, TIFF
- **Pre-processing:**
  - Image rotation/deskew correction
  - Multi-page PDF handling (each page or logical invoice boundary)
  - Quality assessment (reject unreadable images with feedback)
  - Duplicate file detection (hash-based before OCR)

### 2. AI Extraction Pipeline

- **Stage 1 -- OCR:** Extract raw text from document using OCR engine
- **Stage 2 -- Field Extraction:** Identify and extract structured fields:
  - Vendor name and address
  - Invoice number
  - Invoice date
  - Due date / payment terms
  - Line items (description, quantity, unit price, amount)
  - Subtotal, tax, total
  - PO number (if present)
  - Project reference (if present)
  - Remittance address
- **Stage 3 -- Entity Matching:** Match extracted vendor name to existing vendor in system
  - Fuzzy matching on vendor name and address
  - Historical vendor invoice patterns
  - New vendor detection with create-vendor suggestion
- **Stage 4 -- Auto-Coding:** Suggest cost codes for each line item
  - Based on: vendor history for this builder, line item description, similar invoices
  - Multiple suggestions ranked by confidence
- **Stage 5 -- Validation:**
  - Line item amounts sum to subtotal/total check
  - Duplicate invoice detection (vendor + invoice number + amount)
  - Amount anomaly detection (significantly higher/lower than historical for this vendor+scope)
  - PO matching (if PO number extracted and builder uses POs)

### 3. Confidence Scoring

- Every extracted field receives a confidence score (0-100%)
- Confidence thresholds configurable per builder:
  - **High confidence (>90%):** Auto-accepted, no review needed
  - **Medium confidence (70-90%):** Pre-filled but flagged for review
  - **Low confidence (<70%):** Highlighted in red, requires manual entry
- Aggregate invoice confidence: lowest individual field score
- Confidence display shows:
  - Score percentage
  - Number of historical data points used
  - Reasoning ("matched 47 previous invoices from this vendor")
- Builder-configurable automation level:
  - **Suggest Only:** All fields pre-filled but every invoice requires human review
  - **Auto with Review:** High-confidence invoices auto-submitted; medium/low queued for review
  - **Full Auto:** High-confidence invoices auto-submitted and auto-approved (if within threshold)

### 4. Review Workflow

- AI extraction review screen showing:
  - Original document (PDF/image) on left panel
  - Extracted data in editable form on right panel
  - Confidence indicators on each field (green/yellow/red)
  - "Why this suggestion" tooltip on each AI-filled field
- Review actions:
  - Accept all (confirm AI extraction is correct)
  - Edit individual fields (correction feeds back to AI)
  - Reject and re-extract (try again with hints)
  - Reject and enter manually (AI failed, manual entry fallback)
- Review queue with prioritization:
  - Low-confidence invoices surfaced first
  - High-value invoices surfaced before low-value
  - Overdue invoices prioritized
- Batch review mode: quickly tab through multiple invoices

### 5. Learning from Corrections

- Every human correction is stored as training data
- Per-builder learning:
  - "This vendor's invoices always code to cost code 31-100 for this builder"
  - "This builder categorizes 'dumpster rental' under 01-500, not 31-000"
  - "This vendor's invoice format changed -- update extraction template"
- Cross-tenant learning (anonymized, opt-in):
  - "Across all builders, invoices from Home Depot are 95% likely to be materials"
  - Common vendor invoice format templates shared across platform
- Learning metrics visible to builder admin:
  - Accuracy rate over time (trending up as system learns)
  - Number of corrections needed per month
  - Top vendors with highest/lowest extraction accuracy
- Model retraining triggers:
  - After N corrections (configurable, default 10)
  - Monthly scheduled retraining
  - On-demand retrain button for admin

### 6. Batch Processing

- Upload multiple invoices at once (drag-and-drop folder or multi-select)
- Batch processing queue with status for each document:
  - Queued, Processing, Extracted, Review Required, Complete, Failed
- Batch review interface: carousel through extracted invoices
- Batch auto-coding: apply same cost code to multiple similar line items
- Progress indicator showing batch completion
- Email notification when batch processing completes
- Batch error handling: failed documents separated, reasons provided

### 7. Document Classification

- Uploaded documents automatically classified:
  - Invoice, Receipt, Credit Memo, Bid/Quote, Lien Waiver, COI, Contract, Other
- Classification confidence score
- Mis-classified documents rerouted to correct module
- "Not an invoice" detection prevents non-invoice documents from entering invoice pipeline

### 8. Anomaly Detection

- Flag invoices where amount is significantly outside historical range for vendor + scope
- Detect potential duplicate invoices (same vendor, similar amount, close dates)
- Flag unusual line items (new cost code never used with this vendor)
- Alert on vendor invoicing frequency anomalies (vendor usually invoices monthly, submitted 3 this week)
- Configurable alert thresholds per builder

---

## Database Tables

```
v2_ai_extraction_jobs
  id, builder_id, document_id, upload_source (web|mobile|email|api),
  file_url, file_type, file_hash,
  status (queued|processing|extracted|review_required|complete|failed),
  document_class (invoice|receipt|credit_memo|bid|lien_waiver|coi|other),
  class_confidence, processing_started_at, processing_completed_at,
  error_message, created_by, created_at

v2_ai_extracted_fields
  id, builder_id, job_id, field_name, extracted_value,
  confidence_score, data_points_used, reasoning,
  human_corrected, corrected_value, corrected_by, corrected_at,
  created_at

v2_ai_extracted_line_items
  id, builder_id, job_id, line_number,
  description, quantity, unit_price, amount,
  confidence_score, suggested_cost_code_id,
  cost_code_confidence, alternative_cost_codes (jsonb),
  human_corrected, corrected_cost_code_id,
  corrected_by, corrected_at, created_at

v2_ai_vendor_patterns
  id, builder_id, vendor_id, pattern_type (cost_code|format|frequency),
  pattern_data (jsonb), sample_count, last_updated, created_at

v2_ai_training_corrections
  id, builder_id, job_id, field_name,
  original_value, corrected_value,
  correction_type (field_value|cost_code|vendor_match|classification),
  applied_to_model, applied_at, created_at

v2_ai_model_metrics
  id, builder_id, metric_type (accuracy|corrections|throughput),
  metric_date, value, sample_count, created_at

v2_ai_anomaly_alerts
  id, builder_id, invoice_id, anomaly_type (amount|duplicate|frequency|new_code),
  description, severity (low|medium|high),
  is_dismissed, dismissed_by, dismissed_at,
  created_at

v2_ai_builder_settings
  id, builder_id, automation_level (suggest|auto_review|full_auto),
  high_confidence_threshold, medium_confidence_threshold,
  auto_approve_max_amount, enable_cross_tenant_learning,
  email_forwarding_address, batch_notification_email,
  created_at, updated_at
```

---

## API Endpoints

```
# Document Upload & Processing
POST   /api/v2/invoices/ai/upload          # Upload document(s) for AI processing
POST   /api/v2/invoices/ai/upload/batch    # Batch upload multiple documents
GET    /api/v2/invoices/ai/jobs            # List extraction jobs with status
GET    /api/v2/invoices/ai/jobs/:id        # Job detail with extracted fields

# Review & Correction
GET    /api/v2/invoices/ai/review-queue    # Invoices needing human review
POST   /api/v2/invoices/ai/jobs/:id/accept # Accept AI extraction (creates invoice)
POST   /api/v2/invoices/ai/jobs/:id/correct # Submit corrections
POST   /api/v2/invoices/ai/jobs/:id/reject # Reject extraction, manual entry

# Anomaly Alerts
GET    /api/v2/invoices/ai/anomalies       # List anomaly alerts
PUT    /api/v2/invoices/ai/anomalies/:id/dismiss # Dismiss alert

# AI Performance Metrics (builder admin)
GET    /api/v2/invoices/ai/metrics         # Accuracy, corrections, throughput over time
GET    /api/v2/invoices/ai/metrics/vendors # Per-vendor accuracy metrics

# AI Settings (builder admin)
GET    /api/v2/invoices/ai/settings        # Get AI configuration
PUT    /api/v2/invoices/ai/settings        # Update AI configuration

# Email Forwarding
GET    /api/v2/invoices/ai/email-address   # Get builder's forwarding email address
POST   /api/v2/invoices/ai/email/webhook   # Inbound email webhook (internal)

# Document Classification
POST   /api/v2/invoices/ai/classify        # Classify a document without full extraction
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| AIUploadZone | Drag-and-drop upload area with batch support and format validation |
| ExtractionReviewScreen | Split view: original document left, extracted data form right, confidence indicators |
| ConfidenceBadge | Color-coded confidence indicator (green/yellow/red) with tooltip showing score and reasoning |
| ReviewQueueList | Prioritized list of invoices needing human review with confidence summaries |
| BatchProcessingTracker | Progress bar and status for batch uploads with per-document status |
| CorrectionForm | Editable form for correcting AI-extracted fields with "apply to future" checkbox |
| AnomalyAlertBanner | Alert banner on invoice showing detected anomalies with dismiss option |
| AIMetricsDashboard | Charts showing accuracy trends, correction rates, throughput over time |
| AISettingsPanel | Builder admin configuration for automation level, thresholds, cross-tenant learning |
| VendorPatternViewer | Shows learned patterns for a vendor (common cost codes, invoice format, frequency) |
| DocumentClassifier | Shows classification result with confidence and reroute option |
| EmailForwardingSetup | Display forwarding address, copy button, setup instructions |

---

## Dependencies

- **Module 11:** Basic Invoicing (invoice data model, approval workflows, payment pipeline)
- **Module 6:** Document Storage (file upload, storage, retrieval)
- **Module 10:** Contact/Vendor Management (vendor matching and lookup)
- **Module 9:** Budget & Cost Tracking (cost code validation)
- **Module 18:** Purchase Orders (PO matching when applicable)
- **External:** OCR service provider (Google Document AI, AWS Textract, or Azure Form Recognizer)
- **External:** ML model hosting (for custom extraction and classification models)

---

## Open Questions

1. Which OCR/document AI provider? Google Document AI vs. AWS Textract vs. Azure Form Recognizer. Evaluate accuracy, cost, and multi-tenant data isolation.
2. Should per-builder AI models run as separate instances, or a single model with builder-specific feature vectors? Impacts cost and accuracy.
3. What is the SLA for extraction processing time? Target: under 30 seconds for single invoice, under 5 minutes for batch of 50.
4. How do we handle handwritten invoices? Some trades still use handwritten invoices -- OCR accuracy drops significantly.
5. Should the email forwarding address support attachments only, or also parse invoice data from the email body itself?
6. What is the minimum subscription tier for AI features? Should basic OCR be available on all plans with advanced AI on premium?
7. How do we handle the GDPR/privacy implications of cross-tenant learning? Need explicit opt-in and anonymization guarantees.
8. Should AI extraction support non-English invoices for future international expansion?
