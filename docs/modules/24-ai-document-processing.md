# Module 24: AI-Powered Document Processing

**Phase:** 4 - Intelligence
**Status:** TODO
**Priority:** High (operational efficiency multiplier)

---

## Overview

An AI/ML pipeline that automatically classifies, processes, and extracts structured data from the wide variety of documents that flow through a construction management operation: invoices, bids, contracts, certificates of insurance, lien waivers, architectural plans, specifications, photos, and more. Extends the existing invoice AI (Module 13) into a comprehensive document intelligence system with OCR, NLP, computer vision for photos, confidence scoring, and a human-in-the-loop learning feedback mechanism. Every correction a user makes trains the system to be more accurate over time, and the multi-tenant architecture supports both per-builder learning and cross-tenant model improvement.

---

## Gap Items Addressed

| Gap # | Description | Section |
|-------|-------------|---------|
| 476 | Photo storage scaling (millions of photos per large builder) | Photo Infrastructure |
| 477 | Photo AI auto-tagging (framing, plumbing, electrical, etc.) | Photo Intelligence |
| 478 | Photo access control (internal, client, marketing) | Photo Access |
| 479 | Video support (walkthrough videos, drone footage) | Media Support |
| 480 | Photo annotations (drawing on photos to highlight issues) | Photo Features |
| 491 | AI per-tenant vs. cross-tenant learning | Learning Strategy |
| 492 | Shared model with per-builder fine-tuning | Model Architecture |
| 493 | AI accuracy transparency with confidence scoring | Confidence Scoring |
| 494 | AI cold-start for new customers | Cold Start |
| 495 | AI feature availability by subscription tier | Tiered Access |
| 497 | User feedback loop for wrong AI recommendations | Learning Loop |
| 498 | AI-powered data entry (upload bid, extract line items, verify) | Data Extraction |
| 499 | AI plan takeoffs (rooms, fixtures, areas from plans) | Plan Analysis |
| 501 | AI suggestions vs. automation (configurable per builder) | Automation Config |
| 502 | AI anomaly detection across platform | Anomaly Detection |
| 503 | AI transparency / explainability | Explainability |
| 504 | AI document classification (invoice, bid, COI, plan, etc.) | Classification |
| 505 | AI communication assistance (draft updates, RFI responses) | Communication AI |

---

## Detailed Requirements

### 1. Document Classification

The system automatically classifies incoming documents into categories (Gap 504):

| Document Type | Key Extracted Fields |
|---------------|---------------------|
| Invoice | Vendor, amount, date, line items, PO reference |
| Bid/Proposal | Vendor, scope, line items, total, validity period |
| Certificate of Insurance (COI) | Carrier, policy number, coverage limits, expiration date, named insured |
| Lien Waiver | Type (conditional/unconditional, partial/final), vendor, amount, through-date |
| Contract/Subcontract | Parties, scope, amount, dates, key clauses |
| Change Order | CO number, description, amount, related contract |
| Architectural Plan | Sheet number, discipline, revision, scale, room labels |
| Specification | Section number, material requirements, product references |
| Permit | Permit type, number, jurisdiction, issue date, expiration |
| Warranty Document | Product, coverage term, conditions |
| W-9 / Tax Document | Legal name, TIN/EIN, address |
| Daily Report | Date, weather, workforce, activities |

- Classification uses a multi-label model: a single document can be classified as multiple types (e.g., a document that is both a lien waiver and a payment application).
- Confidence score on classification: high (>90%), medium (70-90%), low (<70%).
- Documents below the confidence threshold are queued for human review.

### Edge Cases & What-If Scenarios

1. **Document containing multiple invoices or mixed document types.** A single uploaded file (especially scanned PDFs from email) may contain multiple invoices, a combined invoice and lien waiver, or other mixed document types within one file. The system must detect page-level boundaries between distinct documents using layout analysis and classification confidence per page. When multiple documents are detected in a single file, the system splits them into separate processing records, each with its own classification and extraction. The user is notified of the split and can adjust boundaries if the AI got them wrong.

