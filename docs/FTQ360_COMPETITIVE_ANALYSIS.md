# FTQ360 vs RossOS Competitive Analysis

**Created:** February 13, 2026
**Purpose:** Feature parity research + AI differentiation strategy
**Strategy:** Build Native (no external dependency)

---

## Executive Summary

FTQ360 is a construction quality management platform focused on "First Time Quality" (FTQ) scoring, checklist-based inspections, and vendor accountability. This analysis compares FTQ360's core capabilities against RossOS modules and identifies:

1. **Feature Parity Gaps** - Where RossOS needs enhancement
2. **Existing Strengths** - Where RossOS already matches or exceeds
3. **AI Differentiation Opportunities** - Where RossOS can surpass FTQ360 with AI

---

## FTQ360 Core Features

### 1. Checklist Inspections
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| 500+ Pre-built Templates | Industry-standard inspection templates | **GAP** - Module 28 has templates but no library |
| If/Then Branching Logic | Excel-like formulas (e.g., `=IF(checkpoint1="Fail",SHOW(checkpoint5))`) | **GAP** - Not in Module 28 spec |
| Dynamic Checkpoints | Checkpoints appear/hide based on conditions | **GAP** - Not in Module 28 spec |
| Approval Checkpoints | Require supervisor sign-off mid-checklist | **PARTIAL** - Module 28 has approval workflows |
| Measurement Capture | Numeric inputs with min/max validation | **GAP** - Not explicitly specified |
| Photo/Video Required | Force media attachment per checkpoint | **PARTIAL** - Module 28 has photo requirements |
| Pass/Fail/N-A Options | Standard rating system | **EXISTS** - Module 28 has this |
| %FTQ Scoring | First-time quality percentage calculation | **GAP** - Not in Module 28 spec |

### 2. Offline/Online Sync
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Smart Sync | Automatic background sync when connectivity available | **EXISTS** - Module 40 has robust offline-first architecture |
| Offline Photo Capture | Full resolution photos with metadata offline | **EXISTS** - Module 40 specifies this |
| Sync Queue Management | Prioritized sync when reconnecting | **EXISTS** - Module 40 has detailed sync engine |
| 7+ Day Offline Support | Extended offline operation | **EXISTS** - Module 40 specifies 7-day minimum |

### 3. Vendor Accountability
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Vendor %FTQ Score | Quality score per vendor from inspections | **GAP** - Module 22 has quality dimension but not FTQ-specific |
| Deficiency Attribution | Link defects to responsible vendor | **EXISTS** - Module 28 has vendor assignment |
| Vendor Dispute Resolution | Vendors can dispute deficiency assignment | **EXISTS** - Module 31 has dispute workflow |
| Vendor Ranking | Compare vendors by quality metrics | **EXISTS** - Module 22 has comprehensive scoring |
| Vendor Portal Access | Vendors see their scores and deficiencies | **EXISTS** - Module 30 Vendor Portal |

### 4. Punch List / Deficiency Management
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Photo Before/After | Issue, repair, verification photos | **EXISTS** - Module 28 has 3-stage photos |
| Priority Classification | Minor vs. Serious defects | **EXISTS** - Module 28 has priority levels |
| Location Tagging | Pin on floor plan | **EXISTS** - Module 28 has floor plan pins |
| Warranty Linkage | Flag items for warranty tracking | **EXISTS** - Module 28 links to Module 31 |
| Cost Tracking | Track repair costs per deficiency | **EXISTS** - Module 28 has cost tracking |

### 5. Daily Progress Reports
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Daily Reports | Field progress documentation | **EXISTS** - Module 8 Daily Logs (comprehensive) |
| Photo Documentation | Progress photos with tagging | **EXISTS** - Module 8 has rich photo support |
| Weather Integration | Auto-populated weather | **EXISTS** - Module 8 has weather API |
| Voice-to-Text | Dictation support | **EXISTS** - Module 8 has voice input |

### 6. Warranty Management
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Warranty Claims | Homeowner claim submission | **EXISTS** - Module 31 comprehensive |
| Vendor Callbacks | Track vendor warranty callbacks | **EXISTS** - Module 31 tracks callbacks |
| Scheduled Walkthroughs | 30-day, 11-month walkthroughs | **EXISTS** - Module 31 has walkthrough scheduling |
| Home Care Subscriptions | Ongoing maintenance programs | **EXISTS** - Module 31 has subscription management |

