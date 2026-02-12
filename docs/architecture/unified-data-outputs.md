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

*Document Version: 1.0*
*Created: 2026-02-12*
*Status: Complete — covers all 83 pages with structured output schemas for every data type*