2. **Mixed typed and handwritten text in a single document.** Field documents frequently combine printed forms with handwritten entries (e.g., a typed invoice with handwritten notes, or a daily report template filled in by hand). The OCR pipeline must support hybrid recognition: typed text processed via standard OCR, handwritten regions processed via handwriting recognition (HTR) models. Confidence scores for handwritten fields should be inherently lower, and the system should route these fields to the human review queue more aggressively. The extraction review UI must clearly indicate which fields came from handwritten vs. typed text.

3. **AI correction feedback loop must be frictionless and effective.** The value of the AI document processing system depends on a virtuous cycle: users correct errors, corrections train the model, accuracy improves, and user trust grows. If corrections are difficult to make, users will stop correcting and lose trust in the system. Every extracted field must be correctable with a single click to edit. Corrections must include a "why this was wrong" optional tag (e.g., "wrong vendor," "misread amount," "wrong document type") to provide structured training signal. The system must track correction rates per document type and per field, display accuracy improvement trends to users ("Your invoice extraction accuracy improved from 82% to 94% over the last 3 months"), and surface a "why this suggestion" explanation (Gap 503) to build transparency and trust.

### 2. Data Extraction with Confidence Scoring

- For each document type, the system extracts structured fields using OCR + NLP (Gap 498).
- Every extracted field has an individual confidence score (Gap 493):
  - **High confidence (green)**: Auto-accepted; no user review needed (if automation is enabled).
  - **Medium confidence (yellow)**: Presented to user pre-filled; user confirms or corrects.
  - **Low confidence (red)**: Presented to user with best guess; requires explicit confirmation.
- Extraction pipeline:
  1. OCR: Convert document image/PDF to text (Tesseract, Google Vision API, or AWS Textract).
  2. Layout analysis: Identify document structure (tables, headers, line items, signatures).
  3. NLP entity extraction: Identify vendors, amounts, dates, addresses, policy numbers, etc.
  4. Schema mapping: Map extracted entities to the appropriate database fields.
  5. Validation: Cross-reference extracted data against existing records (vendor name matches known vendor, PO number exists, etc.).

### 3. Photo Auto-Tagging by Trade/Phase/Room

- Construction photo AI recognizes and tags photos with (Gap 477):
  - **Trade**: Framing, electrical, plumbing, HVAC, drywall, painting, roofing, concrete, etc.
  - **Phase**: Foundation, framing, rough-in, insulation, drywall, finishes, exterior, landscaping.
  - **Room**: Kitchen, master bedroom, bathroom, garage, living room, etc. (when identifiable).
  - **Elements**: Specific items visible (outlet box, window header, beam connection, etc.).
  - **Issues**: Potential defects or quality concerns (misaligned framing, water staining, incomplete work).
- Tags are applied with confidence scores; low-confidence tags are presented as suggestions.
- Tagging model is trained on construction-specific image datasets.

### 4. Photo & Media Infrastructure

- **Storage scaling**: Tiered storage architecture for builders with millions of photos (Gap 476):
  - Hot storage: Recent photos (last 6 months) -- fast access.
  - Warm storage: Older project photos -- slightly slower, lower cost.
  - Cold storage: Archived project photos -- retrieval with delay, minimal cost.
  - Storage allocation configurable per subscription tier.
- **Photo access control** (Gap 478):
  - Internal only: Visible to builder team only.
  - Client-shared: Visible in client portal.
  - Marketing: Flagged for marketing use (portfolio, website, social media).
  - Restricted: Sensitive photos (safety incidents, defects) with limited access.
- **Video support** (Gap 479):
  - Upload and playback for walkthrough videos and drone footage.
  - Video thumbnail generation.
  - Basic video trimming (start/end points).
  - Storage limits per subscription tier.
  - Video transcoding for web playback (MP4/H.264).