### 7. OCR / Document Intelligence
| FTQ360 Feature | Description | RossOS Status |
|----------------|-------------|---------------|
| Measurement Capture OCR | Scan measurements from field | **PARTIAL** - Module 8 Gap 1042 mentions it |
| Packing Slip Scanning | Match deliveries to POs | **EXISTS** - Module 8 Gap 1039 has this |
| Document Extraction | Extract data from documents | **EXISTS** - Module 24 AI Document Processing |

---

## Critical Gaps to Close

### GAP 1: If/Then Branching Logic in Checklists (HIGH PRIORITY)

**FTQ360 Capability:**
FTQ360 allows "Checkpoint Types" including:
- **If/Then Checkpoints**: Show/hide based on previous answers
- **Formula Support**: Excel-like conditions `=IF(A1="Fail", SHOW(B1))`
- **Dynamic Visibility**: Checkpoints appear in real-time based on conditions
- **Approval Gates**: Pause checklist until supervisor approves

**Current RossOS Status:**
Module 28 `quality_checklists` and `quality_checklist_items` tables have no branching fields.

**Required Enhancement:**

```sql
-- Add to quality_checklist_items table
ALTER TABLE quality_checklist_items ADD COLUMN (
  visibility_condition JSONB,        -- {"if": "item_123", "equals": "fail", "then": "show"}
  is_conditional BOOLEAN DEFAULT FALSE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_role VARCHAR(100),
  min_value DECIMAL,                 -- For measurement validation
  max_value DECIMAL,
  value_type ENUM('text', 'number', 'pass_fail', 'pass_fail_na', 'photo', 'signature', 'date')
);

-- New table for branching rules
CREATE TABLE checklist_branching_rules (
  id UUID PRIMARY KEY,
  checklist_template_id UUID REFERENCES quality_checklist_templates(id),
  trigger_item_id UUID REFERENCES quality_checklist_items(id),
  condition_operator ENUM('equals', 'not_equals', 'greater_than', 'less_than', 'contains'),
  condition_value TEXT,
  action_type ENUM('show', 'hide', 'require', 'skip', 'alert'),
  target_item_ids UUID[],
  created_at TIMESTAMPTZ
);
```

**UI Components Needed:**
- `<ConditionalChecklistItem />` - Renders based on visibility_condition
- `<BranchingRuleEditor />` - Visual editor for If/Then rules
- `<ApprovalGateCheckpoint />` - Pauses checklist for approval

**Implementation Location:** Module 28 - Punch List & Quality

---

### GAP 2: %FTQ (First-Time Quality) Scoring (HIGH PRIORITY)

**FTQ360 Capability:**
- Every checklist item can be marked as "FTQ Rated" or "Non-Rated"
- %FTQ = (FTQ Rated Items Passed on First Attempt) / (Total FTQ Rated Items) × 100
- Scores roll up to: vendor, trade, project, company levels
- Trends tracked over time for quality improvement

**Current RossOS Status:**
Module 28 tracks pass/fail but doesn't calculate first-time quality metrics.
Module 22 has quality scoring but not FTQ-specific.

**Required Enhancement:**

```sql
-- Add to quality_checklist_items
ALTER TABLE quality_checklist_items ADD COLUMN (
  is_ftq_rated BOOLEAN DEFAULT TRUE,  -- Whether this item counts toward FTQ
  first_attempt_result ENUM('pass', 'fail', 'na'),
  attempt_count INTEGER DEFAULT 0
);

-- New table for FTQ scoring
CREATE TABLE ftq_scores (
  id UUID PRIMARY KEY,
  builder_id UUID,
  entity_type ENUM('vendor', 'trade', 'project', 'company'),
  entity_id UUID,
  period_start DATE,
  period_end DATE,
  ftq_rated_items INTEGER,
  ftq_passed_first_attempt INTEGER,
  ftq_percentage DECIMAL(5,2),
  trend_direction ENUM('up', 'down', 'stable'),
  trend_delta DECIMAL(5,2),
  calculated_at TIMESTAMPTZ
);

-- Add FTQ tracking to vendors
ALTER TABLE vendors ADD COLUMN (
  ftq_score_current DECIMAL(5,2),
  ftq_score_rolling_6mo DECIMAL(5,2),
  ftq_trend ENUM('up', 'down', 'stable')
);
```

