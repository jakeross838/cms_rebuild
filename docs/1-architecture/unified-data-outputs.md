# Unified Data Outputs — Every Page, Every Field

**Last Updated:** 2026-02-12
**Purpose:** Define the structured data output for every page in the system. All data follows the Unified AI Processing Layer rule: raw input → AI extraction → structured output → display.

---

## How to Read This Document

Each page entry includes:

- **Route** — the URL path
- **Data Sources** — where raw data comes from (upload, manual entry, API, etc.)
- **AI Processing** — what the AI layer extracts/computes before the page can display it
- **Structured Output** — the exact fields the page consumes
- **Display Format** — how the data is presented to the user

Pages marked **[CONSUMER]** don't ingest raw data — they display structured data that was processed elsewhere. Pages marked **[INGESTOR]** are where raw data enters the system through the AI processing layer.

---

## PART 1: DATA INGESTION POINTS

These are the pages/flows where raw data enters the system. Every other page is a consumer of this processed data.

### Ingestion Point 1: Invoice Processing [INGESTOR]

**Entry points:** Email forward, PDF upload, photo capture, vendor portal submission

**AI Processing Pipeline:**
```
Raw Input (PDF/image/email)
    │
    ├─ Step 1: Classify → "vendor_invoice"
    ├─ Step 2: Extract fields (Claude Vision)
    ├─ Step 3: Match vendor → vendors table
    ├─ Step 4: Match job → jobs table (6-strategy matching)
    ├─ Step 5: Match PO → purchase_orders table
    ├─ Step 6: Suggest cost codes → cost_codes table
    ├─ Step 7: Detect duplicates → existing invoices
    ├─ Step 8: Score confidence per field
    └─ Step 9: Route (auto-approve / human review / reject)
```

**Structured Output Schema:**
```json
{
  "vendor_name": "string — matched to vendors.name",
  "vendor_id": "uuid — matched vendor record",
  "invoice_number": "string",
  "invoice_date": "date — ISO 8601",
  "due_date": "date — ISO 8601",
  "amount": "decimal",
  "tax_amount": "decimal",
  "retainage_amount": "decimal",
  "net_amount": "decimal",
  "po_number": "string — matched to purchase_orders.po_number",
  "po_id": "uuid — matched PO record",
  "job_reference": "string — extracted job name/number/address",
  "job_id": "uuid — matched job record",
  "line_items": [
    {
      "description": "string",
      "quantity": "decimal",
      "unit_price": "decimal",
      "amount": "decimal",
      "cost_code_id": "uuid — AI-suggested",
      "cost_code_confidence": "decimal 0-1"
    }
  ],
  "lien_waiver_detected": "boolean",
  "lien_waiver_type": "string — conditional_progress | unconditional_progress | conditional_final | unconditional_final",
  "backup_documents_detected": ["string — PO, receipt, timesheet, etc."],
  "confidence_scores": {
    "vendor": "decimal 0-1",
    "amount": "decimal 0-1",
    "invoice_number": "decimal 0-1",
    "date": "decimal 0-1",
    "job": "decimal 0-1",
    "po": "decimal 0-1",
    "cost_codes": "decimal 0-1",
    "overall": "decimal 0-1"
  },
  "routing": "auto_approve | human_review | needs_attention | rejected",
  "duplicate_warning": "boolean",
  "duplicate_match_id": "uuid | null",
  "raw_document_url": "string — storage path",
  "extracted_text": "string — full OCR text"
}
```

**Consumed by pages:**
- `/jobs/[id]/invoices` — invoice list, approval workflow
- `/jobs/[id]/budget` — actual costs column
- `/jobs/[id]/draws` — invoices included in draw
- `/jobs/[id]/lien-waivers` — detected lien waivers
- `/financial/dashboard` — AP totals
- `/financial/payables` — payment queue
- `/skeleton` (dashboard) — pending approvals count

---

### Ingestion Point 2: Daily Log Entry [INGESTOR]

**Entry points:** Voice recording, typed entry, photo upload with notes, field app

**AI Processing Pipeline:**
```
Raw Input (voice audio / text / photos)
    │
    ├─ Step 1: Transcribe voice → text (if audio)
    ├─ Step 2: Extract structured work items from narrative
    ├─ Step 3: Match vendors/subs mentioned → vendors table
    ├─ Step 4: Categorize by trade/phase → cost_codes
    ├─ Step 5: Detect issues/delays → categorize severity
    ├─ Step 6: Extract manpower counts per vendor
    ├─ Step 7: Auto-tag photos (trade, location, milestone)
    ├─ Step 8: Update schedule progress % from work described
    ├─ Step 9: Generate client-friendly summary (no internal notes)
    └─ Step 10: Fetch weather data for job location + date
```

**Structured Output Schema:**
```json
{
  "job_id": "uuid",
  "date": "date",
  "weather": {
    "condition": "string — sunny, cloudy, rain, snow, etc.",
    "temperature_high": "integer — F",
    "temperature_low": "integer — F",
    "precipitation": "decimal — inches",
    "wind_speed": "integer — mph",
    "humidity": "integer — %",
    "source": "string — auto (weather API) | manual"
  },
  "work_performed": [
    {
      "description": "string — human-readable",
      "trade": "string — framing, electrical, plumbing, etc.",
      "phase": "string — foundation, rough-in, finish, etc.",
      "cost_code_id": "uuid",
      "schedule_task_id": "uuid — matched to schedule task",
      "percent_complete_update": "integer — 0-100 if applicable",
      "location": "string — area of house/job"
    }
  ],
  "manpower": [
    {
      "vendor_id": "uuid",
      "vendor_name": "string",
      "headcount": "integer",
      "hours": "decimal",
      "trade": "string"
    }
  ],
  "deliveries": [
    {
      "description": "string",
      "vendor_id": "uuid",
      "po_id": "uuid — matched if found",
      "received_by": "string"
    }
  ],
  "issues": [
    {
      "description": "string",
      "category": "string — weather_delay | material_delay | rework | safety | design_conflict | inspection_fail | other",
      "severity": "string — low | medium | high | critical",
      "schedule_impact_days": "integer",
      "cost_impact": "decimal | null",
      "action_required": "string | null",
      "assigned_to": "string | null"
    }
  ],
  "visitors": [
    {
      "name": "string",
      "company": "string",
      "purpose": "string",
      "time_in": "time",
      "time_out": "time"
    }
  ],
  "photos": [
    {
      "url": "string",
      "ai_tags": {
        "trade": "string",
        "phase": "string",
        "location": "string",
        "is_milestone": "boolean",
        "quality_score": "decimal 0-1",
        "client_suitable": "boolean"
      }
    }
  ],
  "voice_transcript": "string — raw transcription",
  "ai_summary": "string — concise summary for dashboard",
  "ai_client_summary": "string — client-friendly version (no pricing, no internal issues)",
  "schedule_updates": [
    {
      "task_id": "uuid",
      "previous_percent": "integer",
      "new_percent": "integer",
      "source": "string — daily_log_ai"
    }
  ],
  "created_by": "uuid",
  "created_at": "timestamp"
}
```

**Consumed by pages:**
- `/jobs/[id]/daily-logs` — log timeline
- `/jobs/[id]/schedule` — auto-updated progress %
- `/jobs/[id]/photos` — tagged photos
- `/jobs/[id]` (job dashboard) — recent activity
- `/skeleton` (dashboard) — today's activity
- `/portal` (client portal) — client-friendly summary + curated photos

---

### Ingestion Point 3: Photo Upload [INGESTOR]

**Entry points:** Camera capture, file upload, daily log attachment, punch list attachment

**AI Processing Pipeline:**
```
Raw Input (image file)
    │
    ├─ Step 1: Extract EXIF metadata (GPS, timestamp, device)
    ├─ Step 2: Quality assessment (blur, exposure, composition)
    ├─ Step 3: Classify trade (framing, electrical, plumbing, roofing, etc.)
    ├─ Step 4: Classify phase (foundation, rough-in, drywall, finish, etc.)
    ├─ Step 5: Detect room/location (kitchen, master bath, exterior, etc.)
    ├─ Step 6: Milestone detection (first pour, topping out, dried in, etc.)
    ├─ Step 7: Duplicate/similar detection against existing photos
    ├─ Step 8: Client suitability scoring (clean, well-lit, shows progress)
    ├─ Step 9: Generate thumbnail + compressed versions
    └─ Step 10: Match to schedule task if identifiable
```

**Structured Output Schema:**
```json
{
  "job_id": "uuid",
  "file_url": "string — full res storage path",
  "thumbnail_url": "string — compressed",
  "taken_at": "timestamp — from EXIF or upload time",
  "uploaded_by": "uuid",
  "gps_lat": "decimal | null",
  "gps_lng": "decimal | null",
  "device": "string | null — from EXIF",
  "ai_tags": {
    "trade": "string — framing | electrical | plumbing | hvac | roofing | drywall | paint | tile | flooring | cabinetry | landscaping | concrete | other",
    "phase": "string — sitework | foundation | framing | rough_in | insulation | drywall | finish | exterior | landscaping",
    "location": "string — kitchen | master_bath | living_room | exterior_front | garage | etc.",
    "room_confidence": "decimal 0-1",
    "is_milestone": "boolean",
    "milestone_type": "string | null — first_pour | framed | dried_in | drywall_complete | trim_complete | etc.",
    "quality_score": "decimal 0-1",
    "client_suitable": "boolean",
    "is_duplicate": "boolean",
    "duplicate_of": "uuid | null",
    "description": "string — AI-generated caption"
  },
  "schedule_task_id": "uuid | null — matched task",
  "daily_log_id": "uuid | null — if from daily log",
  "punch_item_id": "uuid | null — if from punch list",
  "portal_visible": "boolean — based on client_suitable + builder setting"
}
```

**Consumed by pages:**
- `/jobs/[id]/photos` — gallery with filtering by tag
- `/jobs/[id]/daily-logs` — attached to log entries
- `/jobs/[id]/punch-list` — before/after documentation
- `/jobs/[id]` (job dashboard) — recent photos
- `/portal` (client portal) — curated client-suitable photos
- `/jobs/[id]/draws` — progress documentation

---

### Ingestion Point 4: Document Upload [INGESTOR]

**Entry points:** File upload, email attachment, scan

**AI Processing Pipeline:**
```
Raw Input (PDF/image/Word)
    │
    ├─ Step 1: Classify document type
    │   ├─ vendor_invoice → route to Invoice Processing
    │   ├─ lien_waiver → Lien Waiver extraction
    │   ├─ certificate_of_insurance → COI extraction
    │   ├─ construction_plan → Plan extraction
    │   ├─ specification_book → Spec Book extraction (NEW)
    │   ├─ contract → Contract extraction
    │   ├─ change_order → Change Order extraction
    │   ├─ bid_response → Bid extraction
    │   ├─ permit → Permit extraction
    │   ├─ aia_pay_app → Pay App extraction (G702/G703)
    │   └─ general_document → OCR + full-text index
    ├─ Step 2: Type-specific extraction (see sub-schemas below)
    ├─ Step 3: Match references to existing records
    ├─ Step 4: Score confidence
    └─ Step 5: Route to review or auto-file
```

Each document type has its own output schema. See sub-sections below.

---

### Ingestion Point 4a: Lien Waiver Extraction

**Structured Output Schema:**
```json
{
  "document_type": "lien_waiver",
  "waiver_type": "string — conditional_progress | unconditional_progress | conditional_final | unconditional_final",
  "vendor_name": "string",
  "vendor_id": "uuid — matched",
  "job_reference": "string",
  "job_id": "uuid — matched",
  "through_date": "date",
  "amount": "decimal",
  "claimant_signature": "boolean — signature detected",
  "notarized": "boolean",
  "state_form": "string — state-specific statutory form detected",
  "invoice_ids": ["uuid — matched invoices covered"],
  "confidence_scores": {
    "vendor": "decimal 0-1",
    "type": "decimal 0-1",
    "amount": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/jobs/[id]/lien-waivers`, `/jobs/[id]/draws`

---

### Ingestion Point 4b: Certificate of Insurance (COI) Extraction

**Structured Output Schema:**
```json
{
  "document_type": "certificate_of_insurance",
  "vendor_name": "string",
  "vendor_id": "uuid — matched",
  "insurance_company": "string",
  "policy_number": "string",
  "coverage_types": [
    {
      "type": "string — general_liability | auto | workers_comp | umbrella | professional",
      "each_occurrence": "decimal",
      "aggregate": "decimal",
      "effective_date": "date",
      "expiration_date": "date"
    }
  ],
  "additional_insured": "boolean — builder listed as additional insured",
  "additional_insured_name": "string | null",
  "certificate_holder": "string",
  "waiver_of_subrogation": "boolean",
  "meets_requirements": "boolean — checked against builder's minimums",
  "deficiencies": ["string — what's missing or below minimum"],
  "expiration_warning_days": "integer — days until earliest expiration",
  "confidence_scores": {
    "vendor": "decimal 0-1",
    "coverage": "decimal 0-1",
    "dates": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/compliance/insurance`, `/directory/vendors`, `/jobs/[id]/team`

---

### Ingestion Point 4c: Construction Plan Extraction

**Structured Output Schema:**
```json
{
  "document_type": "construction_plan",
  "sheets": [
    {
      "sheet_number": "string — A1.1, S2.0, etc.",
      "sheet_title": "string",
      "discipline": "string — architectural | structural | mechanical | electrical | plumbing | civil | landscape",
      "revision": "string",
      "revision_date": "date"
    }
  ],
  "room_schedule": [
    {
      "room_name": "string",
      "room_number": "string",
      "floor": "string",
      "area_sf": "decimal",
      "ceiling_height": "decimal",
      "floor_finish": "string",
      "wall_finish": "string",
      "ceiling_finish": "string",
      "notes": "string"
    }
  ],
  "door_schedule": [
    {
      "mark": "string",
      "size": "string",
      "type": "string",
      "material": "string",
      "hardware_set": "string",
      "fire_rating": "string | null"
    }
  ],
  "window_schedule": [
    {
      "mark": "string",
      "size": "string",
      "type": "string — casement, double-hung, fixed, etc.",
      "material": "string — vinyl, wood, aluminum, etc.",
      "glazing": "string",
      "u_value": "decimal | null",
      "shgc": "decimal | null"
    }
  ],
  "finish_schedule": [
    {
      "room": "string",
      "floor": "string — material + product if specified",
      "base": "string",
      "walls": "string",
      "ceiling": "string",
      "countertop": "string | null",
      "backsplash": "string | null",
      "notes": "string"
    }
  ],
  "structural_notes": ["string"],
  "general_notes": ["string"],
  "total_sf": "decimal",
  "stories": "integer",
  "garage_bays": "integer",
  "foundation_type": "string",
  "roof_type": "string",
  "confidence_scores": {
    "room_schedule": "decimal 0-1",
    "door_schedule": "decimal 0-1",
    "window_schedule": "decimal 0-1",
    "finish_schedule": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:**
- `/jobs/[id]/selections` — finish schedule feeds selection categories
- `/jobs/[id]/budget` — quantities for estimating
- `/jobs/[id]/files` — indexed and searchable
- `/jobs/[id]/rfis` — drawing reference linking
- `/jobs/[id]/submittals` — spec section linking

---

### Ingestion Point 4d: Specification Book Extraction [NEW]

**Entry points:** Designer uploads spec book PDF, builder uploads finish schedule

**AI Processing Pipeline:**
```
Raw Input (multi-page PDF — 50-200 pages)
    │
    ├─ Step 1: Detect structure (by room? by CSI division? by category?)
    ├─ Step 2: Chunk into logical sections
    ├─ Step 3: Per section — extract selections with full product detail
    ├─ Step 4: Cross-reference rooms (master bath tile on pg 12 = tile spec pg 87)
    ├─ Step 5: Match products to selections catalog if known
    ├─ Step 6: Match to plan room schedule (room names/sizes)
    ├─ Step 7: Calculate quantities from room sizes + coverage rates
    ├─ Step 8: Detect allowance amounts if specified
    ├─ Step 9: Flag items needing lead time attention
    └─ Step 10: Generate selection categories for job