- **Photo annotations** (Gap 480):
  - Draw arrows, circles, rectangles, and freehand marks on photos.
  - Add text callouts.
  - Annotations saved as overlay layers (original photo preserved).
  - Annotation tools work on desktop and mobile.
  - Annotated photos can be shared in daily logs, punch lists, and RFIs.

### 5. Learning from Corrections

- Every user correction trains the model to be more accurate (Gap 497):
  - Document reclassified: model learns the correction.
  - Extracted field corrected: model learns the correct value.
  - Photo tag corrected: model learns the correct tag.
  - AI suggestion rejected with reason: model learns what to avoid.
- Feedback is stored with context (document type, builder, correction type) for targeted model improvement.
- Per-builder fine-tuning: corrections from Builder A improve predictions for Builder A's documents specifically (Gap 491, 492).
- Cross-builder improvement: anonymized corrections improve the base model for all builders (with consent).
- Correction metrics tracked: correction rate per document type, per field, trending over time. Goal: decreasing correction rate as model improves.

### 6. OCR and NLP Pipeline

**OCR Layer:**
- Primary: Cloud OCR service (Google Vision API or AWS Textract) for high accuracy.
- Fallback: Tesseract for offline/budget-tier processing.
- Handwriting recognition for field notes, daily logs, markup notations.
- Multi-page document support with page-level processing.
- Language support: English primary; Spanish for field documents (configurable).

**NLP Layer:**
- Named entity recognition (NER): vendors, people, addresses, amounts, dates.
- Table extraction: line items from invoices, bids, and specifications.
- Clause identification: key contract clauses (indemnification, warranty, payment terms, termination).
- Relationship extraction: linking entities across documents (this COI belongs to this vendor, this lien waiver references this invoice).

**Computer Vision Layer (Photos):**
- Object detection: construction elements, equipment, materials.
- Scene classification: interior/exterior, construction phase, trade activity.
- Progress detection: comparing photos from different dates to assess work progress.
- Safety hazard detection (future): identify potential safety violations in photos.

### 7. Document Processing Workflows

- **Automatic processing**: Document uploaded or emailed in; AI classifies, extracts, and routes to the appropriate module:
  - Invoice -> Invoice processing queue (Module 16)
  - COI -> Vendor compliance tracker (Module 22)
  - Lien waiver -> Lien waiver management (Module 16)
  - Bid -> Bid comparison tool (Module 20)
  - Plan revision -> Document management with version tracking (Module 15)
- **Review queue**: Documents below confidence threshold enter a review queue, sorted by priority (urgency, amount, sender).
- **Batch processing**: Support for bulk document upload (e.g., dump 50 documents from an email inbox) with batch classification and extraction.
- **Email integration**: Forward-to-system email address that auto-ingests attachments and processes them.

### 8. AI Communication Assistance

- Draft client update emails based on daily log data and project status (Gap 505).
- Suggest RFI responses based on similar historical RFIs.
- Generate change order descriptions from scope notes.
- All AI-generated text is presented as a draft for user editing -- never sent automatically.

### 9. Subscription Tier Feature Gating

- AI features available by tier (Gap 495):
  - **Basic**: No AI features. Manual document processing.
  - **Pro**: Document classification, basic data extraction, photo organization.
  - **Enterprise**: Full AI suite -- advanced extraction, photo auto-tagging, anomaly detection, communication assistance, plan analysis.
- Feature availability is controlled by the tenant feature flag system.


### 10. AI Photo Quality Analysis

Computer vision analysis of construction photos for automatic quality inspection and defect detection. This system enables proactive identification of construction defects, reducing the burden on manual inspection and improving overall build quality.

**Core Capabilities:**
- **Automatic defect detection**: Identifies cracks, gaps, misalignment, stains, damage, and incomplete work in construction photos
- **Defect classification**: Categorizes detected issues by type and severity (critical, major, minor, cosmetic)
- **Bounding box localization**: Pinpoints exact location of defects within images for easy identification
- **Confidence scoring**: Each detection includes a confidence score to prioritize human review
- **Punch list integration**: Auto-create punch items from detected defects with one click (integrates with Module 28)