**API Endpoints:**
```
GET  /api/v2/quality/ftq-scores?entity_type=vendor&entity_id=xxx
GET  /api/v2/quality/ftq-scores/trends?period=6mo
GET  /api/v2/vendors/:id/ftq-history
```

**Implementation Location:** Module 28 + Module 22 integration

---

### GAP 3: Checklist Template Library (MEDIUM PRIORITY)

**FTQ360 Capability:**
- 500+ pre-built industry templates
- Categorized by trade, phase, building type
- Templates can be cloned and customized
- Community/marketplace for sharing templates

**Current RossOS Status:**
Module 28 has `quality_checklist_templates` but no pre-built library.
Module 48 Template Marketplace exists but not quality-focused.

**Required Enhancement:**

```sql
-- Extend quality_checklist_templates
ALTER TABLE quality_checklist_templates ADD COLUMN (
  is_system_template BOOLEAN DEFAULT FALSE,  -- Pre-built by RossOS
  source ENUM('system', 'builder', 'marketplace'),
  category VARCHAR(100),                      -- 'Framing', 'Electrical', 'HVAC', etc.
  phase VARCHAR(100),                         -- 'Rough', 'Final', 'Pre-Drywall'
  building_type VARCHAR(100),                 -- 'Residential', 'Commercial', 'Multi-Family'
  clone_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  is_published BOOLEAN DEFAULT FALSE
);
```

**Pre-Built Templates to Create (Priority):**

| Trade | Phase | Template Name |
|-------|-------|---------------|
| Foundation | Rough | Pre-Pour Foundation Checklist |
| Foundation | Final | Foundation Waterproofing |
| Framing | Rough | Framing Inspection Checklist |
| Framing | Pre-Drywall | Pre-Drywall Walkthrough |
| Electrical | Rough | Electrical Rough-In |
| Electrical | Final | Electrical Final |
| Plumbing | Rough | Plumbing Rough-In |
| Plumbing | Final | Plumbing Pressure Test |
| HVAC | Rough | HVAC Rough-In |
| HVAC | Final | HVAC Startup & Balance |
| Insulation | Pre-Drywall | Insulation Inspection |
| Drywall | Final | Drywall Quality Check |
| Exterior | Final | Exterior Envelope |
| Roofing | Final | Roofing Inspection |
| Finish | Final | Finish Carpentry |
| Paint | Final | Paint Quality |
| Flooring | Final | Flooring Installation |
| Cabinets | Final | Cabinet Installation |
| Countertops | Final | Countertop Installation |
| Appliances | Final | Appliance Installation |
| Final | Walkthrough | Pre-Closing Walkthrough |
| Final | Walkthrough | 30-Day Walkthrough |
| Final | Walkthrough | 11-Month Walkthrough |
| Safety | Daily | Daily Safety Checklist |
| Safety | Weekly | Weekly Safety Audit |

**Implementation Location:** Module 28 + Module 48

---

### GAP 4: Measurement Validation in Checklists (MEDIUM PRIORITY)

**FTQ360 Capability:**
- Numeric input fields with min/max validation
- Unit support (inches, feet, degrees, PSI, etc.)
- Auto-fail when measurement outside tolerance
- Historical measurement comparison

**Current RossOS Status:**
Module 28 checklist items are pass/fail, no numeric measurement support.

**Required Enhancement:**

```sql
-- Extend quality_checklist_items
ALTER TABLE quality_checklist_items ADD COLUMN (
  value_type ENUM('pass_fail', 'pass_fail_na', 'measurement', 'text', 'photo', 'signature', 'date', 'multi_select'),
  measurement_unit VARCHAR(50),       -- 'inches', 'PSI', 'degrees', etc.
  measurement_min DECIMAL(10,3),
  measurement_max DECIMAL(10,3),
  measurement_target DECIMAL(10,3),
  measurement_tolerance DECIMAL(10,3),
  auto_fail_outside_range BOOLEAN DEFAULT TRUE
);

-- Store actual measurements
ALTER TABLE quality_checklist_item_results ADD COLUMN (
  measurement_value DECIMAL(10,3),
  is_within_tolerance BOOLEAN
);
```

**Implementation Location:** Module 28

---

## AI Differentiation Opportunities

RossOS can surpass FTQ360 by adding AI capabilities they don't have:

### AI-1: Auto-Deficiency Detection from Photos (MAJOR DIFFERENTIATOR)