```

**Structured Output Schema:**
```json
{
  "document_type": "specification_book",
  "source": "string — designer | builder | architect",
  "designer_name": "string | null",
  "revision": "string",
  "revision_date": "date",
  "structure_type": "string — by_room | by_csi_division | by_category | mixed",
  "rooms": [
    {
      "room_name": "string — Kitchen, Master Bathroom, Powder Room, etc.",
      "room_id": "uuid | null — matched to plan room_schedule",
      "floor": "string — Main, Upper, Lower, etc.",
      "area_sf": "decimal | null — from plan",
      "selections": [
        {
          "category": "string — flooring | tile | countertop | cabinetry | plumbing_fixture | lighting | hardware | paint | appliance | backsplash | mirror | shower_glass | specialty",
          "item_name": "string — Floor Tile, Vanity Faucet, etc.",
          "manufacturer": "string",
          "product_name": "string",
          "model_number": "string | null",
          "sku": "string | null",
          "finish_color": "string — Brushed Nickel, Matte White, etc.",
          "size_dimensions": "string | null — 24x48, 36 inch, etc.",
          "material": "string | null — porcelain, quartz, oak, etc.",
          "pattern": "string | null — staggered 1/3, herringbone, etc.",
          "quantity": "decimal | null",
          "unit": "string — SF, LF, EA, SET, etc.",
          "unit_price": "decimal | null — if specified in spec",
          "total_price": "decimal | null",
          "allowance_amount": "decimal | null — if allowance item",
          "is_allowance": "boolean",
          "lead_time_weeks": "integer | null",
          "vendor_id": "uuid | null — matched to catalog vendor",
          "catalog_match_id": "uuid | null — matched to selections catalog",
          "catalog_match_confidence": "decimal 0-1",
          "tier": "string | null — builder | standard | premium | luxury",
          "installation_notes": "string | null — special requirements",
          "grout_color": "string | null — for tile",
          "edge_profile": "string | null — for countertops",
          "door_style": "string | null — for cabinetry",
          "hardware": "string | null — for cabinetry",
          "source_page": "integer — page number in spec book",
          "image_url": "string | null — if spec includes product photo",
          "spec_notes": "string | null — designer notes"
        }
      ],
      "room_notes": "string | null — general notes for this room",
      "mood_board_url": "string | null — if mood board page detected"
    }
  ],
  "general_selections": [
    {
      "category": "string — exterior_siding | roofing | windows | doors | garage_door | driveway | landscaping | paint_exterior",
      "item_name": "string",
      "manufacturer": "string",
      "product_name": "string",
      "model_number": "string | null",
      "finish_color": "string",
      "quantity": "decimal | null",
      "unit": "string",
      "notes": "string | null",
      "source_page": "integer"
    }
  ],
  "paint_schedule": [
    {
      "room": "string",
      "surface": "string — walls | ceiling | trim | accent | doors",
      "manufacturer": "string — Sherwin-Williams, Benjamin Moore, etc.",
      "color_name": "string",
      "color_code": "string",
      "finish_sheen": "string — flat | eggshell | satin | semi-gloss | gloss",
      "notes": "string | null"
    }
  ],
  "plumbing_fixture_schedule": [
    {
      "room": "string",
      "fixture_type": "string — faucet | toilet | tub | shower_valve | sink | etc.",
      "manufacturer": "string",
      "model": "string",
      "finish": "string",
      "quantity": "integer"
    }
  ],
  "lighting_schedule": [
    {
      "room": "string",
      "fixture_type": "string — recessed | pendant | chandelier | sconce | under_cabinet | landscape | etc.",
      "manufacturer": "string",
      "model": "string",
      "finish": "string",
      "quantity": "integer",
      "switch_type": "string | null — dimmer | 3-way | smart | standard"
    }
  ],
  "hardware_schedule": [
    {
      "location": "string — interior_doors | exterior_doors | cabinetry_kitchen | cabinetry_bath | etc.",
      "type": "string — lever | knob | pull | hinge | deadbolt | etc.",
      "manufacturer": "string",
      "model": "string",
      "finish": "string",
      "quantity": "integer"
    }
  ],
  "appliance_schedule": [
    {
      "room": "string — kitchen | laundry | outdoor_kitchen | etc.",
      "appliance_type": "string — range | refrigerator | dishwasher | microwave | hood | washer | dryer | etc.",
      "manufacturer": "string",
      "model": "string",
      "dimensions": "string",
      "fuel_type": "string | null — gas | electric | dual",
      "finish": "string",
      "unit_price": "decimal | null"
    }
  ],
  "summary": {
    "total_rooms": "integer",
    "total_selections": "integer",
    "total_allowance_items": "integer",
    "total_allowance_value": "decimal",
    "items_matched_to_catalog": "integer",
    "items_needing_sourcing": "integer",
    "long_lead_items": "integer — items with lead time > 8 weeks",
    "categories_covered": ["string"],
    "categories_missing": ["string — categories in plan but not in spec"]
  },
  "confidence_scores": {
    "structure_detection": "decimal 0-1",
    "product_extraction": "decimal 0-1",
    "room_matching": "decimal 0-1",
    "catalog_matching": "decimal 0-1",
    "quantity_calculation": "decimal 0-1",
    "overall": "decimal 0-1"
  },
  "review_flags": [
    {
      "type": "string — missing_quantity | no_manufacturer | ambiguous_product | conflicting_spec | long_lead_time | over_allowance | no_catalog_match",
      "item": "string — what item",
      "room": "string",
      "message": "string — human-readable explanation"
    }
  ]
}
```

**Consumed by:**
- `/jobs/[id]/selections` — populates selection categories and options by room
- `/jobs/[id]/budget` — allowance amounts become budget lines
- `/jobs/[id]/purchase-orders` — long lead items flagged for early ordering
- `/jobs/[id]/schedule` — lead times feed into schedule constraints
- `/library/selections` — new products added to catalog

---

### Ingestion Point 4e: Contract / Change Order Extraction

**Structured Output Schema:**
```json
{
  "document_type": "string — contract | change_order",
  "contract_number": "string | null",
  "co_number": "string | null",
  "parties": {
    "builder": "string",
    "client": "string",
    "client_id": "uuid — matched"
  },
  "job_reference": "string",
  "job_id": "uuid — matched",
  "contract_amount": "decimal",
  "change_amount": "decimal | null — for COs",
  "scope_description": "string",
  "line_items": [
    {
      "description": "string",
      "amount": "decimal",
      "cost_code_id": "uuid | null"
    }
  ],
  "start_date": "date | null",
  "completion_date": "date | null",
  "schedule_impact_days": "integer | null — for COs",
  "payment_terms": "string",
  "retainage_percent": "decimal",
  "allowances": [
    {
      "description": "string",
      "amount": "decimal",
      "category": "string"
    }
  ],
  "signatures": {
    "builder_signed": "boolean",
    "client_signed": "boolean",
    "date_signed": "date | null"
  },
  "key_clauses": ["string — AI-extracted important terms"],
  "confidence_scores": {
    "parties": "decimal 0-1",
    "amounts": "decimal 0-1",
    "dates": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/contracts`, `/jobs/[id]/change-orders`, `/jobs/[id]/budget`

---

### Ingestion Point 4f: Bid / Quote Extraction

**Structured Output Schema:**
```json
{
  "document_type": "bid_response",
  "vendor_name": "string",
  "vendor_id": "uuid — matched",
  "job_reference": "string",
  "job_id": "uuid — matched",
  "bid_package_id": "uuid | null — matched",
  "scope": "string — trade/scope described",
  "total_amount": "decimal",
  "line_items": [
    {
      "description": "string",
      "quantity": "decimal | null",
      "unit": "string | null",
      "unit_price": "decimal | null",
      "amount": "decimal",
      "cost_code_id": "uuid | null"
    }
  ],
  "inclusions": ["string"],
  "exclusions": ["string"],
  "alternates": [
    {
      "description": "string",
      "add_deduct": "string — add | deduct",
      "amount": "decimal"
    }
  ],
  "lead_time": "string | null",
  "validity_period": "string | null — how long bid is good for",
  "payment_terms": "string | null",
  "insurance_confirmed": "boolean",
  "license_number": "string | null",
  "confidence_scores": {
    "vendor": "decimal 0-1",
    "amounts": "decimal 0-1",
    "scope": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/bids`, `/jobs/[id]/budget`, `/directory/vendors`

---

### Ingestion Point 4g: AIA Pay Application (G702/G703) Extraction

**Structured Output Schema:**
```json
{
  "document_type": "aia_pay_app",
  "form_type": "string — G702 | G703",
  "vendor_name": "string",
  "vendor_id": "uuid — matched",
  "job_id": "uuid — matched",
  "application_number": "integer",
  "period_to": "date",
  "contract_amount": "decimal",
  "change_orders_total": "decimal",
  "revised_contract": "decimal",
  "work_completed_previous": "decimal",
  "work_completed_this_period": "decimal",
  "materials_stored": "decimal",
  "total_completed_and_stored": "decimal",
  "retainage_percent": "decimal",
  "retainage_amount": "decimal",
  "total_earned_less_retainage": "decimal",
  "previous_payments": "decimal",
  "current_payment_due": "decimal",
  "balance_to_finish": "decimal",
  "schedule_of_values": [
    {
      "item_number": "string",
      "description": "string",
      "scheduled_value": "decimal",
      "previous_applications": "decimal",
      "this_period": "decimal",
      "materials_stored": "decimal",
      "total_completed": "decimal",
      "percent_complete": "decimal",
      "balance_to_finish": "decimal",
      "retainage": "decimal"
    }
  ],
  "confidence_scores": {
    "vendor": "decimal 0-1",
    "amounts": "decimal 0-1",
    "schedule_of_values": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/jobs/[id]/invoices`, `/jobs/[id]/budget`, `/jobs/[id]/draws`

---

### Ingestion Point 4h: Permit Document Extraction

**Structured Output Schema:**
```json
{
  "document_type": "permit",
  "permit_type": "string — building | electrical | plumbing | mechanical | grading | demo | etc.",
  "permit_number": "string",
  "jurisdiction": "string",
  "issued_date": "date",
  "expiration_date": "date",
  "fee_amount": "decimal",
  "property_address": "string",
  "job_id": "uuid — matched",
  "scope_of_work": "string",
  "conditions": ["string"],
  "required_inspections": ["string — list of required inspections"],
  "contractor_of_record": "string",
  "license_number": "string",
  "confidence_scores": {
    "permit_type": "decimal 0-1",
    "dates": "decimal 0-1",
    "job_match": "decimal 0-1",
    "overall": "decimal 0-1"
  }
}
```

**Consumed by:** `/jobs/[id]/permits`, `/jobs/[id]/inspections`, `/jobs/[id]/schedule`

---

### Ingestion Point 5: Email / Communication [INGESTOR]

**Entry points:** Email forwarding, email integration, manual log

**AI Processing Pipeline:**
```
Raw Input (email with attachments)
    │
    ├─ Step 1: Classify intent (decision, question, FYI, request, complaint, approval)
    ├─ Step 2: Extract action items
    ├─ Step 3: Match to job, vendor, client
    ├─ Step 4: Detect attachments → route to document processing
    ├─ Step 5: Extract decisions made (for decision log)
    ├─ Step 6: Detect urgency/sentiment
    └─ Step 7: Generate suggested response (if applicable)
```

**Structured Output Schema:**
```json
{
  "type": "string — email | sms | phone_note | meeting_note",
  "direction": "string — inbound | outbound",
  "from": "string",
  "from_contact_id": "uuid | null — matched",
  "to": ["string"],
  "subject": "string",
  "content": "string — full text",
  "job_id": "uuid | null — matched",
  "intent": "string — decision | question | fyi | request | complaint | approval | schedule_change",
  "urgency": "string — low | normal | high | urgent",
  "sentiment": "string — positive | neutral | negative | frustrated",
  "action_items": [
    {
      "description": "string",
      "assigned_to": "string",
      "due_date": "date | null",
      "priority": "string"
    }
  ],
  "decisions": [
    {
      "description": "string — what was decided",
      "decided_by": "string",
      "date": "date"
    }
  ],
  "attachments": [
    {
      "filename": "string",
      "document_type": "string — classified",
      "processing_id": "uuid — sent to document processing"
    }
  ],
  "suggested_response": "string | null",
  "timestamp": "timestamp"
}
```

**Consumed by:** `/jobs/[id]/communications`, `/todos` (action items), decision log

---

### Ingestion Point 6: Manual Data Entry [INGESTOR]

**Entry points:** Form submission (leads, estimates, POs, etc.)

Even manual entry goes through AI validation:

**AI Processing Pipeline:**
```
Raw Input (form fields from user)
    │
    ├─ Step 1: Validate and normalize (addresses, phone numbers, names)
    ├─ Step 2: Smart defaults (suggest cost codes, fill jurisdiction data)
    ├─ Step 3: Duplicate detection (similar lead, vendor, etc.)
    ├─ Step 4: Enrichment (company lookup, lead scoring, etc.)
    └─ Step 5: Cross-reference (match to existing records)
```

This is lighter AI processing — validation and enrichment, not full extraction.

---

## PART 2: CONSUMER PAGES — DISPLAY SPECIFICATIONS

These pages consume structured data from the ingestion points above. Each shows what fields are displayed and how.

---

### Company Dashboard (`/skeleton`)

**Display Format:** Card grid + activity feed + alerts

| Section | Source Data | Fields Displayed | Format |
|---------|-----------|-----------------|--------|
| Cash Position | Financial aggregation | cash_on_hand, ar_total, ap_total, gross_margin | KPI cards with trend arrows |
| Active Jobs | jobs table | name, status, percent_complete, next_milestone, ai_risk_score | Card list, sorted by risk |
| Today's Schedule | calendar events | title, type, time, job_name, assigned_to | Timeline list |
| Pending Approvals | invoices + change_orders | count by type, oldest pending date | Badge counts |
| Alerts | AI-generated | message, severity, action_url | Color-coded alert cards |
| AI Insights | AI analysis | insight_text, category, impact | Collapsible insight cards |
| Recent Activity | activity_log | description, timestamp, user, job | Activity feed |

---

### Leads Pipeline (`/skeleton/leads`)

**Display Format:** Kanban board + list view toggle

| Column | Fields Displayed | AI Enrichment |
|--------|-----------------|---------------|
| Lead Card | name, contact_name, phone, project_type, estimated_value | ai_score (0-100), win_probability |
| Detail Panel | address, lot_size, estimated_sf, source, referred_by, notes | flood_zone (auto-detected), coastal_requirements (auto-detected) |
| Stage Columns | New → Qualified → Proposal Sent → Won → Lost | AI recommends next action per stage |

---

### Estimates (`/skeleton/estimates`)

**Display Format:** Spreadsheet-style with tier comparison columns

| Section | Fields Displayed | Source |
|---------|-----------------|--------|
| Header | estimate_name, client, project_sf, status | Manual + lead data |
| Line Items | category, selection_name, qty, unit, material_cost, labor_cost, total | Selections catalog + AI quantity calc |
| Tier Comparison | builder_total, standard_total, premium_total, luxury_total | Selections catalog tier pricing |
| Allowances | category, allowance_amount, status | Spec book extraction or manual |
| Summary | subtotal, markup_%, contingency_%, total, cost_per_sf | Calculated |
| AI Confidence | ai_confidence per line, flags for unusual pricing | AI benchmarking |

---

### Proposals (`/skeleton/proposals`)

**Display Format:** Client-facing document preview + status tracking

| Section | Fields Displayed | Source |
|---------|-----------------|--------|
| Proposal Header | client_name, project_address, date, proposal_number | Estimate → proposal |
| Selection Tiers | tier_name, photo, description, price_per_tier, difference | Selections catalog |
| Allowance Items | category, allowance_amount, description | Estimate |
| Totals | base_price, upgrades, credits, total | Calculated from selections |
| Status | sent_at, viewed_at, view_count, time_spent, accepted_at | Tracking data |

---

### Contracts (`/skeleton/contracts`)

**Display Format:** Document list + status pipeline

| Section | Fields Displayed | Source |
|---------|-----------------|--------|
| Contract List | contract_number, client, amount, status, sent_at | AI extraction or manual |
| Detail | parties, scope, amount, allowances, payment_terms, retainage | Contract extraction |
| Signature Status | builder_signed, client_signed, executed_at | E-signature tracking |
| Allowance Schedule | category, amount, terms | Contract extraction |
| Payment Schedule | milestone, amount, due_condition | Contract extraction |

---

### Jobs List (`/skeleton/jobs`)

**Display Format:** Card grid with filters + map view

| Field | Source | Display |
|-------|--------|---------|
| name, job_number | Manual | Card title |
| photo_url | AI-curated best photo | Card image |
| status | Manual + AI | Status badge |
| client_name | clients table | Subtitle |
| contract_amount | Contract | Currency |
| percent_complete | Schedule AI / daily logs | Progress bar |
| target_completion | Schedule | Date |
| predicted_completion | Schedule AI | Date (red if after target) |
| ai_risk_score | AI analysis | 0-100 badge (green/yellow/red) |

---

### Job Dashboard (`/skeleton/jobs/[id]`)

**Display Format:** Summary cards + activity feed + quick actions

| Section | Fields | Source |
|---------|--------|--------|
| Header | name, status, client, address, key_dates | Job record |
| Budget Summary | contract, approved_changes, costs_to_date, billed, profit_margin | Budget aggregation |
| Schedule Summary | percent_complete, days_remaining, next_milestone, critical_path_status | Schedule AI |
| Recent Activity | invoices, photos, logs, COs — last 5 items | Activity feed |
| Weather | current_conditions, forecast_3day | Weather API |
| Team | pm_name, superintendent_name, active_subs | Team assignments |

---

### Property Details (`/skeleton/jobs/[id]/property`)

**Display Format:** Four-quadrant card layout + special features tags + AI insights

| Section | Fields | Source |
|---------|--------|--------|
| Building Profile | total_sf, conditioned_sf, garage_sf, porch_lanai_sf, pool_house_sf, per_floor_sf, bedrooms, full_bathrooms, half_bathrooms, stories | Plan extraction AI + manual entry + lead/estimate data |
| Structure | foundation_type, elevation_height_ft, structural_system, roof_type, roof_pitch, roof_material, exterior_cladding, garage_bays, garage_type, garage_finished | Plan extraction AI + manual entry |
| Site & Lot | lot_acreage, lot_dimensions, lot_number, subdivision, hoa_name, parcel_number, zoning_classification, setbacks, max_lot_coverage_pct, max_height_ft | Permit extraction AI + manual entry + county data |
| Environmental | flood_zone, base_flood_elevation, design_flood_elevation, finished_floor_elevation, wind_speed_zone, exposure_category, is_coastal, is_historic_district | Permit extraction AI + FEMA data |
| Utilities | water_source, sewer_type, gas_type, electric_provider | Manual entry |
| Special Features | special_features array (pool, outdoor_kitchen, elevator, generator, fire_sprinklers, smart_home, solar, ev_charger) | Manual entry |
| Classification | construction_type, project_tags | Manual entry + lead data |
| AI Insights | regulatory_warnings, cost_impact_notes, similar_property_comparisons | AI analysis of property attributes |

**Consumed from:**
- Plan extraction (Ingestion Point 4c) — SF, room counts, foundation, stories, roof
- Permit extraction (Ingestion Point 4h) — flood zone, zoning, setbacks
- Lead/Estimate data — initial SF, project type, lot info
- Contract extraction — authoritative SF and address

**Consumed by:**
- `/jobs/[id]/budget` — $/SF calculations, cost adjustments for foundation/structure type
- `/jobs/[id]/schedule` — duration estimates based on stories, foundation, complexity
- `/jobs/[id]/selections` — room counts drive selection categories and quantities
- `/skeleton/estimates` — similar property matching for cost benchmarks
- `/compliance/insurance` — construction type, flood zone, wind zone determine requirements
- `/jobs/[id]/permits` — zoning setbacks, elevation data for permit applications
- `/portal` (client portal) — property summary display
- `/skeleton/reports` — property data on job cost reports and closeout docs
- AI Intelligence — powers similar-job comparisons across all analytics

---

### Job Selections (`/skeleton/jobs/[id]/selections`)

**Display Format:** Room-by-room cards with category progress

| Section | Fields | Source |
|---------|--------|--------|
| Room Cards | room_name, selection_count, completed_count, progress_% | Spec book extraction → selections |
| Category Rows | category, item_name, allowance, selected_option, selected_price, variance, status, deadline | Spec book + client selections |
| Option Comparison | option_name, photo, manufacturer, model, price, lead_time, designer_recommended | Selections catalog |
| Budget Impact | allowance_total, selected_total, variance, upgrade_amount, credit_amount | Calculated |
| Timeline | selection_deadline, days_remaining, schedule_dependency | Schedule integration |
| Status Filters | Pending, Selected, Ordered, Received, Installed | Workflow status |

---

### Schedule (`/skeleton/jobs/[id]/schedule`)

**Display Format:** Gantt chart + list view + calendar view

| Field | Source | Display |
|-------|--------|---------|
| task_name | Manual or template | Gantt bar label |
| start_date, end_date | Manual + AI prediction | Bar position |
| actual_start, actual_end | Daily log AI extraction | Overlay bar |
| percent_complete | Daily log AI + manual | Bar fill |
| dependencies | Manual | Connector lines |
| is_critical_path | AI calculation | Red highlight |
| assigned_vendor | Vendor assignment | Label |
| is_outdoor | Task flag | Weather icon overlay |
| ai_predicted_duration | AI learning from actuals | Dashed end marker |
| weather_risk | Weather API + outdoor flag | Warning icon |
| selection_deadline | Selections module | Milestone marker |

---

### Daily Logs (`/skeleton/jobs/[id]/daily-logs`)

**Display Format:** Timeline of daily entries

| Section | Fields | Source |
|---------|--------|--------|
| Date Header | date, weather (icon + temp), conditions | Weather API auto-fill |
| Work Performed | structured items: trade, description, location, progress_% | AI extraction from voice/text |
| Manpower | vendor_name, headcount, hours, trade | AI extraction |
| Deliveries | description, vendor, po_matched | AI extraction |
| Issues | description, category, severity, action_required | AI extraction + categorization |
| Photos | thumbnails, ai_tags, quality_score | Photo AI processing |
| AI Summary | concise paragraph | AI-generated |
| Client Version | client-safe summary, curated photos | AI filtering |

---

### Photos (`/skeleton/jobs/[id]/photos`)

**Display Format:** Gallery grid with filter sidebar

| Field | Source | Display |
|-------|--------|---------|
| thumbnail | Photo processing | Grid image |
| ai_tags.trade | Photo AI | Filter chip |
| ai_tags.phase | Photo AI | Filter chip |
| ai_tags.location | Photo AI | Filter chip |
| ai_tags.is_milestone | Photo AI | Star badge |
| taken_at | EXIF extraction | Date label |
| quality_score | Photo AI | Hidden sort factor |
| client_suitable | Photo AI | Portal visibility toggle |
| daily_log_id | Link | "From daily log" badge |

---

### Budget (`/skeleton/jobs/[id]/budget`)

**Display Format:** Hierarchical spreadsheet (expandable cost code tree)

| Column | Source | Display |
|--------|--------|---------|
| Cost Code | cost_codes table | Tree hierarchy |
| Original Budget | Estimate | Currency |
| Approved Changes | Change orders (AI-extracted) | Currency (+/-) |
| Revised Budget | Calculated | Currency |
| Committed (POs) | PO aggregation | Currency |
| Invoiced (Actual) | Invoice AI extraction | Currency |
| Projected | AI cost-to-complete | Currency |
| Variance | Calculated | Currency + heat map color |
| Selection Variance | Estimated vs actual selection price | Currency + indicator |
| % Complete | Schedule AI / daily logs | Progress bar |

---

### Invoices (`/skeleton/jobs/[id]/invoices`)

**Display Format:** List with approval workflow sidebar

| Field | Source | Display |
|-------|--------|---------|
| vendor_name | Invoice AI extraction | Text |
| invoice_number | Invoice AI extraction | Text |
| amount | Invoice AI extraction | Currency |
| date | Invoice AI extraction | Date |
| po_match | Invoice AI extraction | Linked PO badge |
| cost_code | Invoice AI extraction | Code chip |
| status | Approval workflow | Status badge pipeline |
| lien_waiver_status | Lien waiver AI extraction | Required/Received badge |
| confidence | AI confidence score | Hidden (shown if < 0.95) |
| budget_impact | Budget calculation | Variance indicator |

---

### Purchase Orders (`/skeleton/jobs/[id]/purchase-orders`)

**Display Format:** List + detail panel

| Field | Source | Display |
|-------|--------|---------|
| po_number | Generated | Text |
| vendor_name | Manual or selection-driven | Text |
| description | Manual or from selection | Text |
| amount | Manual or from bid extraction | Currency |
| cost_code | Manual or AI-suggested | Code chip |
| status | Workflow | Status badge |
| expected_delivery | Manual or from bid | Date |
| invoiced_amount | Invoice AI aggregation | Currency |
| remaining | Calculated | Currency |
| selection_id | Selections link | "For: [selection name]" |

---

### Draws (`/skeleton/jobs/[id]/draws`)

**Display Format:** Draw schedule table + creation wizard

| Field | Source | Display |
|-------|--------|---------|
| draw_number | Sequential | Number |
| period | Manual | Date range |
| gross_amount | Budget % complete calculation | Currency |
| retainage | Company settings % | Currency |
| net_amount | Calculated | Currency |
| previous_billed | Prior draws | Currency |
| total_completed | Cumulative | Currency |
| remaining | Contract - completed | Currency |
| status | Workflow | Status badge |
| included_invoices | Invoice AI extraction | Linked list |
| lien_waivers_complete | Lien waiver AI | Checkbox status |
| progress_photos | Photo AI (client-suitable) | Photo grid |

---

### Lien Waivers (`/skeleton/jobs/[id]/lien-waivers`)

**Display Format:** Vendor matrix (vendor rows × draw columns)

| Field | Source | Display |
|-------|--------|---------|
| vendor_name | vendors table | Row label |
| waiver_type | Lien waiver AI extraction | Type badge |
| through_date | Lien waiver AI extraction | Date |
| amount | Lien waiver AI extraction | Currency |
| status | Workflow | Pending/Received badge |
| notarized | Lien waiver AI extraction | Checkmark |
| draw_number | Draw association | Column header |
| payment_hold | Business rule | Warning if missing |

---

### Permits (`/skeleton/jobs/[id]/permits`)

**Display Format:** Checklist with status indicators

| Field | Source | Display |
|-------|--------|---------|
| permit_type | Permit AI extraction or manual | Text |
| permit_number | Permit AI extraction | Text |
| status | Workflow | Status badge pipeline |
| application_date | Permit AI extraction | Date |
| approval_date | Permit AI extraction | Date |
| expiration_date | Permit AI extraction | Date with countdown |
| fee_amount | Permit AI extraction | Currency |
| required_inspections | Permit AI extraction | Linked checklist |
| schedule_dependencies | Schedule link | Warning if blocking tasks |

---

### Inspections (`/skeleton/jobs/[id]/inspections`)

**Display Format:** Checklist timeline

| Field | Source | Display |
|-------|--------|---------|
| inspection_type | Permit extraction or manual | Text |
| scheduled_date | Manual | Date |
| inspector | Manual | Contact |
| status | Workflow | Pass/Fail/Pending badge |
| result | Manual entry | Result badge |
| corrections_needed | Manual entry | Checklist |
| reinspection_date | Manual | Date |
| photos | Photo processing | Attached grid |
| pre_inspection_checklist | Template | Interactive checklist |
| schedule_impact | Schedule link | Warning if failed |

---

### RFIs (`/skeleton/jobs/[id]/rfis`)

**Display Format:** Log table + detail drawer

| Field | Source | Display |
|-------|--------|---------|
| rfi_number | Sequential | Number |
| subject | Manual | Text |
| question | Manual | Rich text |
| drawing_reference | Plan extraction or manual | Linked sheet |
| spec_reference | Spec extraction or manual | Linked section |
| assigned_to | Manual | Contact |
| due_date | Manual | Date with countdown |
| response | Manual | Rich text |
| cost_impact | Manual | Currency |
| schedule_impact | Manual | Days |
| status | Workflow | Status badge |

---

### Submittals (`/skeleton/jobs/[id]/submittals`)

**Display Format:** Log table with review status

| Field | Source | Display |
|-------|--------|---------|
| submittal_number | Sequential | Number |
| spec_section | Plan/spec extraction or manual | Text |
| description | Manual | Text |
| vendor | vendors table | Text |
| lead_time | Bid extraction or manual | Days/weeks |
| status | Workflow | Status pipeline |
| revision | Version tracking | Rev number |
| reviewer | Manual | Contact |
| documents | Document upload | Attachment list |
| selection_link | Selections module | "For: [selection]" |
| schedule_dependency | Schedule | Warning if delayed |

---

### Files & Documents (`/skeleton/jobs/[id]/files`)

**Display Format:** File browser with folder tree

| Field | Source | Display |
|-------|--------|---------|
| name | Upload or AI extraction | Text |
| file_type | Detection | Icon |
| category | AI classification | Folder/tag |
| uploaded_at | Timestamp | Date |
| uploaded_by | User | Name |
| version | Version tracking | Rev badge |
| extracted_text | Document AI OCR | Searchable (not displayed) |
| expires_at | AI extraction (permits, COIs) | Countdown warning |
| portal_visible | Builder toggle | Eye icon |
| ai_tags | Document AI | Chips |

---

### Punch List (`/skeleton/jobs/[id]/punch-list`)

**Display Format:** Room-grouped list with photo documentation

| Field | Source | Display |
|-------|--------|---------|
| item_number | Sequential | Number |
| location | Manual or AI from photo GPS | Room/area badge |
| description | Manual | Text |
| trade | Manual or AI-suggested | Trade chip |
| assigned_to | Manual | Contact |
| priority | Manual | Priority badge |
| due_date | Manual | Date |
| status | Workflow | Status badge |
| photos | Photo AI processing | Before photo |
| completion_photos | Photo AI processing | After photo |
| verified_at | QA check | Timestamp |

---

### Warranties (`/skeleton/jobs/[id]/warranties`)

**Display Format:** Warranty binder / catalog view

| Field | Source | Display |
|-------|--------|---------|
| item | Manual or selection-linked | Text |
| category | Cost code / selection category | Category chip |
| warranty_type | Manual | Product/Labor/Extended badge |
| provider | Vendor or manufacturer | Text |
| start_date | Job completion or install date | Date |
| duration_months | Manual or product spec | Duration |
| expiration_date | Calculated | Date with countdown |
| registration_number | Manual | Text |
| documents | Document upload | Attachment list |
| claim_contact | Manual | Contact info |
| selection_link | Selections module | Linked product |

---

### Financial Dashboard (`/skeleton/financial/dashboard`)

**Display Format:** KPI cards + charts + tables

| Metric | Source | Display |
|--------|--------|---------|
| Cash on Hand | Bank integration or manual | KPI card + trend line |
| AR Total | Draw/invoice aggregation | KPI card + aging chart |
| AR Aging Buckets | Invoice AI (dates) | Stacked bar: Current/30/60/90+ |
| AP Total | Invoice AI aggregation | KPI card + aging chart |
| Revenue MTD/YTD | Draw funded amounts | KPI card |
| Profit Margin | Budget actuals vs contract | % with trend |
| Cash Flow Forecast | AI prediction (30-day) | Line chart |
| Outstanding Draws | Draw status aggregation | Count + total |
| Pending Invoices | Invoice status aggregation | Count + total |

---

### Client Portal (`/skeleton/portal`) [CONSUMER — filtered view]

**Display Format:** Simplified client-facing dashboard

| Section | Fields (filtered by builder toggle) | Source |
|---------|-----------------------------------|--------|
| Schedule | task_name, dates, percent_complete (builder-allowed tasks only) | Schedule, filtered |
| Photos | client_suitable photos only, AI-curated | Photo AI |
| Daily Updates | ai_client_summary (no internal notes/pricing) | Daily log AI |
| Selections | room, category, options, deadline, selected choice | Spec book AI + selections |
| Budget Summary | allowance vs selected (if builder enables) | Budget, filtered |
| Change Orders | title, description, amount, approval_status (if enabled) | CO extraction |
| Documents | portal_visible documents only | Document AI |
| Draw Schedule | draw_number, amount, status (if enabled) | Draw data |

---

### Vendor Portal (`/skeleton/vendor-portal`) [CONSUMER — filtered view]

**Display Format:** Vendor-scoped dashboard

| Section | Fields (filtered by Permission Wizard settings) | Source |
|---------|-----------------------------------------------|--------|
| Schedule | their tasks only (or all if builder allows) | Schedule, filtered |
| Invoices | their invoices, POs, payment status | Invoice AI |
| Daily Logs | their entries only (or all if allowed) | Daily log AI |
| Documents | their scope documents only | Document AI |
| RFIs | tagged RFIs only | RFI data |
| Bid Requests | open bid packages for their trade | Bid data |
| **Never visible** | internal costs, markup, pricing, profit | BLOCKED |

---

## PART 3: CROSS-CUTTING PAGES

### Company Calendar (`/skeleton/operations/calendar`)

**Display Format:** Month/week/day calendar with color-coded events

All events sourced from structured data already processed:

| Event Type | Source | Color | Fields |
|------------|--------|-------|--------|
| Milestone | Schedule | Blue | task_name, job, date |
| Inspection | Inspection records | Red | type, job, time, inspector |
| Delivery | PO expected_delivery | Green | vendor, description, job |
| Selection Deadline | Selections module | Orange | category, job, client |
| Permit Expiration | Permit AI extraction | Red | permit_type, job, date |
| COI Expiration | COI AI extraction | Red | vendor, policy, date |
| Payment Due | Invoice AI extraction | Yellow | vendor, amount, job |
| Meeting | Communication AI | Gray | subject, attendees, time |
| Weather Alert | Weather API | Purple | condition, affected_jobs |

---

### Reports, Analytics & Forecasting (`/skeleton/reports`) [CONSUMER — aggregated view]

**Display Format:** Category-based report hub with 90+ built-in report types across 11 categories, plus a full custom report builder. AI summaries, natural language queries, anomaly detection, and scheduled distribution on every report.

All reports consume structured data from the AI processing layer. No raw data.

**FINANCIAL REPORTS (17 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| WIP Schedule | Budget + Draws + Contracts | Contract value, estimated cost, % complete, earned revenue, billings, over/under billing, gross profit, profit fade, backlog |
| Job Cost Report | Budget + Invoice AI + PO data | Original, revised, committed, actual, projected, variance per cost code |
| Over/Under Billing | WIP snapshots | Earned revenue vs billings, overbilled (liability), underbilled (asset) |
| Profit Fade/Gain | WIP snapshots (period-over-period) | Estimated margin change over time, root cause drivers |
| Cash Flow (Actual) | Bank data + Draws + Invoices | Inflows, outflows, beginning/ending balance by week/month |
| AR Aging | Draw data + payment history | By client, by age bucket (0-30, 31-60, 61-90, 90+), DSO, collection rate |
| AP Aging | Invoice AI + payment scheduling | By vendor, by age bucket, early pay discounts, lien waiver status |
| Profitability by Job | Budget + Invoice AI + Contracts | Revenue, costs, margin %, $/SF, estimate vs actual |
| Profitability by Trade | Budget actuals aggregated by cost code division | Trade-level budget adherence across all jobs |
| Profitability by Client | Contracts + Budget + COs + Warranty claims | Margin, CO frequency, decision speed, warranty cost per client |
| Draw Tracking | Draws + Lien waivers | Submission/approval/funding dates, days-to-fund, lien waiver completeness |
| Retainage Report | Contracts + Draws + POs | Held by client, owed to subs, release conditions, expected dates |
| Backlog Report | Contracts + WIP snapshots | Remaining contract value, monthly burn rate, months of backlog |
| Revenue Recognition | WIP snapshots + revenue recognition entries | ASC 606 compliance, recognized vs deferred, overbilling/underbilling |
| Committed Cost | POs + Subcontracts + Invoices | Committed, invoiced, paid, remaining commitment, uncommitted budget |
| Change Order Summary | Change orders across all jobs | By type, volume, value, margin impact, CO as % of contract |
| Estimate vs Actual | Estimates + Budget actuals (completed jobs) | Per cost code comparison, systematic over/under patterns, estimating accuracy loop |

**TAX & ACCOUNTING REPORTS (9 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| 1099 Preparation | Vendor payments + W-9 status | YTD payments, threshold tracking, entity type |
| Sales & Use Tax | Invoice AI + jurisdiction data | Taxable vs exempt, construction exemptions, multi-state filing |
| Depreciation Schedule | Equipment module | Straight-line, MACRS, Section 179, bonus depreciation, net book value |
| Multi-State Payroll Tax | Time entries + payroll + jurisdictions | Withholding by state, SUTA/FUTA, new hire reporting, nexus |
| GL Trial Balance | QuickBooks GL + job cost subledger | Period-end GL balances, adjusting entries, audit trail |
| Balance Sheet | QuickBooks GL + WIP + AR/AP | Assets, liabilities, equity — includes WIP-adjusted accounts |
| Income Statement (P&L) | Revenue recognition + cost data | Revenue by job, cost of revenue, gross profit, overhead, net income |
| Job Cost to GL Reconciliation | Budget actuals + QuickBooks GL | Subledger vs GL discrepancy identification, audit requirement |
| Allowance Tracking | Contracts + Selections | Allowance vs actual per category across all jobs, trending |

**FORECASTING REPORTS (8 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| Cash Flow Forecast | AR + AP + Draws + POs + Payroll + Overhead | 13-week rolling, best/worst/likely scenarios, gap alerts |
| Cost-to-Complete (EAC) | Budget + Actuals + POs + AI intelligence | CPI, EAC, ETC per cost code, AI confidence intervals |
| Revenue Forecast | Backlog + Schedule + Pipeline | Monthly/quarterly projected revenue, backlog burn rate |
| Backlog Burn-Down | Contracts + WIP + Pipeline | When backlog consumed, new contracts needed, pipeline conversion |
| Schedule Completion Prediction | Schedule + Daily logs + Weather + AI | Predicted vs contractual dates, SPI, risk factors, confidence |
| Labor Productivity Forecast | Daily logs + Time entries + Schedule | Hours by trade, productivity rate, projected labor needs |
| Material Cost Trends | Invoice AI + PPI data | Price trends by material, 30/60/90 day outlook |
| Pipeline Forecast | Lead CRM + stage transitions | Weighted pipeline value, conversion rates, expected close dates |

**OPERATIONAL REPORTS (13 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| Weekly Progress | Schedule + Daily logs + Photos | Tasks completed/behind, issues, milestones, photos, AI narrative |
| Monthly Project Status | All job modules | Financial + schedule + quality + safety combined per job |
| Daily Log Summary (Cross-Job) | Daily logs across all active jobs | Aggregated manpower, work performed, issues on one page |
| Resource Utilization | HR/Time + Job assignments | PM/superintendent allocation, hours, utilization rate |
| Vendor Scorecard | Invoice AI + Schedule + Daily logs + Punch lists | On-time %, budget adherence, quality, safety, composite score |
| Quality Metrics | Inspections + Punch lists + Warranty claims | Rework rate, defect rate, first-pass rate, punch items/job |
| Safety Incident | Safety module | OSHA fields, root cause, corrective actions |
| Safety Summary | Safety module (aggregated) | TRIR, DART, near-miss count, training hours, EMR |
| Permit & Inspection Status | Permit AI + Inspections | Permits by job, inspections checklist, schedule dependencies |
| RFI Status | RFIs | Open/answered/closed, aging, response time, cost/schedule impact |
| Submittal Tracking | Submittals | Review pipeline, lead times, schedule dependencies |
| Punch List | Punch list items | By room/trade, aging, before/after photos, close-out rate |
| Equipment Utilization | Equipment module | Deployed vs idle hours, cost/hour, maintenance schedule |

**SCHEDULING REPORTS (7 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| 3-Week Lookahead | Schedule tasks + constraints | Rolling short-range schedule, crew assignments, constraint flags |
| Weekly Work Plan | Schedule tasks + daily logs | Planned vs accomplished, PPC (Percent Plan Complete), variance by crew |
| Critical Path Report | Schedule + dependencies | Critical/near-critical activities, total float, longest path |
| Schedule Variance | Schedule + Daily logs | Planned vs actual, SPI, delay causes, critical path impact |
| Weather Delay Tracking | Daily logs + NOAA data | Rain/wind days, force majeure, historical comparison, time extensions |
| Constraint/Roadblock Log | RFIs + Submittals + Permits + Selections | Open constraints, schedule impact, aging, resolution status |
| Schedule Delay Analysis | Schedule (as-planned vs as-built) | Forensic delay analysis, concurrent delays, day-for-day impact |

**PROCUREMENT REPORTS (7 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| Purchase Order Status | POs across all jobs | Open, partial, received, closed, overdue deliveries |
| PO vs Invoice Variance | POs + Invoice AI | 3-way match: PO vs received vs invoiced, discrepancy flags |
| Material Price Comparison | Invoice AI + bid data | Same material across vendors, historical trends, volume discounts |
| Procurement Spend Analysis | POs + Invoice AI | Spend by vendor, material category, job, trade, period trends |
| Delivery Performance | POs + schedule dependencies | On-time vs late per vendor, delay days, schedule impact |
| Subcontractor Payment History | Invoice AI + payments | Per-sub payment history, days-to-pay, retention, lien waiver status |
| Bid Comparison / Tabulation | Bid responses | Side-by-side per scope, normalized inclusions/exclusions |

**HR & WORKFORCE REPORTS (8 types)**

| Report | Source Data | Key Metrics |
|--------|-----------|-------------|
| Certified Payroll (WH-347) | Time entries + payroll | Weekly wage report, fringe benefits, prevailing wage compliance |
| Labor Burden Rate | Payroll + taxes + insurance + benefits | Fully burdened $/hr per employee, burden multiplier |
| Labor Distribution | Time entries + job assignments | Hours and cost by job, phase, cost code, trade per employee |
| Overtime Analysis | Time entries | OT hours by employee/crew/job, OT % of total labor, trends |
| Cross-Job Headcount | Daily logs + time entries | Daily/weekly headcount by job by trade, capacity vs deployment |
| Employee Training & Certification | HR module | Training completion, certifications, license expirations, OSHA 10/30 |
| Workers Comp Audit | Payroll + WC classifications | Hours by class code, burdened rates, EMR history |
| T&M Log | Time entries + material receipts | T&M work by day, labor/material/equipment, markup, billing status |

**COMPLIANCE & RISK (10), CLIENT-FACING (7), SALES (4), EXECUTIVE (4), WARRANTY (6), DOCUMENT (4) — see page spec for full detail**

**CUSTOM REPORT BUILDER**

| Feature | Description |
|---------|-------------|
| Data Source Catalog | 15 data domains exposing 115+ entities and 1000+ fields — Jobs, Financials, Budget, Schedule, Procurement, Invoices, Change Orders, Draws, Selections, Daily Logs, Documents, Vendors, Clients, Leads, HR/Time |
| Cross-Module Joins | Combine any entities (e.g., invoices + POs + lien waivers + vendors in one report) |
| Field Picker | Browse domain -> entity -> field, drag to columns/filters/values, see type + description |
| Measures vs Dimensions | Numeric fields for aggregation (sum, avg, min, max, count), text/date for grouping |
| Calculated Fields | Arithmetic, ratios, conditionals, date math — user-defined computed columns |
| Filter Builder | Rich operators per type: text (contains, starts with), numbers (between), dates (relative ranges), multi-select enums |
| Grouping & Subtotals | Multi-level grouping with subtotals/grand totals, collapsible groups |
| Chart Types | Table, bar, stacked bar, line, area, pie/donut, KPI card, combo, sparklines |
| Conditional Formatting | Color cells by threshold (red/yellow/green), configurable per column |
| Dashboard Composer | Multiple report widgets on one page, drag/resize, auto-refresh |
| Save & Organize | Personal or shared folders, tags, version history, favorites |
| Clone from Template | Start from any of 90+ built-in reports, modify, save as custom |
| Scheduled Delivery | Auto-generate and email daily/weekly/monthly — PDF or Excel, stakeholder formatting |
| AI Report Creation | Describe in plain English, AI builds the report definition — "Show me all jobs where margin dropped more than 5% in 30 days" |
| AI Enhancement | AI suggests additional columns, filters, or visualizations after creation |
| Report Snapshots | Point-in-time snapshots for trend comparison (this month vs last month) |
| Role-Based Visibility | Personal, team, or company-wide — admin controls creation/edit/view permissions |
| External BI Connector | Export dataset definitions for Power BI, Tableau (Phase 3+) |

---

### Job Reports & Forecasting (`/skeleton/jobs/[id]/reports`) [CONSUMER — job-scoped view]

**Display Format:** Job-scoped report hub with 50+ built-in report types across 8 categories, plus job-scoped custom report builder

All reports scoped to a single job. Includes job health score (0-100) combining CPI, SPI, documentation completeness, and compliance status.

| Category | Reports | Key Data Sources |
|----------|---------|-----------------|
| Financial (11) | Job Cost, Budget vs Actual, Committed Costs, Change Order Log, Draw Package (G702/G703), Draw History, Retainage Summary, Lien Waiver Matrix, Invoice Log, Subcontractor Payment Summary, Allowance Tracking | Budget lines, Invoice AI, POs, Draws, Contracts, Change Orders, Lien Waiver AI, Selections |
| Progress (11) | Daily Log, Weekly Progress, Monthly Status, Manpower, Vendor Performance (job-scoped), Permit/Inspection Status, RFI Log, Submittal Log, T&M Log, Daily Photo Report, Communication Log | Schedule, Daily Log AI, Photos, Inspections, RFIs, Submittals, Time Entries, Messages |
| Scheduling (6) | N-Week Lookahead, Weekly Work Plan (PPC), Schedule Variance, Critical Path, Weather Delay Log, Constraint/Roadblock Log | Schedule tasks, Daily logs, Weather data, RFIs, Submittals, Permits |
| Procurement (4) | PO Status, PO vs Invoice Variance (3-Way Match), Material Delivery Schedule, Document Completeness | POs, Invoice AI, Delivery tracking, Documents |
| Forecasting (5) | Cost-to-Complete (EAC/CPI), Schedule Prediction (SPI), Profitability Projection (margin fade), Cash Flow Impact, Selection Impact Forecast | Budget + AI intelligence, Schedule + AI, Similar job comparisons |
| Client (4) | Progress Report, Budget Summary, Selection Status, Change Order Presentation | Filtered views — no internal costs, margins, or vendor pricing |
| Closeout (5) | Punch List Summary, Final Cost Analysis, Warranty Binder, Project Completion Report, As-Built Documentation Status | All job data compiled at completion |
| Custom | Job-scoped custom report builder — same full builder as company level, auto-filtered to this job, with AI natural language creation | Any data on this job |

**Key AI features:** Job health score, cost-to-complete intelligence, schedule prediction engine, similar job benchmarking, draw package auto-generation, variance root cause analysis, client narrative generation, closeout intelligence, AI custom report builder, constraint & risk intelligence.

---

## PART 4: CONSISTENCY RULES

### Every page follows these display conventions:

1. **Currency fields** — always formatted as `$XX,XXX.XX`, negative in red with parentheses
2. **Dates** — display in company's configured format (default MM/DD/YYYY), store as ISO 8601
3. **Status badges** — consistent color scheme across all pages:
   - Draft/Pending: Gray
   - In Progress/Under Review: Blue
   - Needs Attention: Orange/Yellow
   - Approved/Complete: Green
   - Rejected/Failed/Overdue: Red
4. **Confidence indicators** — only shown when < 0.95, displayed as yellow/red warning icon
5. **AI-generated content** — subtly marked with a small indicator so users know what was AI-extracted vs manually entered
6. **Empty states** — every page has a meaningful empty state with a clear call-to-action
7. **Loading states** — skeleton loaders matching the page layout
8. **Portal views** — always a filtered subset of the same structured data, never separate data
9. **Search** — all pages support full-text search against AI-extracted text fields
10. **Export** — every list/table supports CSV export of the structured data

### Data flow is always one direction:

```
Raw Input → AI Processing Layer → Structured Storage → Display Page
                                                     → Client Portal (filtered)
                                                     → Vendor Portal (filtered)
                                                     → Reports (aggregated)
                                                     → Dashboards (summarized)
                                                     → Alerts (rule-triggered)
```

No page ever reads raw/unprocessed data. If a page needs data that hasn't been through AI processing, that means we're missing an ingestion point — define the schema first, then build.

---

### Settings & Admin Page (`/skeleton/settings`)

**Display Format:** Category-organized settings panels with admin-only sections

| Section | Fields | Source |
|---------|--------|--------|
| Company Profile | name, logo, address, licenses, insurance | Manual entry — builder onboarding |
| User Management | create, edit, deactivate users and roles | Admin CRUD |
| Role/Permission Configuration | custom roles with granular permissions, system role inheritance | RBAC engine (Module 1) |
| Cost Code Management | create, edit, organize cost code structure, import/export | Cost codes table (Module 9) |
| Workflow Configuration | approval chains, thresholds, routing rules per entity type | Configuration engine (Module 2) |
| Notification Preferences | what triggers notifications, for which roles, via which channels | Notification engine (Module 5) |
| Integration Management | connect/disconnect integrations, monitor sync status, error logs | Integration framework |
| Template Management | document templates, estimate templates, checklist templates, email templates | Template library |
| Custom Field Management | create/edit custom fields on any entity, field types, validation | Configuration engine (Module 2) |
| Billing / Subscription | plan, payment method, usage metrics, invoices (owner-only) | Stripe integration |
| Data Import/Export Tools | CSV import, full data export, migration tools | Core data model (Module 3) |
| API Key Management | create/revoke API keys for integrations, usage tracking | Auth module (Module 1) |
| Audit Log Viewer | searchable history of all system actions, filterable by user/entity/date | entity_change_log table |
| Branding Configuration | colors, logo, portal customization, email header/footer | Builder settings |
| Regional Settings | timezone, date format, currency, tax configuration | Builder settings |
| Module Enable/Disable | turn on/off optional modules (home care, HR, equipment tracking) | Feature flags / subscription tier |

**Access control:**
- Company Profile, Branding, Regional Settings: `admin` and above
- User Management, Roles, Permissions: `admin` and above
- Billing / Subscription: `owner` only
- API Key Management: `admin` and above
- All other settings: `admin` and above (configurable per builder)

---

## End-to-End Workflow Chains

> Every piece of data should flow through the system without re-entry. These are the critical automated data flow chains that connect modules end-to-end. Each chain must be fully traceable — every step linked to the previous and next step with no manual re-keying.

1. **Estimate-to-Payment Full Chain:** Estimate line item -> Budget line item -> PO -> Invoice -> Payment -> Lien waiver -> Draw request. The full financial lifecycle of every dollar must be traceable from the original estimate through to final payment and lien waiver collection. Every link in this chain is a foreign key relationship in the database.

2. **Plan-to-Schedule Full Chain:** Plan upload -> AI takeoff (quantities + rooms) -> Estimate (line items with quantities) -> Bid package (scope from estimate) -> Vendor bid -> Bid comparison -> Contract (winning bid) -> PO -> Schedule task (from contracted scope). A set of construction plans should be able to flow through to a fully scheduled, contracted project with minimal manual intervention.

3. **Delay-to-Notification Automated Chain:** Daily log "delay reported" -> Schedule impact calculation (critical path analysis) -> Revised completion date -> Client notification (via portal + email). When a superintendent logs a delay in the field, the system automatically calculates the schedule impact, updates the projected completion date, and notifies the client — no PM intervention required for the data flow (PM may still approve the notification).

4. **Selection-to-Installation Automated Chain:** Selection made by client -> Budget impact calculated (allowance vs. actual) -> Change order generated (if over allowance) -> Client approval (e-sign) -> PO generated to vendor -> Delivery tracked -> Installation scheduled on project schedule. The entire selection lifecycle from client choice to installed product is automated.

5. **Invoice-to-Draw Automated Chain:** Invoice received (email/upload/photo) -> AI extraction (vendor, amount, cost codes) -> Cost code suggestion -> Budget impact calculated -> Approval routed (based on threshold rules) -> Payment scheduled -> Lien waiver requested from vendor -> Draw request updated with approved invoices. Invoice processing triggers the full AP workflow automatically.

6. **Punch-to-Closeout Full Workflow:** Punch item created (with photo) -> Assigned to responsible vendor -> Vendor notified (push + email) -> Vendor marks complete (with photo) -> Builder verifies (with photo) -> Photos documented (before/after) -> Item closed -> Closeout checklist updated. The complete punch list lifecycle with full photo documentation at each step.

7. **Insurance Certificate Automated Chain:** Insurance certificate uploaded -> AI extracts expiration dates and coverage details -> Calendar reminder set for 30 days before expiration -> Renewal request auto-sent to vendor -> Vendor uploads new COI -> AI verifies coverage meets requirements -> Compliance status updated. No manual tracking of insurance expirations.

8. **Bid Intelligence Automated Chain:** Vendor bid received (PDF/email) -> AI parses line items and totals -> Compares to estimate (scope coverage analysis) -> Compares to other bids (leveling) -> Compares to historical data (is this price reasonable?) -> Recommendation generated with confidence score. Bid analysis that would take a PM hours is automated.

9. **RFI-to-Budget Full Chain:** RFI created -> Routed to architect/engineer -> Response received -> Cost impact assessed -> Change order created (if applicable) -> Budget updated with CO impact -> Schedule updated with time impact. Every RFI flows through to its financial and schedule consequences.

10. **Selection-to-Order Automated Chain:** Client selection confirmed -> Lead time calculated from vendor/product data -> Order date calculated (installation date minus lead time) -> Schedule constraint created (selection must be ordered by X date) -> Order reminder triggered at deadline -> PO generated -> Delivery tracked to job site. Long-lead selections are automatically managed.

11. **Failed Inspection Full Workflow:** Failed inspection logged -> Responsible trade identified (from schedule task assignment) -> Correction work order assigned to trade -> Re-inspection scheduled -> Inspection passed -> Schedule updated (actual completion) -> Daily log auto-populated with inspection result. Inspection failures flow through to corrective action and rescheduling.

12. **Weather-to-Schedule Automated Chain:** Weather forecast retrieved (NOAA API) -> At-risk outdoor tasks identified (flagged in schedule) -> Team notified of weather risk -> Schedule auto-adjusted or suggestion generated for PM review -> Daily log auto-populated with weather data (conditions, temperature, precipitation). Weather intelligence is proactive, not reactive.

13. **Certification Expiration Automated Chain:** Employee certification expiration date approaching -> Alert generated to HR/admin -> Training scheduled or renewal initiated -> Certification updated in system -> Compliance report updated across all active projects. No employee works with expired certifications.

14. **Project Completion Automated Chain:** Project marked complete -> Warranty start dates set per contract terms -> Home care schedule generated (maintenance reminders) -> Client portal transitions from construction mode to warranty/home care mode -> Vendor warranty responsibilities documented per trade. The transition from construction to post-construction is seamless.

15. **Change Order Cascade — All Simultaneous:** Change order approved -> Contract value updated -> Budget updated (new/adjusted lines) -> Schedule impact applied (if time extension) -> Draw request schedule adjusted -> Client portal updated with new contract amount and schedule. All downstream systems update atomically when a CO is approved — no manual propagation.

---

## Competitive Feature Parity Checklist

> Features that Buildertrend, Procore, CoConstruct, BuildBook, Adaptive, Materio, and ReportandGo have that must be matched or exceeded. Each item maps to a module in the platform spec.

### Buildertrend Feature Parity

| # | Feature | RossOS Module | Status |
|---|---------|---------------|--------|
| 876 | To-do lists with assignment and due dates | Module 4: Task Management | Spec'd |
| 877 | Warranty claim management | Module 31: Warranty & Home Care | Spec'd |
| 878 | Internal messaging with job context | Module 36: Communication Hub | Spec'd |
| 879 | Customer login/portal | Module 32: Client Portal | Spec'd |
| 880 | Scheduling with Gantt and calendar | Module 7: Scheduling | Spec'd |
| 881 | Budgeting with detailed cost tracking | Module 9: Budget & Cost Tracking | Spec'd |
| 882 | Change order management | Module 17: Change Order Management | Spec'd |
| 883 | Selection sheets | Module 21: Selection Management | Spec'd |
| 884 | Photo management | Module 6: Document Storage (photos) | Spec'd |
| 885 | Daily log with weather | Module 8: Daily Logs | Spec'd |
| 886 | Bid requests to vendors | Module 15: Bid Management | Spec'd |
| 887 | Time clock for employees and subs | Module 34: HR & Workforce | Spec'd |
| 888 | Lead management CRM | Module 12: Lead CRM | Spec'd |
| 889 | Proposals and contracts | Module 38: Contracts & E-Signature | Spec'd |
| 890 | Financial reporting | Module 19: Financial Reporting | Spec'd |
| 891 | Lien waiver tracking | Module 16: Lien Waiver Management | Spec'd |
| 892 | Mobile app | Module 40: Mobile App | Spec'd |

### Procore Feature Parity (Relevant for Residential)

| # | Feature | RossOS Module | Status |
|---|---------|---------------|--------|
| 893 | Drawing management with version control and markup | Module 6: Document Storage + Plan AI | Spec'd |
| 894 | Submittal management | Module 18: Submittals | Spec'd |
| 895 | Meeting minutes | Module 36: Communication Hub | Spec'd |
| 896 | Transmittals | Module 36: Communication Hub | Spec'd |
| 897 | Correspondence logs | Module 36: Communication Hub | Spec'd |
| 898 | Quality & Safety observations | Module 33: Safety & Compliance + Module 28: Punch List & Quality | Spec'd |
| 899 | Commissioning workflows | Module 28: Punch List & Quality (closeout checklists) | Spec'd |
| 900 | BIM coordination | Out of scope for V1 — evaluate for V2 if high-end custom demand warrants | Deferred |

### Differentiating Features (No Competitor Does These Well)

| # | Feature | RossOS Advantage | Module |
|---|---------|-----------------|--------|
| 901 | AI-powered invoice processing | Replaces manual data entry — Claude Vision extracts all fields with confidence scoring | AI Engine + Module 11 |
| 902 | AI-powered estimate generation from plans | Upload plans, get a quantity takeoff and preliminary estimate — no other residential platform does this | AI Engine + Module 9 |
| 903 | Vendor intelligence scoring | Composite score from on-time %, budget adherence, quality, safety across all projects | AI Engine + Module 10 |
| 904 | Material price intelligence database | Every invoice feeds a pricing knowledge base — track material costs over time, by vendor, by region | AI Engine + Intelligence Layer |
| 905 | Schedule intelligence from historical data | AI learns actual durations from daily logs and predicts future task durations with confidence intervals | AI Engine + Module 7 |
| 906 | Integrated home care post-construction | Warranty tracking + maintenance scheduling + client portal — all in the same platform as construction management | Module 31: Warranty & Home Care |
| 907 | True cost intelligence | Every document (invoice, bid, PO, CO) feeds a comprehensive cost database that powers estimating, benchmarking, and anomaly detection | AI Engine (cross-module) |
| 908 | Client selection portal rivaling Materio | Room-by-room selections with product photos, comparisons, allowance tracking, and budget impact — integrated with the build platform | Module 21 + Client Portal |
| 909 | Live field checklists rivaling ReportandGo | Mobile-first safety and quality checklists with photo documentation, GPS verification, and real-time reporting | Module 33 + Module 40 |
| 910 | Invoice processing rivaling Adaptive.build | AI invoice extraction + 3-way matching + approval routing + lien waiver tracking — all in the same platform | AI Engine + Module 11 + Module 16 |

---

## Business Strategy Decisions (Appendix)

> These are business decisions that affect what gets built, not feature specifications. They are listed here for tracking purposes and must be resolved by the founding team. They should NOT be converted to technical requirements until decisions are made.

| # | Decision | Status |
|---|----------|--------|
| 846 | Target customer profile — revenue range, project count, team size, tech savviness | To be decided |
| 847 | Competitive positioning — "Buildertrend but with AI" vs. "completely different approach" | To be decided |
| 848 | MVP definition — minimum viable product that is useful enough to sell | To be decided |
| 849 | Build order — which modules first, what can wait for V2/V3 | Partially decided (6-phase plan exists) |
| 850 | Pricing strategy for early adopters — discount, free, beta access | To be decided |
| 851 | Balancing Ross Built's needs vs. market-wide needs — avoid over-customizing for one builder | To be decided |
| 852 | Go-to-market strategy — direct sales, partnerships, marketplace, word of mouth | To be decided |
| 853 | Handling competitive feature gaps — how to communicate what is not yet built | To be decided |
| 854 | Technology stack at scale — current stack (Next.js + Supabase) vs. alternatives at 1000+ tenants | Decided for V1 (Next.js 16 + Supabase) |
| 855 | Prioritizing "need it now" vs. "nice to have" features — framework for saying no | To be decided |
| 856 | Team composition — solo developer, hired team, agency, combination | To be decided |
| 857 | Funding model — bootstrapped, investor-backed, revenue-funded from Ross Built | To be decided |
| 858 | Timeline to first external customer — 6, 12, or 24 months | To be decided |
| 859 | Managing customer expectations during active development — roadmap transparency | To be decided |
| 860 | Support model at scale — cannot support 100+ customers personally | To be decided |

---

## PART 5: PER-PAGE INTERACTIVE FEATURE REQUIREMENTS

> These are the specific interactive features that each screen/page in the application must support. Missing any of these results in a "why can't I just..." moment for users. These requirements complement the data schemas in Parts 1-3 and the consistency rules in Part 4 by specifying the interactive behaviors expected on each page.

---

### Dashboard Page — Interactive Features (GAP-621 through GAP-632)

The company dashboard must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 621 | **Configurable widget layout** | Each user must be able to arrange their own dashboard layout — drag widgets to reposition, resize, show/hide. Layout is stored as a user preference (Module 2, user_preferences table) and persists across sessions. |
| 622 | **Widget library** | A widget picker must be available with all available widgets: budget summary, schedule status, alerts, weather, photos, pending approvals, activity feed, KPI sparklines, cash position, etc. Users choose which widgets to display from the library. |
| 623 | **Filtering across all widgets** | A global project filter at the top of the dashboard must allow the user to select a specific project (to filter all widgets to that project) or "All Projects" for a company-wide view. The filter state must persist within the session. |
| 624 | **Drill-down from any number** | Every numeric value displayed on the dashboard (dollar amounts, counts, percentages) must be clickable. Clicking navigates to the underlying detail page with appropriate filters pre-applied (e.g., clicking the AP total navigates to the payables page filtered to outstanding invoices). |
| 625 | **Date range selector** | A date range control must be available with presets: Today, This Week, This Month, This Quarter, This Year, and Custom Range. The selected range filters time-sensitive widgets (activity feed, financials, schedule). |
| 626 | **Comparison toggle** | The dashboard must support a comparison mode: this period vs. last period, this year vs. last year. When enabled, KPI cards show the current value alongside the comparison value with a delta indicator (up/down arrow, percentage change, color-coded). |
| 627 | **Refresh / auto-refresh** | A manual refresh button must be available. An auto-refresh interval must be configurable per user (off, 1 min, 5 min, 15 min, 30 min). The dashboard must display a "last updated" timestamp. |
| 628 | **Export dashboard as PDF** | The current dashboard view (with all active widgets and current filter state) must be exportable as a PDF suitable for printing or emailing to stakeholders. The PDF must include the builder's branding (logo, colors). |
| 629 | **"Needs attention" priority queue** | A dedicated widget must display items needing attention, prioritized by urgency and age: overdue approvals, expiring documents, past-due invoices, stalled RFIs, and AI-flagged anomalies. Each item must support dismiss (removes from queue) and snooze (reappears after configurable delay: 1 hour, 1 day, 1 week). |
| 630 | **Quick action buttons** | The dashboard must provide quick action buttons for frequent tasks: Create Daily Log, Create RFI, Approve Invoice, Create Change Order, Upload Document. These actions open a modal or flyout panel — the user completes the action without navigating away from the dashboard. |
| 631 | **Activity feed** | A real-time activity feed must display recent actions across all projects by the builder's team: invoice submissions, approvals, daily log entries, photo uploads, schedule changes, document uploads. Each entry shows: description, timestamp, user, project. The feed must support infinite scroll and filtering by project, user, or action type. |
| 632 | **KPI sparklines** | Key performance indicator cards must include small sparkline charts showing the trend over the selected date range. Metrics include: revenue, costs, margin, AR, AP, cash position, active project count, and any builder-configured KPIs. Sparklines provide at-a-glance trend direction without requiring a separate report. |

---

### Project List Page — Interactive Features (GAP-633 through GAP-646)

The project list page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 633 | **Sortable by any column** | Every column in the project list must be sortable (ascending/descending) by clicking the column header: name, status, PM, start date, budget, % complete, contract amount, predicted completion date, risk score. Multi-column sort must be supported (hold Shift + click for secondary sort). |
| 634 | **Multi-criteria filtering** | The project list must support filtering by multiple criteria simultaneously: status (multi-select), PM (multi-select), location (city/state/subdivision), date range (start, completion), project type, budget range, and any custom fields. Active filters must be displayed as removable chips above the list. |
| 635 | **Saveable filter presets** | Users must be able to save the current filter + sort + column configuration as a named preset (e.g., "My Active Projects," "Over Budget Projects," "AMI Projects"). Presets are stored per user and selectable from a dropdown. |
| 636 | **Shareable filter presets** | Admin and PM roles must be able to create shared filter presets visible to the entire team. Shared presets appear in a "Team Views" section of the preset dropdown. Only the creator or an admin can edit or delete shared presets. |
| 637 | **Bulk actions** | The project list must support selecting multiple projects (checkboxes) and performing bulk actions: archive, change status, reassign PM, reassign superintendent, add/remove tags. A confirmation dialog must show the count and action before executing. |
| 638 | **Customizable columns** | A column picker must allow users to choose which columns are displayed from all available project fields (including custom fields). Column selection is saved as part of the user's view preference. |
| 639 | **Column resize and reorder** | Users must be able to resize columns by dragging column borders and reorder columns by dragging column headers. The layout must persist across sessions. |
| 640 | **View toggle: compact vs. card** | The project list must support at least two display modes: (a) compact table/list view with dense information, and (b) card view with project photo, key metrics, and status badges. The toggle must persist as a user preference. |
| 641 | **Map view** | A map view must display all projects as pins on a map (using project latitude/longitude from the projects table). Clicking a pin shows a summary popup with project name, status, PM, and key metrics. The map must support filtering by the same criteria as the list view. This is especially useful for builders with geographically distributed projects. |
| 642 | **Quick inline editing** | Users with appropriate permissions must be able to edit key fields directly in the list view without opening the project detail: status, PM, superintendent, tags, and priority. Inline editing uses a click-to-edit pattern with auto-save. |
| 643 | **Color coding / tags** | Projects must support configurable color-coded tags (defined per builder in Module 2). Tags are displayed as colored badges on the list and card views. Tags can be used as filter criteria. Examples: "VIP Client," "Model Home," "Insurance Job," "Spec Home." |
| 644 | **Favorite / pin projects** | Users must be able to favorite/pin projects for quick access. Favorited projects appear in a "Favorites" section at the top of the list and in a quick-access dropdown in the navigation bar. Favorites are per user. |
| 645 | **Project health indicators** | Each project must display a composite health indicator using red/yellow/green badges for three dimensions: Budget (based on variance), Schedule (based on SPI), and Risk (based on AI risk score). The overall health color is the worst of the three. |
| 646 | **Search within the project list** | A search box must filter the project list in real-time by project name, project number, address, client name, PM name, and tags. Search must be fast (< 200ms) and use trigram matching for partial/fuzzy results. |

---

### Project Detail / Overview Page — Interactive Features (GAP-647 through GAP-657)

The project detail/overview page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 647 | **Summary cards** | The top of the project detail page must display summary cards for: Budget (contract, costs, variance), Schedule (% complete, days remaining, status), Documents (total, pending review), RFIs (open/total), Change Orders (pending/total, net value), and Punch List (open/total). Each card is clickable — navigates to the corresponding module page. |
| 648 | **Project info section** | A structured project information section must display: address (with map link), client name (linked to client record), PM (linked), superintendent (linked), contract type, contract amount, current contract amount (with COs), key dates (contract date, start, estimated completion, actual completion). All fields must be editable inline by users with appropriate permissions. |
| 649 | **Quick navigation** | A sidebar or tab bar must provide one-click navigation to every module within the project: Budget, Schedule, Invoices, POs, Change Orders, Selections, Daily Logs, Photos, Documents, RFIs, Submittals, Permits, Inspections, Punch List, Lien Waivers, Draws, Warranties, Communications, Reports. Module tabs must show badge counts for items needing attention. |
| 650 | **Activity timeline** | A chronological activity timeline must display everything that has happened on the project: invoice submissions, approvals, daily log entries, photo uploads, schedule changes, change orders, RFI responses, document uploads, selection decisions. The timeline must support filtering by activity type, date range, and user. It must support infinite scroll for long project histories. |
| 651 | **Project notes / journal** | A running notes/journal section must allow any team member to add timestamped notes about the project. Notes support rich text (bold, italic, lists, links) and can be tagged as "internal only" (hidden from client portal) or "client visible." Notes are distinct from daily logs — they are for ad-hoc project observations, decisions, and reminders. |
| 652 | **Team roster** | A team roster section must display everyone assigned to the project: PM, superintendent, and all active subcontractors/vendors with their role/trade. Each entry shows name, company, phone, email, and current assignment status. The roster must link to the contact/vendor profile page. |
| 653 | **Key milestone tracker** | A visual milestone tracker must display the project's major milestones with dates and completion status: Permit Issued, Breaking Ground, Foundation Complete, Framing Complete, Dry-In, Rough-In Complete, Drywall Complete, Finishes Start, Substantial Completion, CO Issued, Final Completion. Milestones pull from the schedule module. Completed milestones show actual date; future milestones show planned date with predicted date if AI predicts a variance. |
| 654 | **Project risk register** | A risk register section must allow the PM to identify and track project risks: risk description, likelihood (low/medium/high), impact (low/medium/high), mitigation plan, risk owner, and status (open/mitigated/occurred/closed). AI must auto-suggest risks based on project attributes (e.g., coastal project = hurricane risk, luxury home = selection delay risk). The risk register feeds the project health score. |
| 655 | **Project photo carousel** | A photo carousel must display the most recent photos from daily logs and direct uploads. The carousel must be filterable by phase (to show progress over time) and support full-screen viewing. A "View All Photos" link navigates to the full photo gallery. |
| 656 | **Weather widget** | A weather widget must display current conditions and a 3-day forecast for the project's location (using latitude/longitude from the project record). The widget must flag days with adverse weather conditions that could impact outdoor work. Weather data is fetched from a weather API and cached. |
| 657 | **Quick stats** | A quick stats section must display: Days Since Start (actual_start to today), Estimated Days Remaining (today to estimated_completion), Total Project Duration (actual_start to estimated_completion), and % Complete (from schedule). If AI predicts a different completion date than the plan, the variance must be shown. |

---

### Budget Page — Interactive Features (GAP-658 through GAP-672)

The budget page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 658 | **Expandable/collapsible hierarchy** | The budget must display as an expandable tree: Division > Cost Code Category > Line Item. Users can expand/collapse individual nodes or use "Expand All" / "Collapse All" controls. The expansion state must persist within the session. |
| 659 | **Multiple budget views** | The budget page must support multiple view modes, selectable via tabs or dropdown: (a) Original Budget, (b) Current Budget (with approved COs), (c) Committed (POs + subcontracts), (d) Actual (invoiced costs), (e) Projected Final Cost (AI cost-to-complete). Each view shows the relevant columns; a "Full View" shows all columns side by side. |
| 660 | **Variance column with color coding** | The variance column (budget minus actual/projected) must use color coding: green for under budget, red for over budget, yellow for within a configurable warning threshold (default: 90-100% of budget). The color intensity must scale with the severity of the variance. |
| 661 | **Percentage indicators** | Each budget line must show: % of budget consumed (actual / budget) and % of work complete (from schedule or manual override). A visual indicator must flag lines where % budget consumed significantly exceeds % work complete (early cost overrun warning). |
| 662 | **Cost-to-complete column** | A cost-to-complete (CTC) column must be auto-calculated using: budget remaining minus committed costs, adjusted by AI intelligence (historical cost trends, similar project data). The CTC must be manually overridable by the PM — when overridden, the system stores both the AI-calculated and manual values with the override reason. |
| 663 | **Budget line item notes** | Each budget line must support notes — a text field where the PM can explain variances, document decisions, or record context. Notes are visible on the budget page as an expandable row below the line item and are included in budget reports. |
| 664 | **Attached documents per line** | Each budget line must support document attachments: linked invoices, POs, bids, contracts, and change orders. Attachments are displayed as a count badge on the line item; clicking opens a panel showing all linked documents with preview capability. |
| 665 | **Filter by trade, phase, cost code, status** | The budget must be filterable by: trade/division, phase, cost code range, status (over budget, under budget, at risk, no activity), and vendor. Filters apply to the tree view, hiding non-matching branches. Active filters must be displayed as removable chips. |
| 666 | **Budget history / snapshots** | The budget page must support viewing the budget at any previous point in time. Budget snapshots are taken automatically at key milestones (contract signing, each draw submission, each CO approval) and can be taken manually. A date slider or snapshot selector allows the user to see the budget as it was at any snapshot point. |
| 667 | **Import/export to Excel** | The budget must support: (a) export to Excel (.xlsx) preserving the hierarchy, formatting, and all columns, and (b) import from Excel for initial budget creation or mass updates. The import must validate against the cost code structure and flag conflicts. |
| 668 | **Benchmark comparison** | Each budget line must support comparison to platform benchmarks (if the builder has opted in to benchmarking in Module 3): "Your framing cost is $X/SF vs. platform average of $Y/SF for similar projects in your region." Benchmark data is displayed as a tooltip or inline indicator. |
| 669 | **Forecast scenarios** | The budget must support "what-if" scenario modeling: the user can adjust assumptions (e.g., "concrete costs go up 10%," "add 2 weeks to schedule") and see the projected impact on total cost and margin without saving. Scenarios are displayed as a separate column alongside the actual budget. Scenarios can be saved for comparison. |
| 670 | **Change order impact visualization** | The budget must visually distinguish between original budget amounts and CO-adjusted amounts. A "CO Impact" view or indicator shows the original budget, the net CO impact per line, and the resulting revised budget. This makes it easy to see which budget lines have been affected by change orders. |
| 671 | **Locked/frozen lines** | Budget lines must support a "locked" or "frozen" status: locked lines cannot be edited (only unlocked by admin/owner). This is used for finalized cost codes where the builder has a firm subcontract and does not want accidental budget changes. Locked lines are visually indicated (lock icon) and excluded from mass-update operations. |
| 672 | **Audit trail per line** | Each budget line must have an accessible audit trail: who changed what, when, and the previous value. The audit trail is viewable via a "History" button on each line item, showing a chronological list of changes. This uses the entity_change_log from Module 3. |

---

### Schedule Page — Interactive Features (GAP-673 through GAP-691)

The schedule page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 673 | **Gantt chart with drag-and-drop** | The primary schedule view must be a Gantt chart where tasks can be repositioned by dragging (to change dates) and resized (to change duration). Dragging a task must automatically recalculate dependent tasks' dates. Changes must be saved with undo capability. |
| 674 | **Calendar view toggle** | The schedule must support a calendar view showing tasks as events on a month/week calendar. Calendar view is useful for seeing daily workload and inspection scheduling. |
| 675 | **List view toggle** | The schedule must support a flat list view with sortable columns: task name, start date, end date, duration, vendor, status, % complete. List view is useful for data-entry mode and bulk operations. |
| 676 | **Kanban board toggle** | The schedule must support a Kanban board view with columns by status: Not Started, In Progress, Complete, Delayed, On Hold. Tasks are displayed as cards that can be dragged between status columns. |
| 677 | **Two-week look-ahead view** | A dedicated "look-ahead" view must display only the tasks scheduled within the next N weeks (configurable, default: 2 weeks). This is the primary view used in weekly subcontractor coordination meetings. The look-ahead must be printable and exportable as PDF. |
| 678 | **Filter by trade, phase, critical path, status** | The schedule must be filterable by: trade/vendor, phase, critical path (show only critical path tasks), status (not started, in progress, complete, delayed), and date range. Filters apply to all view modes (Gantt, calendar, list, Kanban). |
| 679 | **Dependency arrows** | The Gantt chart must display dependency arrows showing predecessor/successor relationships between tasks. Arrow types must distinguish between: Finish-to-Start (FS), Start-to-Start (SS), Finish-to-Finish (FF), and Start-to-Finish (SF). Clicking a dependency arrow must show the lag/lead time and allow editing. |
| 680 | **Resource assignment and leveling view** | The schedule must support a resource view showing: which vendors/trades are assigned to which tasks, when resource conflicts occur (same vendor assigned to overlapping tasks on different projects), and resource utilization over time. Resource leveling suggestions must flag over-allocated vendors. |
| 681 | **Baseline comparison overlay** | The schedule must support overlaying the baseline schedule (as-planned) on top of the current schedule (as-built). The baseline appears as a shadow bar behind each task, making it easy to see which tasks are ahead or behind plan. Baseline is set at project start and can be updated at milestones. |
| 682 | **Weather overlay** | The schedule must display weather forecast data on the calendar/Gantt view for the project's location. Weather icons appear on each day; days with adverse weather conditions (rain, extreme temperature, high wind) are highlighted. Outdoor tasks scheduled on adverse weather days are flagged with a warning. |
| 683 | **Milestone markers** | The schedule must display milestone markers (diamond shapes on the Gantt chart) for key project milestones: permit issued, breaking ground, foundation complete, framing complete, dry-in, rough-in complete, substantial completion, CO, final completion. Milestones have labels and dates; completed milestones show a checkmark. |
| 684 | **Progress indicators per task** | Each task must display a progress indicator: 0%, 25%, 50%, 75%, 100% (or finer granularity if configured). Progress is visually represented as a filled portion of the Gantt bar. Progress can be updated by: daily log AI extraction, manual entry, or drag on the progress bar. |
| 685 | **Task detail panel** | Clicking a task must open a detail panel (slide-out or modal) showing: task name, description, dates (planned, actual, predicted), duration, predecessor/successor tasks, assigned vendor, crew size, % complete, notes, linked photos from daily logs, linked RFIs, and change history. All fields must be editable from the panel. |
| 686 | **Print/export schedule** | The schedule must be exportable in multiple formats: (a) Gantt chart as PDF (landscape, tabloid size), (b) list view as Excel/CSV, (c) calendar view as PDF, (d) look-ahead as PDF. The print must include the builder's branding and current date. |
| 687 | **Schedule health indicators** | The schedule must display health indicators: (a) critical path highlighted in red, (b) near-critical tasks (float < 3 days) highlighted in orange, (c) at-risk tasks (AI-predicted to miss their deadline) flagged with a warning icon. An overall schedule health score (SPI-based) must be displayed. |
| 688 | **Vendor schedule view** | A filtered view must show only the tasks assigned to a specific vendor: "Show me only what ABC Electric needs to do." This view is shareable with the vendor via vendor portal or PDF export. It includes only their tasks with dates, dependencies, and predecessor completion status. |
| 689 | **Client-friendly schedule view** | A simplified schedule view must be available for the client portal: showing only major milestones and high-level phases (not 500 individual tasks). The client view must be configurable — the builder selects which tasks/milestones are visible to the client. |
| 690 | **Schedule conflict detection** | The system must detect and flag scheduling conflicts: (a) two tasks requiring the same physical space scheduled concurrently (e.g., flooring and painting in the same room), (b) resource over-allocation (same vendor assigned to overlapping tasks), (c) tasks scheduled on weekends/holidays without explicit override. Conflicts are displayed as warning indicators on the schedule. |
| 691 | **Bulk schedule operations** | The schedule must support bulk operations: (a) shift all tasks by N days (for project-wide delay), (b) shift selected tasks by N days, (c) reassign trade/vendor on multiple tasks, (d) bulk status change (mark multiple tasks complete). Bulk operations must show a preview of the impact before applying. |

---

### Invoice / Billing Page — Interactive Features (GAP-692 through GAP-707)

The invoice/billing page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 692 | **Invoice queue with status sorting** | Incoming invoices must be displayed as a queue sorted by status: New (unreviewed), Pending Review, Approved, Paid, Disputed. Each status is a tab or filter option. Within each status, invoices are sorted by date received (oldest first) to ensure FIFO processing. Badge counts must show the number of invoices in each status. |
| 693 | **AI-extracted data with confidence indicators** | AI-extracted invoice data must display confidence scores per field. Fields with confidence below 0.95 must show a yellow or red warning indicator with the confidence percentage (e.g., "85% confident this is $4,250"). Low-confidence fields must be visually highlighted for human review. |
| 694 | **Side-by-side view** | The invoice review interface must display the original invoice document (PDF/image) on the left and the extracted/editable data fields on the right. Fields on the right must highlight their corresponding location on the document image when focused. This enables efficient human verification of AI extraction. |
| 695 | **One-click approval / rejection** | The invoice review interface must provide one-click "Approve" and "Reject" buttons. Approval requires no additional input (unless the invoice exceeds threshold amounts requiring multi-level approval per Module 2 workflow configuration). Rejection must require a comment explaining the reason. Rejection reasons must be selectable from a configurable list plus free text. |
| 696 | **Cost code assignment with smart suggestions** | Each invoice line item must have a cost code assignment field. The AI must suggest cost codes based on: line item description, vendor's historical cost code assignments, and PO/contract linkage. Suggestions are displayed as a dropdown sorted by confidence. The user can accept the suggestion or select a different cost code. |
| 697 | **Budget impact preview** | Before approving an invoice, the system must display a budget impact preview: "Approving this invoice will bring [Cost Code] to [X]% of budget" with a visual bar showing the budget consumption. If the invoice would cause a cost code to exceed budget, a prominent warning must be displayed. |
| 698 | **Batch approval** | The invoice queue must support selecting multiple invoices (checkboxes) and approving them in batch. Batch approval must show a summary of: total amount, number of invoices, affected cost codes, and aggregate budget impact before confirming. Batch approval is only available for invoices that do not require additional review (below threshold, high AI confidence). |
| 699 | **Invoice history per vendor** | The invoice detail view must include a "Vendor History" panel showing all past invoices from this vendor: invoice number, date, amount, status, payment date. This provides context for evaluating the current invoice (e.g., detecting if the vendor is accelerating billing frequency). |
| 700 | **Duplicate detection alerts** | When the AI detects a potential duplicate invoice (same vendor, similar amount, similar date, similar invoice number), a prominent alert must be displayed: "This appears similar to Invoice #X from this vendor dated [date] for [amount]." The alert must link to the potential duplicate for side-by-side comparison. The user must explicitly dismiss the duplicate warning before approving. |
| 701 | **Payment status tracking** | Each invoice must track its payment lifecycle: Approved > Payment Scheduled > Payment Sent > Payment Cleared. The current payment status must be visible on the invoice list and detail views. Integration with accounting systems (Module 14) updates payment status automatically. |
| 702 | **Lien waiver status indicator** | Each invoice must display the lien waiver status for the corresponding vendor and draw period: Required (no waiver received), Received (waiver uploaded), Verified (AI-verified waiver matches invoice), and Not Required (below threshold or exempt). If a lien waiver is required but missing, a warning must block payment scheduling (configurable per builder). |
| 703 | **Retainage auto-calculation** | When an invoice is associated with a contract that has retainage terms, the system must auto-calculate the retainage amount and display it separately: gross invoice amount, retainage held, and net payable amount. Retainage percentage is pulled from the contract record. The retainage calculation must be overridable for final invoices where retainage is released. |
| 704 | **Link to PO and contract** | Each invoice must display links to the associated PO and/or contract. Clicking the link opens the PO or contract detail in a side panel for comparison. The system must highlight discrepancies between the invoice and the linked PO/contract (amount differences, scope differences, pricing differences). |
| 705 | **Aging report** | An aging report view must display all invoices grouped by days outstanding: Current (0-30), 31-60, 61-90, 90+. The report must show totals per bucket and be filterable by vendor, project, and cost code. A chart visualization shows the aging distribution. |
| 706 | **Payment run generation** | The system must support creating a "payment run": select approved invoices for batch payment, review the total, and generate a payment batch. The payment run exports to the accounting system (Module 14) or generates check/ACH payment instructions. Payment runs are logged with an audit trail. |
| 707 | **Export to accounting system** | An "Export to Accounting" button must be available to push approved invoices (or payment runs) to the integrated accounting system (QuickBooks, Xero, etc.). The export must include: vendor name, invoice number, amount, cost codes mapped to GL accounts, project/job reference, and payment terms. Export status must be tracked per invoice. |

---

### Vendor Profile Page — Interactive Features (GAP-708 through GAP-723)

The vendor profile page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 708 | **Contact information** | The vendor profile must display comprehensive contact information: company name, primary contact name, phone, mobile, email, address, website, and key personnel (with roles). All fields must be editable inline. Multiple contacts per vendor company must be supported. |
| 709 | **Insurance status with expiration countdown** | The vendor profile must prominently display insurance status: each coverage type (GL, auto, workers comp, umbrella) with expiration date and a countdown indicator. Expired insurance must display a red warning. Insurance approaching expiration (within 30 days) must display a yellow warning. The status must link to the uploaded COI document. |
| 710 | **License status with verification link** | The vendor profile must display license information: license number, state, type, expiration date, and a link to the state licensing board for online verification. Expired or soon-to-expire licenses must be flagged with warnings consistent with the insurance indicators. |
| 711 | **Performance scorecard** | The vendor profile must display a visual performance dashboard: composite score (0-100), with breakdown by: On-Time Delivery %, Budget Adherence %, Quality Score (based on punch items and rework), Safety Record, and Communication Responsiveness. Scores are calculated from data across all projects the vendor has worked on. Historical trend charts show performance over time. |
| 712 | **Job history** | The vendor profile must display a complete history of all projects the vendor has worked on: project name, dates, scope, contract amount, actual cost, performance rating per job, and any notable issues. The history is sortable by date, amount, and rating. Clicking a project navigates to the project detail. |
| 713 | **Financial summary** | The vendor profile must display a financial summary: total spend to date (all time), total spend this year, average invoice amount, payment history (average days to pay), outstanding balance, and retainage held. A chart shows spending trend over time. |
| 714 | **Active contracts and POs** | The vendor profile must display all active contracts and POs: contract/PO number, project, amount, invoiced to date, remaining balance, and status. Each entry links to the contract or PO detail page. |
| 715 | **Open punch items across all jobs** | The vendor profile must display all open punch list items assigned to this vendor across all projects: item description, project, age (days since creation), priority, and status. This gives a complete view of the vendor's outstanding quality issues. |
| 716 | **Schedule reliability metrics** | The vendor profile must display schedule reliability metrics: on-time start percentage, on-time completion percentage, average delay (days), and a comparison to the builder's average vendor performance. Data is aggregated from schedule task actual dates vs. planned dates across all projects. |
| 717 | **Bid history** | The vendor profile must display all bids submitted by this vendor: project, scope, bid amount, competing bid count, won/lost status, and pricing trends over time. A chart shows the vendor's bid pricing trend for their trade category. |
| 718 | **Communication log** | The vendor profile must display recent communications: messages, emails, phone call notes, and meeting notes — filtered to this vendor. Each entry shows date, subject, channel, and linked project. New messages can be initiated directly from the profile. |
| 719 | **Document repository** | The vendor profile must display all documents associated with this vendor: certificates of insurance, W-9, contracts, lien waivers, licenses, and any other uploaded documents. Documents are organized by type with version history. Expired documents are flagged. |
| 720 | **Notes and tags** | The vendor profile must support internal notes (visible only to the builder's team, never to the vendor) and configurable tags for categorization. Tags can be used for filtering in the vendor directory (e.g., "Preferred," "Backup," "New," "Do Not Use"). |
| 721 | **Related vendors** | The vendor profile must support linking related vendors: parent/subsidiary relationships, alternate contacts for the same trade, and preferred partnerships (e.g., "this electrician works well with this HVAC contractor"). Related vendors are displayed as links on the profile. |
| 722 | **Capacity indicator** | The vendor profile must display a capacity indicator: how many active jobs the vendor currently has with this builder, how many tasks are currently assigned, and an estimated workload assessment. This helps PMs assess whether the vendor can take on additional work. |
| 723 | **Quick actions** | The vendor profile must provide quick action buttons: Create PO, Invite to Bid, Send Message, Schedule Meeting, Request Updated Insurance, and Request Lien Waiver. Each action opens a pre-populated form or workflow without navigating away from the vendor profile. |

---

### Selection Page (Client-Facing) — Interactive Features (GAP-724 through GAP-735)

The selection page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 724 | **Room-by-room layout** | Selections must be organized by room: "Kitchen Selections," "Master Bath Selections," "Powder Room Selections," etc. Each room is a collapsible section showing all selection categories within that room. Room organization follows the spec book structure (from AI extraction) or manual configuration. General selections (exterior, roofing, windows) are displayed in a separate "Whole House" section. |
| 725 | **Selection cards with rich content** | Each selection option must be displayed as a visual card containing: product photo, manufacturer, product name, model number, finish/color, dimensions, price (or price difference from allowance), lead time, and availability status. Cards must support image zoom on hover/click. |
| 726 | **Comparison mode** | Within a selection category (e.g., "Kitchen Faucet"), the client must be able to select 2-3 options for side-by-side comparison. The comparison view shows all option details in columns for easy evaluation: price, features, lead time, manufacturer, and any notes from the designer or builder. |
| 727 | **Budget impact real-time calculator** | As the client browses and selects options, a running budget impact calculator must display: allowance amount for this category, selected option price, variance (over/under allowance), and cumulative budget impact across all selections. The calculator must update in real-time as selections change. If the client's selections put them over the total allowance, a prominent alert must be displayed. |
| 728 | **Approval button with e-signature** | When the client finalizes their selections for a category or room, an "Approve Selections" button must capture their electronic signature (integrated with the e-signature module). The approval is timestamped, logged, and triggers the downstream workflow (PO generation, schedule constraint updates). |
| 729 | **Status indicators** | Each selection category must display its current status: Not Started, Options Presented, Client Reviewing, Selected, Ordered, Received, Installed. Status badges use the consistent color scheme from Part 4. A progress bar at the top shows overall selection completion (e.g., "23 of 47 selections made"). |
| 730 | **Deadline countdown** | Each selection category must display its deadline with a countdown: "Selection needed by [date] to stay on schedule." Deadlines are calculated from the schedule module (installation date minus lead time minus order processing time). Overdue selections are highlighted in red with an alert. |
| 731 | **Inspiration board** | The selection page must include an "Inspiration Board" section where the client can upload photos of what they like (from Pinterest, magazines, showrooms, etc.). The builder and designer can reference inspiration images when recommending options. Inspiration images are stored per room or per category. |
| 732 | **Comment/question thread per selection** | Each selection category must support a threaded comment/question conversation between the client, builder, and designer. Comments are timestamped and attributed. The builder is notified when the client posts a question. This eliminates the need for email back-and-forth about selections. |
| 733 | **Selection history** | The system must track all considered options for each selection category — not just the final selection. The history shows: which options were presented, when, by whom, which were considered, and the final choice. This provides a complete audit trail for selection decisions. |
| 734 | **Print/export selection summary** | The client must be able to export a selection summary: a formatted PDF showing all selections by room, with photos, product details, prices, and total budget impact. The PDF must include the builder's branding and the approval signatures. |
| 735 | **Designer view** | Interior designers must have a dedicated view where they can: add and recommend options within each selection category, attach mood boards, write notes, and mark their recommended option. The designer view is controlled by the designer portal access permissions. |

---

### Daily Log Page — Interactive Features (GAP-736 through GAP-753)

The daily log page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 736 | **Date selector with calendar navigation** | The daily log page must have a date selector with calendar navigation: click to select any date, arrow buttons for previous/next day, and a "Today" quick button. The calendar must indicate which dates have existing log entries (dot indicators). |
| 737 | **Auto-populated weather data** | Weather data for the project's location and the selected date must be auto-populated from the weather API: condition (sunny, cloudy, rain, snow), high/low temperature, precipitation, wind speed, humidity. The superintendent can override auto-populated weather if it does not match site conditions. |
| 738 | **Workforce tracker** | A workforce tracking section must list which vendors/subcontractors were on site and how many workers each had. The section must support: adding vendors from a dropdown (filtered to project team), entering headcount per vendor, entering hours per vendor, and specifying the trade. A total headcount is auto-calculated. |
| 739 | **Work performed narrative** | A work performed section must allow the superintendent to describe work completed that day. The system must support both free-text narrative and structured entry (by trade/area). AI assistance must be available: the superintendent can dictate via voice or type a rough narrative, and the AI structures it into trade-categorized work items with schedule task linkages. |
| 740 | **Material delivery log** | A material delivery section must allow logging deliveries received: description, vendor, quantity, PO reference (auto-matched), and received-by signature. The delivery log must support attaching delivery ticket photos. Logged deliveries must auto-update PO received quantities. |
| 741 | **Equipment on site** | An equipment tracking section must list equipment on site that day: equipment name/type, owned or rented, vendor (if rented), and hours used. Equipment entries can be carried forward from the previous day. |
| 742 | **Visitor log** | A visitor log section must record all non-worker visitors to the site: name, company, purpose, time in, and time out. Common visitor types include: client, architect, inspector, delivery driver, real estate agent. The visitor log supports liability documentation. |
| 743 | **Safety observations** | A safety section must allow logging safety observations: both positive observations (PPE compliance, clean site) and concerns (missing guardrails, exposed wiring). Safety observations can be linked to photos and assigned to responsible parties for corrective action. |
| 744 | **Photo upload with drag-and-drop** | The daily log must support photo upload via drag-and-drop and bulk upload (select multiple files). Photos are auto-processed by the AI photo pipeline (trade classification, phase detection, room identification, quality scoring). Photos can be annotated with captions and linked to specific work-performed items. |
| 745 | **Carry forward from yesterday** | A "Carry Forward" button must pre-populate today's log with yesterday's vendors, equipment, and recurring entries. The superintendent reviews and adjusts (add/remove vendors, update headcounts) rather than re-entering everything from scratch. |
| 746 | **Linked schedule tasks** | Work performed entries must support linking to schedule tasks: "Work performed today relates to [Task X]." When linked, the daily log entry can trigger a schedule progress update. The AI must suggest task links based on the work description and the current schedule. |
| 747 | **Issue/delay reporting** | The daily log must support structured issue/delay reporting: issue description, category (weather, material, labor, design, permitting, client, other), severity (low, medium, high, critical), schedule impact (estimated days), cost impact (estimated dollars), and action required. Issues are visible on the project dashboard and trigger notifications to the PM. |
| 748 | **Voice-to-text entry** | The daily log must support voice-to-text entry: the superintendent speaks their daily log into a mobile device, the system transcribes the audio, and the AI extracts structured data (work performed, vendors, issues, deliveries) from the transcription. The original audio is stored for reference. |
| 749 | **Preview mode** | Before submitting, the superintendent must be able to preview the daily log as it will appear to others: formatted view with all sections, photos, and linked data. The preview must also show the client-friendly version that will appear on the client portal (if enabled). |
| 750 | **Edit history with audit trail** | After a daily log is submitted, edits must be tracked with an audit trail: who changed what, when, and the previous value. Submitted logs can be edited by the author or by PM/admin roles, but all changes are logged. An "Edit History" button shows the complete change history. |
| 751 | **Daily log photo gallery** | A dedicated photo gallery view must display all photos from a specific daily log in a grid layout with lightbox viewing. Photos can be reordered, annotated, and selectively marked as "client suitable" for portal display. |
| 752 | **Export daily log as PDF** | Each daily log must be exportable as a formatted PDF including: date, weather, workforce, work performed, deliveries, equipment, visitors, safety observations, issues, and photos. The PDF must include the builder's branding. PDF export is used for client updates, lender documentation, and project records. |
| 753 | **Notification confirmation** | Upon submitting a daily log, the system must confirm which notifications were sent: "Daily log submitted. PM [name] notified. Client portal updated." The confirmation must list all notification recipients so the superintendent knows who was informed. |

---

### Document Management Page — Interactive Features (GAP-754 through GAP-768)

The document management page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 754 | **Folder tree navigation** | Documents must be organized in a configurable folder tree per project. The default folder structure is configurable per builder (Module 2) with common folders: Plans, Contracts, Permits, Insurance, Invoices, Change Orders, Submittals, Photos, Correspondence, Closeout. Builders can add, rename, and reorganize folders. Folders support nesting. |
| 755 | **Drag-and-drop upload with auto-categorization** | Uploading a document via drag-and-drop must trigger the AI document classification pipeline (Ingestion Point 4). The AI auto-categorizes the document type and suggests the appropriate folder. The user can accept the suggestion or manually assign a folder. |
| 756 | **Bulk upload with progress indicator** | Multiple files must be uploadable simultaneously (drag multiple files or use a multi-file picker). A progress indicator must show: file name, upload progress %, AI processing status, and classification result for each file. Bulk upload must handle 50+ files without timeout. |
| 757 | **Full-text search** | A search box must support full-text search across all documents: file name, AI-extracted text (OCR), tags, and metadata. Search results must display: file name, document type, date, matching text snippet, and relevance score. Results must be clickable to open the document preview. |
| 758 | **Filter by type, trade, date, uploader** | The document list must be filterable by: document type (plan, contract, invoice, permit, photo, etc.), trade/cost code association, date range (uploaded or document date), and uploaded-by user. Filters can be combined and are displayed as removable chips. |
| 759 | **Version history with comparison** | Each document must support version tracking: when a new version is uploaded, the system retains all previous versions. A version history panel shows: version number, date, uploaded by, and change notes. A comparison tool must allow viewing two versions side-by-side (for PDFs and images). The current/latest version is the default view. |
| 760 | **Document preview without downloading** | Documents must be previewable in-browser without downloading: PDFs rendered in a viewer, images displayed directly, Office documents rendered via a preview service. The preview must support: zoom, page navigation (for multi-page documents), and rotation. |
| 761 | **Annotation/markup tools** | The document viewer must support annotation and markup: text comments (sticky notes), drawing tools (lines, arrows, rectangles, circles), highlighter, text overlay, dimension measurement, and callout labels. Annotations are saved per user and can be shared with team members or vendors. Markup layers can be toggled on/off. |
| 762 | **Sharing controls** | Each document must have configurable sharing controls: who can view this document (internal only, client portal visible, vendor portal visible, specific users). Sharing settings default to folder-level settings but can be overridden per document. A "Share" button generates a secure sharing link with optional expiration. |
| 763 | **Expiration tracking with alerts** | Documents with expiration dates (insurance certificates, permits, licenses, bonds) must display expiration countdowns and trigger alerts at configurable intervals (30, 14, 7 days before expiration). Expired documents must be prominently flagged. An "Expiring Documents" dashboard widget shows all documents approaching expiration. |
| 764 | **Download with watermark option** | When downloading documents, the system must support optional watermarking: builder logo overlay, "DRAFT" or "FOR REFERENCE ONLY" text, or a custom watermark. Watermark settings are configurable per document type. Watermarking is especially important for plans and specifications shared with vendors. |
| 765 | **Batch operations** | The document list must support selecting multiple documents and performing batch operations: move to folder, add tags, delete, change sharing settings, and download as ZIP. Batch delete requires confirmation with a count of affected files. |
| 766 | **Recent documents and favorites** | A "Recent" section must show the last 20 documents viewed or uploaded by the current user. A "Favorites" section must allow users to star/favorite documents for quick access. Recent and Favorites are displayed as a sidebar or tab alongside the folder tree. |
| 767 | **Document status indicators** | Each document must display a status indicator: Draft, Pending Review, Approved, Expired, Superseded. Status badges use the consistent color scheme from Part 4. Documents pending review must be surfaced in the "Needs Attention" dashboard widget. |
| 768 | **E-signature integration** | Documents that require signatures (contracts, change orders, lien waivers, selection approvals) must integrate with the e-signature module (Module 38). A "Send for Signature" button initiates the e-signature workflow directly from the document viewer. Signed documents are automatically filed and marked with a "Signed" status badge. |

---

### Reports Page — Interactive Features (GAP-769 through GAP-780)

The reports page must support the following interactive capabilities:

| # | Feature | Requirement |
|---|---------|-------------|
| 769 | **Report library** | The reports page must display a library of pre-built reports organized by category (Financial, Operational, Scheduling, Procurement, HR, Compliance, Client, Forecasting — as defined in Part 3). Each report shows: name, description, category, and a preview thumbnail. Reports are searchable by name and keyword. |
| 770 | **Report builder** | A drag-and-drop custom report builder must be available for creating new reports (as specified in Part 3, Custom Report Builder section). Users can select data sources, drag fields to columns/rows/filters, configure grouping and aggregation, choose chart type, and apply conditional formatting. The builder must include a live preview that updates as the report is configured. |
| 771 | **Report scheduling** | Any report (built-in or custom) must be schedulable for automatic generation and distribution: daily, weekly, monthly, or custom schedule. The scheduled report is generated as PDF and/or Excel and emailed to a configurable recipient list. Scheduled reports include the latest data at generation time. |
| 772 | **Report favorites and recently run** | The reports page must display a "Favorites" section (user-starred reports) and a "Recently Run" section (last 10 reports run by the user) for quick access. Reports can be pinned to favorites with one click. |
| 773 | **Parameter selection before running** | Before running a report, the system must present a parameter selection screen: date range, project (single, multiple, or all), vendor (single, multiple, or all), cost code range, and any report-specific parameters. Parameters must have sensible defaults (e.g., date range defaults to current month). |
| 774 | **Multi-format export** | Every report must be exportable in multiple formats: PDF (formatted for print), Excel (.xlsx with data and formatting), Word (.docx for editable reports), and CSV (raw data). The export button must offer all format options. PDF exports must include the builder's branding. |
| 775 | **Interactive charts** | Charts within reports must be interactive: hover shows data point details (value, label, percentage), click drills down to the underlying data rows, and charts can be toggled between chart types (bar, line, pie) without re-running the report. Charts must support zoom for large datasets. |
| 776 | **Comparative reporting** | The system must support comparative reporting: select 2 or more projects, periods, or vendors to compare side-by-side. Comparative reports display: each entity in its own column, a variance column, and percentage change. This is useful for benchmarking projects, evaluating vendor performance, and period-over-period analysis. |
| 777 | **Report templates** | Custom reports must be saveable as templates that are reusable and shareable within the builder's team. Templates include: data source configuration, field selection, filters, grouping, chart type, and formatting. Templates are organized in personal or shared folders. |
| 778 | **Client-formatted reports** | The system must support generating reports in a client-friendly format: professional layout with builder branding (logo, colors, contact info), no internal cost data or margins, simplified language, and a polished PDF output suitable for lender or client distribution. Client-formatted versions must be selectable as an export option on applicable reports. |
| 779 | **AI-generated narrative summaries** | Reports must support optional AI-generated narrative summaries: a plain-language paragraph summarizing the key findings, trends, and anomalies in the report data. The narrative is generated by the AI engine and displayed at the top of the report. The user can edit the narrative before exporting. Example: "The Johnson Residence is 4.2% over budget driven primarily by a $12,400 overrun in framing labor. Schedule is currently 3 days behind plan with the critical path running through electrical rough-in." |
| 780 | **Report archiving** | The system must support saving a report as a point-in-time snapshot (archive). Archived reports preserve the exact data and formatting as of the archive date — they do not change when underlying data changes. Archived reports are stored with the archive date, generated-by user, and a label. This is used for historical reference, lender documentation, and audit compliance. |

---

*Document Version: 1.2*
*Created: 2026-02-12*
*Updated: 2026-02-12 — Added Part 5: Per-Page Interactive Feature Requirements (GAP-621 through GAP-780) covering Dashboard, Project List, Project Detail, Budget, Schedule, Invoice/Billing, Vendor Profile, Selection, Daily Log, Document Management, and Reports pages*
*Status: Complete — covers all 83+ pages with structured output schemas for every data type, plus 160 per-page interactive feature requirements*