**Defect Categories by Trade:**

| Trade | Detectable Defects |
|-------|-------------------|
| **Drywall** | Nail pops, cracks, visible joints, unfinished areas, water damage, tape bubbling, corner bead damage |
| **Paint** | Drips, uneven coverage, missed spots, color inconsistency, peeling, bleeding, brush/roller marks |
| **Flooring** | Gaps between boards, scratches, uneven transitions, buckled areas, squeaky spots (user-reported), staining |
| **Tile** | Grout issues (missing, cracked, discolored), cracked tiles, lippage, alignment problems, hollow tiles |
| **Framing** | Twisted studs, missing fasteners, improper spacing, out-of-plumb walls, crown issues |
| **Exterior** | Flashing issues, siding gaps, trim problems, caulking failures, drainage concerns, soffit/fascia damage |

**Severity Classification:**
- **Critical**: Safety hazard or structural concern requiring immediate attention
- **Major**: Significant quality issue that must be addressed before phase completion
- **Minor**: Noticeable defect that should be corrected before client walkthrough
- **Cosmetic**: Minor imperfection, may be acceptable depending on visibility and client standards

**Workflow:**
1. Photo uploaded or captured via mobile app
2. AI analysis runs automatically (or on-demand for batch processing)
3. Detected defects displayed with bounding boxes on photo
4. User reviews detections, confirms or dismisses false positives
5. Confirmed defects can be converted to punch items with pre-filled details
6. Corrections feed back into model training for improved accuracy

### 11. OCR Measurement Capture

Extract numeric measurements from photos of gauges, meters, and measuring instruments for automatic data capture and validation.

**Supported Measurement Types:**
- **Pressure gauges**: PSI readings from plumbing and HVAC tests
- **Thermometers**: Temperature readings in Fahrenheit and Celsius
- **Multimeters**: Voltage (V), amperage (A), resistance (Ohms) readings
- **Rulers/tape measures**: Linear measurements in inches, feet, centimeters, meters
- **Level indicators**: Degree measurements for slope and grade
- **Flow meters**: GPM/LPM readings for water flow tests
- **Humidity meters**: Relative humidity percentages

**Features:**
- **Automatic unit detection**: Recognizes measurement units from gauge labels and context
- **Range validation**: Compares extracted values against expected ranges for the measurement type
- **Historical tracking**: Stores measurement history for trend analysis and compliance documentation
- **Calibration alerts**: Flags readings that fall outside acceptable ranges
- **Multi-reading support**: Extracts multiple measurements from a single photo (e.g., multimeter with multiple displays)

**Use Cases:**
- Pressure testing documentation (plumbing rough-in, HVAC commissioning)
- Temperature verification for HVAC startup
- Electrical inspection readings
- Moisture content readings for flooring installation
- Concrete temperature and slump testing

### 12. AI-Generated Quality Reports

Automatically generate comprehensive inspection reports from photos and checklist data, reducing documentation time while improving report quality and consistency.

**Report Components:**
- **Executive summary**: High-level overview of inspection findings generated from photo analysis and checklist completion data
- **Areas of concern**: Highlighted sections with supporting images showing detected defects or incomplete work
- **Trend analysis**: Comparison with previous inspections to identify recurring issues or improvement patterns
- **Defect heat map**: Visual representation of defect concentration by area/room
- **Recommended next steps**: AI-suggested action items based on findings
- **Photo evidence**: Auto-selected photos with annotations highlighting key findings

**Report Types:**
- Pre-drywall inspection report
- Frame walk report
- Final punch list report
- Quality trend report (across multiple inspections)
- Trade-specific quality report
- Client walkthrough summary

**Export Options:**
- PDF with full annotations and photo evidence
- Summary PDF (executive overview only)
- Excel spreadsheet with defect data for analysis
- Integration with project management dashboard

**Customization:**
- Builder-specific report templates
- Configurable sections and branding
- Threshold settings for what constitutes "areas of concern"
- Automated distribution lists per report type

### 13. AI Quality Inspection Integration Points