**Concept:** Use computer vision to automatically detect quality issues in photos.

**Implementation:**
```typescript
interface AIDeficiencyDetection {
  // Analyze inspection photo
  analyzePhoto(photo: Photo): Promise<{
    defects_detected: DefectDetection[];
    confidence: number;
    suggested_checklist_items: string[];
  }>;
}

interface DefectDetection {
  defect_type: 'crack' | 'gap' | 'misalignment' | 'stain' | 'damage' | 'incomplete';
  location_in_image: BoundingBox;
  severity: 'minor' | 'moderate' | 'serious';
  confidence: number;
  suggested_action: string;
}
```

**Use Cases:**
- Upload progress photo → AI flags potential issues before inspector arrives
- Punch list photo → AI categorizes defect type and severity
- Drywall photo → AI detects nail pops, cracks, unfinished areas
- Paint photo → AI detects drips, uneven coverage, touch-up needs

**Implementation Location:** Module 28 + Module 24 (AI Document Processing)

---

### AI-2: Predictive Quality Scoring (MAJOR DIFFERENTIATOR)

**Concept:** Predict quality outcomes before inspections happen.

**Implementation:**
```typescript
interface PredictiveQuality {
  // Predict FTQ score for upcoming inspection
  predictInspectionOutcome(params: {
    project_id: string;
    trade: string;
    vendor_id: string;
    phase: string;
  }): Promise<{
    predicted_ftq_score: number;
    risk_factors: RiskFactor[];
    recommended_pre_inspection_checks: string[];
    similar_past_inspections: Inspection[];
  }>;
}

interface RiskFactor {
  factor: string;  // "Vendor's FTQ for framing is 72% (below 85% threshold)"
  impact: 'high' | 'medium' | 'low';
  mitigation: string;  // "Schedule pre-inspection walkthrough with super"
}
```

**Use Cases:**
- Before scheduling inspection, see predicted outcome
- Identify which vendors likely to fail first-time
- Recommend pre-inspection actions to improve FTQ

**Implementation Location:** Module 28 + Module 25 (Schedule Intelligence)

---

### AI-3: Smart Checklist Generation (MAJOR DIFFERENTIATOR)

**Concept:** AI generates custom checklists based on project characteristics.

**Implementation:**
```typescript
interface SmartChecklistGenerator {
  generateChecklist(params: {
    project_type: string;
    phase: string;
    trade: string;
    building_codes: string[];  // Applicable code versions
    past_issues: DeficiencyPattern[];  // Common issues for this project/vendor
    weather_conditions?: WeatherData;
  }): Promise<{
    checklist_items: ChecklistItem[];
    conditional_items: ConditionalItem[];  // Show if relevant
    ai_added_items: AIAddedItem[];  // Items added based on past patterns
  }>;
}
```

**Use Cases:**
- Generate inspection checklist that includes items for known problem areas
- Add weather-specific checks (e.g., humidity checks before paint in summer)
- Include vendor-specific items based on their historical issues

**Implementation Location:** Module 28

---

### AI-4: Automated Daily Report Summarization (DIFFERENTIATOR)

**Concept:** AI summarizes daily logs into executive briefings.

**Implementation:**
```typescript
interface DailyLogAI {
  generateExecutiveSummary(params: {
    project_id: string;
    date_range: DateRange;
  }): Promise<{
    summary: string;
    key_progress: string[];
    concerns: Concern[];
    decisions_needed: Decision[];
    weather_impact_analysis: string;
  }>;
}
```

**Implementation Location:** Module 8 (already has AI features in preview)

---

### AI-5: Vendor Quality Prediction (DIFFERENTIATOR)

**Concept:** Predict which vendors will underperform before assigning them.

**Implementation:**
```typescript
interface VendorQualityPrediction {
  predictVendorPerformance(params: {
    vendor_id: string;
    project_id: string;
    scope: string;
  }): Promise<{
    predicted_ftq_score: number;
    predicted_callback_rate: number;
    risk_assessment: 'low' | 'medium' | 'high';
    factors: PredictionFactor[];
    alternative_vendors: Vendor[];
  }>;
}
```

**Implementation Location:** Module 22 (Vendor Performance)

---

### AI-6: Quality Trend Anomaly Detection (DIFFERENTIATOR)

**Concept:** Detect unusual quality patterns across projects.