The AI quality inspection system integrates with multiple modules to provide seamless workflow automation:

| Module | Integration |
|--------|-------------|
| **Module 28: Punch Lists** | Auto-create punch items from detected defects with pre-filled trade, location, description, and severity. Photo automatically attached. |
| **Module 8: Daily Logs** | Analyze daily log photos for potential issues; flag concerns for superintendent review. Surface quality trends in daily summary. |
| **Module 33: Safety Management** | Flag potential safety concerns identified in photos (missing guardrails, improper ladder use, tripping hazards). Route to safety officer. |
| **Module 32: Inspection Scheduling** | Support inspection documentation with AI-enhanced reports. Auto-populate inspection findings from photo analysis. |
| **Module 14: Daily Logs** | Correlate photo analysis with daily activities to identify which crews may need quality coaching. |
| **Module 22: Vendor Performance** | Track defect rates by trade contractor to inform vendor scorecards and future bid evaluations. |
---

## Database Tables

```
v2_document_classifications
  id, builder_id, document_id, classified_type, confidence, model_version,
  human_override_type, corrected_by, corrected_at, created_at

v2_document_extractions
  id, builder_id, document_id, classification_id, field_name, field_value,
  confidence, human_override_value, corrected_by, corrected_at,
  validation_status (valid|invalid|unverified), created_at

v2_extraction_templates
  id, document_type, field_name, field_type (text|number|date|currency|enum),
  extraction_hint, validation_rule, is_required, sort_order

v2_ai_feedback
  id, builder_id, feedback_type (classification|extraction|photo_tag|suggestion|anomaly),
  source_id, original_value, corrected_value, correction_reason,
  created_by, created_at

v2_photo_tags
  id, photo_id, tag_type (trade|phase|room|element|issue), tag_value,
  confidence, source (ai|manual), corrected_by, corrected_at, created_at

v2_photo_annotations
  id, photo_id, annotation_type (arrow|circle|rectangle|freehand|text),
  annotation_data_json, color, created_by, created_at

v2_photo_access
  id, photo_id, access_level (internal|client|marketing|restricted),
  set_by, created_at

v2_media_files
  id, builder_id, project_id, file_type (photo|video|drone), file_url,
  thumbnail_url, storage_tier (hot|warm|cold), file_size_bytes,
  width, height, duration_seconds, captured_at, uploaded_by, created_at

v2_document_processing_queue
  id, builder_id, document_id, status (pending|processing|review_needed|completed|failed),
  classification_confidence, priority, assigned_to, processed_at, created_at

v2_ai_models
  id, model_type (classification|extraction|photo_tagging|nlp),
  model_version, accuracy_score, training_data_size, deployed_at, created_at

v2_ai_model_tenant_layers
  id, model_id, builder_id, fine_tune_data_size, correction_count,
  last_trained_at, accuracy_delta, created_at

v2_communication_drafts
  id, builder_id, draft_type (client_update|rfi_response|co_description),
  source_context_json, generated_text, status (generated|edited|sent|discarded),
  edited_text, created_by, created_at

# AI Photo Quality Analysis Tables

v2_ai_photo_analysis
  id, photo_id, builder_id, project_id, analysis_type,
  detections JSONB, confidence_score, processed_at,
  model_version, processing_time_ms

v2_ai_defect_detections
  id, analysis_id, defect_type, severity (critical|major|minor|cosmetic),
  confidence, bounding_box JSONB, description, suggested_action,
  linked_punch_item_id, reviewed_by, review_status (pending|confirmed|dismissed),
  created_at, reviewed_at

v2_ai_measurement_extractions
  id, photo_id, measurement_type, extracted_value,
  extracted_unit, confidence, bounding_box JSONB,
  validated_value, validation_status (valid|invalid|pending),
  expected_range_min, expected_range_max, created_at
```

---

## API Endpoints

```
# Document Classification & Extraction
POST   /api/v2/ai/documents/process                  # Upload and process a document
POST   /api/v2/ai/documents/batch                    # Batch upload and process
GET    /api/v2/ai/documents/:id/classification       # Get classification result
GET    /api/v2/ai/documents/:id/extraction            # Get extracted fields
PUT    /api/v2/ai/documents/:id/classification        # Correct classification
PUT    /api/v2/ai/documents/:id/extraction/:fieldId   # Correct extracted field
GET    /api/v2/ai/documents/queue                     # Review queue (items needing human review)
PUT    /api/v2/ai/documents/queue/:id/approve          # Approve extracted data
PUT    /api/v2/ai/documents/queue/:id/reject           # Reject and re-process

# Photo Intelligence
POST   /api/v2/ai/photos/:id/tag                     # Trigger AI tagging on a photo
GET    /api/v2/ai/photos/:id/tags                    # Get tags for a photo
PUT    /api/v2/ai/photos/:id/tags/:tagId             # Correct a tag
POST   /api/v2/ai/photos/batch-tag                   # Batch tag multiple photos
GET    /api/v2/ai/photos/search                      # Search photos by tags

# Photo & Media Management
POST   /api/v2/media/upload                          # Upload photo/video
GET    /api/v2/media/:id                             # Get media file details
PUT    /api/v2/media/:id/access                      # Set access level
POST   /api/v2/media/:id/annotate                    # Add annotation to photo
GET    /api/v2/media/:id/annotations                 # Get annotations for a photo
PUT    /api/v2/media/:id/archive                     # Move to cold storage
GET    /api/v2/projects/:projectId/media              # List all media for a project (filterable)
GET    /api/v2/projects/:projectId/media/gallery      # Photo gallery with filters

# AI Feedback & Learning
POST   /api/v2/ai/feedback                           # Submit correction/feedback
GET    /api/v2/ai/feedback/stats                     # Correction rate metrics
GET    /api/v2/ai/models/status                      # Model accuracy and training status

# Communication Assistance
POST   /api/v2/ai/draft/client-update                # Generate client update draft
POST   /api/v2/ai/draft/rfi-response                 # Generate RFI response draft
POST   /api/v2/ai/draft/change-order-description      # Generate CO description draft

# Plan Analysis (Future)
POST   /api/v2/ai/plans/analyze                      # Upload plans for AI analysis
GET    /api/v2/ai/plans/:id/rooms                    # Get identified rooms and areas
GET    /api/v2/ai/plans/:id/takeoff                   # Get preliminary takeoff quantities

# Configuration
GET    /api/v2/ai/config                             # Get builder's AI configuration
PUT    /api/v2/ai/config                             # Update AI settings (automation level, features)
GET    /api/v2/ai/config/tier                        # Get available AI features for current subscription

# AI Photo Quality Analysis
POST   /api/v2/ai/photos/analyze                     # Analyze a single photo for defects and quality issues
GET    /api/v2/ai/photos/:id/analysis                # Get analysis results for a specific photo
POST   /api/v2/ai/photos/batch-analyze               # Batch analyze multiple photos for defects
GET    /api/v2/ai/defects                            # List all detected defects (filterable by project_id, severity, status)
POST   /api/v2/ai/defects/:id/create-punch-item      # Convert a detected defect into a punch list item
PUT    /api/v2/ai/defects/:id/review                 # Confirm or dismiss a detected defect
POST   /api/v2/ai/photos/extract-measurement         # Extract measurement readings from a photo
GET    /api/v2/ai/measurements/:photoId              # Get extracted measurements for a photo
GET    /api/v2/ai/quality-report/:projectId          # Generate AI quality report for a project
POST   /api/v2/ai/quality-report/:projectId/export   # Export quality report to PDF
```

---

## UI Components