**Implementation:**
```typescript
interface QualityAnomalyDetection {
  detectAnomalies(): Promise<{
    anomalies: Anomaly[];
  }>;
}

interface Anomaly {
  type: 'vendor_decline' | 'trade_issue' | 'project_problem' | 'material_defect';
  entity_id: string;
  description: string;  // "Framing FTQ dropped 15% across all projects this month"
  possible_causes: string[];
  recommended_actions: string[];
}
```

**Implementation Location:** Module 22 + Module 28

---

## Implementation Roadmap

### Phase 1: Foundation (Critical Gaps)
1. **If/Then Branching Logic** - Add conditional visibility to checklists
2. **%FTQ Scoring** - Implement first-time quality calculation
3. **Measurement Validation** - Add numeric input with tolerances

### Phase 2: Content (Template Library)
1. **System Templates** - Create 25+ pre-built templates
2. **Template Marketplace** - Enable template sharing between builders
3. **Template Categories** - Organize by trade, phase, building type

### Phase 3: AI Differentiation
1. **Photo Deficiency Detection** - Computer vision for quality issues
2. **Predictive Quality Scoring** - Forecast inspection outcomes
3. **Smart Checklist Generation** - AI-customized checklists
4. **Vendor Quality Prediction** - Predict vendor performance

### Phase 4: Polish
1. **FTQ Dashboard** - Company-wide quality metrics
2. **FTQ Benchmarking** - Compare against industry/platform averages
3. **Quality Improvement Workflows** - Guided improvement processes

---

## Module Integration Map

| FTQ360 Feature | Primary Module | Supporting Modules |
|----------------|----------------|-------------------|
| Checklist Inspections | Module 28 | Module 32 (Inspections) |
| If/Then Logic | Module 28 | - |
| %FTQ Scoring | Module 28 | Module 22 (Vendor Scoring) |
| Vendor Accountability | Module 22 | Module 28, Module 30 |
| Punch Lists | Module 28 | Module 31 (Warranty) |
| Daily Reports | Module 8 | Module 6 (Documents) |
| Offline Sync | Module 40 | All field modules |
| Photo Documentation | Module 6 | Module 28, Module 8 |
| OCR/Document AI | Module 24 | Module 8, Module 18 |
| Warranty Management | Module 31 | Module 28 |
| Safety Observations | Module 33 | Module 8 |
| Template Library | Module 48 | Module 28 |

---

## Skeleton Pages Requiring Updates

After implementing these features, update skeleton previews:

| Page | Updates Needed |
|------|----------------|
| `punch-list-preview.tsx` | Add FTQ score display, branching logic UI |
| `quality-checklists-preview.tsx` | Create new page for checklist management |
| `vendor-performance-preview.tsx` | Add FTQ scoring, quality prediction |
| `inspections-preview.tsx` | Add checklist integration, FTQ tracking |
| `daily-logs-preview.tsx` | Add AI summarization preview |
| `templates-preview.tsx` | Add quality checklist templates section |

---

## Competitive Advantages After Implementation

| Capability | FTQ360 | RossOS (After) |
|------------|--------|----------------|
| Checklist Templates | 500+ | 50+ (growing) |
| If/Then Logic | Yes | Yes |
| %FTQ Scoring | Yes | Yes |
| Offline Sync | Yes | Yes (more robust) |
| Vendor Accountability | Yes | Yes (more integrated) |
| AI Photo Analysis | No | **Yes** |
| Predictive Quality | No | **Yes** |
| Smart Checklists | No | **Yes** |
| Full Platform Integration | No (standalone) | **Yes** |
| Financial Integration | Limited | **Yes** |
| Schedule Integration | Limited | **Yes** |

---

## Conclusion

RossOS has strong foundations that already match FTQ360 in many areas:
- Offline-first architecture (Module 40) exceeds FTQ360
- Vendor performance scoring (Module 22) is more comprehensive
- Warranty management (Module 31) is feature-complete
- Daily logs (Module 8) are more sophisticated

**Critical gaps to close:**
1. If/Then branching logic in checklists
2. %FTQ (First-Time Quality) scoring
3. Pre-built checklist template library
4. Measurement validation in checklists

**AI differentiation opportunities:**
1. Auto-deficiency detection from photos
2. Predictive quality scoring
3. Smart checklist generation
4. Vendor quality prediction

By closing the gaps and adding AI capabilities, RossOS will not only match FTQ360 but significantly surpass it as a quality management platform integrated with the full construction workflow.