| Component | Description |
|-----------|-------------|
| `DocumentProcessingQueue` | Dashboard showing documents pending review with classification and confidence |
| `ExtractionReviewForm` | Form showing extracted fields with confidence colors (green/yellow/red) for user verification |
| `ClassificationCorrector` | Dropdown to reclassify a document if AI got it wrong |
| `PhotoGallery` | Filterable grid of project photos with tag-based filtering |
| `PhotoTagger` | Tag display and correction UI on individual photos |
| `PhotoAnnotationTool` | Canvas-based tool for drawing arrows, circles, text on photos |
| `PhotoAccessControl` | Toggle/dropdown to set photo visibility level |
| `VideoPlayer` | In-app video player with thumbnail preview |
| `BatchUploadProgress` | Progress indicator for bulk document/photo uploads |
| `AIConfidenceBadge` | Color-coded badge showing extraction confidence per field |
| `CorrectionFeedbackForm` | Captures reason when user corrects AI output |
| `ModelAccuracyDashboard` | Charts showing correction rate trends and model improvement over time |
| `CommunicationDraftEditor` | AI-generated draft with edit, approve, and discard actions |
| `DocumentClassificationPill` | Visual pill showing document type and confidence on document cards |
| `SmartSearchBar` | Search across all documents using extracted text and tags |
| `PlanViewerWithAI` | Plan viewer showing AI-identified rooms and elements (future) |
| `AIFeatureTierBanner` | Banner showing available AI features and upgrade prompt for locked features |
| `DefectDetectionViewer` | Photo viewer with bounding box overlays showing detected defects |
| `DefectReviewPanel` | Side panel for reviewing, confirming, or dismissing detected defects |
| `DefectToPunchItemModal` | Modal for converting a detected defect to a punch list item with pre-filled fields |
| `MeasurementExtractor` | Interface for capturing and validating gauge/meter readings from photos |
| `QualityReportGenerator` | Dashboard for generating and customizing AI quality reports |
| `DefectHeatMap` | Visual heat map showing defect concentration by room/area |
| `QualityTrendChart` | Time-series chart showing quality metrics across inspections |

---

## Dependencies

- **Module 6: Document Storage** -- document and photo file storage, metadata
- **Module 13: Invoice AI** -- shared OCR/extraction infrastructure, invoice-specific processing
- **Module 15: Document Management** -- document organization, version tracking, folder structure
- **Module 16: Invoice Processing** -- destination for classified invoices and lien waivers
- **Module 22: Vendor Performance** -- destination for classified COIs, compliance documents; defect rate tracking by trade contractor
- **Module 20: Estimating Engine** -- destination for classified bids; plan takeoff data
- **Module 14: Daily Logs** -- photo attachment context, daily report processing
- **Module 28: Punch Lists** -- destination for defects converted to punch items
- **Module 32: Inspection Scheduling** -- AI-enhanced inspection reports
- **Module 33: Safety Management** -- safety concern flagging from photo analysis
- **Cloud AI Services** -- OCR (Google Vision / AWS Textract), NLP, computer vision models
- **Storage Service** -- Tiered object storage (S3/similar) for photos and videos

---

## Open Questions

1. Which cloud AI provider should be primary for OCR and document extraction -- Google Vision API, AWS Textract, or Azure Form Recognizer? Decision factors: accuracy, cost, construction-specific training data availability.
2. For photo auto-tagging (Gap 477), should we use a pre-trained construction image model, fine-tune a general model, or build from scratch? What training data is available?
3. What is the realistic accuracy target for V1 document classification? 80%? 90%? How does this affect the human review workload?
4. For AI plan takeoffs (Gap 499), what is the V1 scope -- room identification + area calculation only, or should it attempt fixture counting and material estimation?
5. How should the email integration work -- one forwarding address per builder, per project, or per document type?
6. What are the storage cost implications of tiered photo storage at scale? At what scale do we need to move from hot to warm storage automatically?
7. For communication assistance (Gap 505), should AI-generated drafts be clearly watermarked/labeled so recipients know AI was involved?
8. For defect detection, what is the acceptable false positive rate before users lose trust in the system? Should severity thresholds be configurable per builder?
9. What training data is available for construction defect detection models? Should we partner with inspection companies for labeled datasets?
10. For measurement extraction, should the system require calibration photos for each gauge type to improve accuracy?
