# Feature: Sustainability & ESG Tracking

## Overview

As sustainability becomes a baseline requirement in construction, BuildDesk integrates tools to track carbon footprints, suggest low-carbon material alternatives, and generate ESG (Environmental, Social, and Governance) compliance reports for clients who want eco-friendly "green" homes.

---

## Business Value

- **Competitive Differentiator**: Builders offering sustainability tracking win eco-conscious clients
- **Regulatory Compliance**: Prepare for upcoming carbon reporting requirements
- **Cost Savings**: Identify energy-efficient alternatives that may reduce long-term costs
- **Client Demand**: Growing market for "green" homes with documented environmental impact
- **Certification Support**: Enable LEED, ENERGY STAR, and other green building certifications

---

## Database Schema

### Core Tables

```sql
-- Material carbon footprint data
CREATE TABLE material_carbon_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),

  -- Material identification
  material_category TEXT NOT NULL, -- 'concrete', 'steel', 'lumber', 'insulation', etc.
  material_type TEXT NOT NULL,     -- Specific type within category
  manufacturer TEXT,
  product_name TEXT,
  sku TEXT,

  -- Carbon metrics (kg CO2e per unit)
  carbon_per_unit DECIMAL(10,4) NOT NULL,
  unit TEXT NOT NULL, -- 'ton', 'cubic_yard', 'board_foot', 'sqft', etc.

  -- Lifecycle phases (Embodied Carbon Breakdown)
  a1_a3_production DECIMAL(10,4), -- Raw material extraction + manufacturing
  a4_transport DECIMAL(10,4),     -- Transport to site
  a5_construction DECIMAL(10,4),  -- Construction/installation
  b1_b7_use_phase DECIMAL(10,4),  -- Operational phase
  c1_c4_end_of_life DECIMAL(10,4), -- Demolition, disposal, recycling

  -- Certifications
  epd_available BOOLEAN DEFAULT false, -- Environmental Product Declaration
  epd_document_url TEXT,
  certifications JSONB DEFAULT '[]', -- ['FSC', 'Cradle to Cradle', 'GREENGUARD']

  -- Source
  data_source TEXT, -- 'manufacturer', 'epa', 'industry_average', 'user_entered'
  source_url TEXT,
  last_verified DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job carbon tracking
CREATE TABLE job_carbon_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Target and baseline
  target_carbon_intensity DECIMAL(10,2), -- kg CO2e per sqft
  baseline_carbon_estimate DECIMAL(14,2), -- Total estimated kg CO2e
  certification_goal TEXT, -- 'LEED Silver', 'ENERGY STAR', 'Net Zero Ready'

  -- Actual tracking
  actual_carbon_to_date DECIMAL(14,2) DEFAULT 0,
  last_calculated TIMESTAMPTZ,

  -- Reporting period
  reporting_start_date DATE,
  reporting_end_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carbon entries per material usage
CREATE TABLE carbon_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  job_carbon_tracking_id UUID REFERENCES job_carbon_tracking(id),

  -- Source reference
  source_type TEXT NOT NULL CHECK (source_type IN (
    'purchase_order', 'invoice', 'manual_entry', 'estimate'
  )),
  source_id UUID, -- Reference to PO, invoice, etc.

  -- Material details
  material_carbon_data_id UUID REFERENCES material_carbon_data(id),
  material_description TEXT NOT NULL,
  cost_code_id UUID REFERENCES cost_codes(id),

  -- Quantity and carbon
  quantity DECIMAL(14,4) NOT NULL,
  unit TEXT NOT NULL,
  carbon_per_unit DECIMAL(10,4) NOT NULL,
  total_carbon_kg DECIMAL(14,2) GENERATED ALWAYS AS (quantity * carbon_per_unit) STORED,

  -- Alternative analysis
  has_lower_carbon_alternative BOOLEAN DEFAULT false,
  alternative_material_id UUID REFERENCES material_carbon_data(id),
  potential_carbon_savings DECIMAL(14,2),

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES employees(id),
  verified_at TIMESTAMPTZ,

  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Low-carbon alternatives database
CREATE TABLE carbon_alternatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Standard material
  standard_material_id UUID NOT NULL REFERENCES material_carbon_data(id),

  -- Alternative material
  alternative_material_id UUID NOT NULL REFERENCES material_carbon_data(id),

  -- Comparison
  carbon_reduction_pct DECIMAL(5,2), -- % reduction vs standard
  cost_premium_pct DECIMAL(5,2),     -- % cost increase (can be negative for savings)

  -- Compatibility
  is_functionally_equivalent BOOLEAN DEFAULT true,
  performance_notes TEXT,
  availability_notes TEXT,

  -- Recommendation strength
  recommendation_score INT CHECK (recommendation_score BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Green building certifications
CREATE TABLE green_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Certification details
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'LEED', 'ENERGY_STAR', 'NGBS', 'PHIUS', 'WELL',
    'LIVING_BUILDING', 'NET_ZERO', 'ZERH', 'PEARL', 'OTHER'
  )),
  certification_level TEXT, -- 'Certified', 'Silver', 'Gold', 'Platinum'
  target_level TEXT,

  -- Status
  status TEXT DEFAULT 'planning' CHECK (status IN (
    'planning', 'registered', 'in_progress', 'submitted', 'certified', 'expired'
  )),

  -- Tracking
  registration_date DATE,
  submission_date DATE,
  certification_date DATE,
  expiration_date DATE,
  certificate_number TEXT,
  certificate_document_url TEXT,

  -- Points/credits tracking (for LEED-style)
  total_points_possible INT,
  points_targeted INT,
  points_achieved INT,

  -- Verifier
  verifier_name TEXT,
  verifier_company TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certification credit tracking (for LEED-style point systems)
CREATE TABLE certification_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  green_certification_id UUID NOT NULL REFERENCES green_certifications(id),

  -- Credit details
  credit_category TEXT NOT NULL, -- 'Sustainable Sites', 'Water Efficiency', etc.
  credit_code TEXT NOT NULL,     -- 'SS Credit 1', 'WE Prerequisite 1'
  credit_name TEXT NOT NULL,

  -- Points
  points_possible INT NOT NULL,
  points_targeted INT,
  points_achieved INT,

  -- Status
  status TEXT DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'documentation_ready', 'submitted', 'achieved', 'not_pursued'
  )),

  -- Documentation
  documentation_notes TEXT,
  documentation_files JSONB DEFAULT '[]',

  responsible_party_id UUID REFERENCES employees(id),
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESG report snapshots
CREATE TABLE esg_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id), -- NULL for company-wide reports

  -- Report details
  report_type TEXT NOT NULL CHECK (report_type IN (
    'project_summary', 'annual_company', 'client_deliverable', 'certification_submission'
  )),
  report_period_start DATE,
  report_period_end DATE,

  -- Metrics snapshot
  total_carbon_kg DECIMAL(16,2),
  carbon_per_sqft DECIMAL(10,4),
  carbon_vs_baseline_pct DECIMAL(5,2),
  recycled_content_pct DECIMAL(5,2),
  local_materials_pct DECIMAL(5,2),
  waste_diverted_pct DECIMAL(5,2),
  renewable_energy_pct DECIMAL(5,2),
  water_efficiency_pct DECIMAL(5,2),

  -- Generated content
  report_content JSONB, -- Full report data
  executive_summary TEXT,
  ai_generated_narrative TEXT,

  -- Document
  report_document_url TEXT,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES employees(id)
);

-- Renewable energy tracking
CREATE TABLE renewable_energy_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- System details
  system_type TEXT NOT NULL CHECK (system_type IN (
    'solar_pv', 'solar_thermal', 'geothermal', 'wind', 'battery_storage', 'ev_charging'
  )),
  system_description TEXT,

  -- Capacity
  capacity_kw DECIMAL(10,2),
  estimated_annual_kwh DECIMAL(14,2),
  estimated_offset_pct DECIMAL(5,2), -- % of home energy offset

  -- Installation
  installer_vendor_id UUID REFERENCES vendors(id),
  installation_date DATE,
  commissioning_date DATE,

  -- Incentives
  federal_tax_credit DECIMAL(12,2),
  state_incentives DECIMAL(12,2),
  utility_rebates DECIMAL(12,2),

  -- Documentation
  permit_number TEXT,
  inspection_passed BOOLEAN,
  interconnection_approved BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Construction waste tracking
CREATE TABLE waste_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Waste entry
  waste_date DATE NOT NULL DEFAULT CURRENT_DATE,
  waste_type TEXT NOT NULL CHECK (waste_type IN (
    'wood', 'concrete', 'metal', 'drywall', 'cardboard', 'plastic',
    'mixed_construction', 'hazardous', 'land_clearing', 'other'
  )),

  -- Quantity
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('tons', 'cubic_yards', 'loads')),

  -- Disposition
  disposition TEXT NOT NULL CHECK (disposition IN (
    'landfill', 'recycled', 'reused_onsite', 'reused_offsite', 'donated', 'composted'
  )),

  -- Hauler
  hauler_vendor_id UUID REFERENCES vendors(id),
  hauler_name TEXT,
  manifest_number TEXT,

  -- Cost
  disposal_cost DECIMAL(10,2),
  recycling_rebate DECIMAL(10,2),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Views

```sql
-- Job carbon summary
CREATE VIEW job_carbon_summary AS
SELECT
  j.id AS job_id,
  j.name AS job_name,
  j.square_footage,
  jct.target_carbon_intensity,
  jct.baseline_carbon_estimate,
  jct.certification_goal,

  -- Calculated totals
  COALESCE(SUM(ce.total_carbon_kg), 0) AS total_carbon_kg,
  CASE
    WHEN j.square_footage > 0
    THEN ROUND(COALESCE(SUM(ce.total_carbon_kg), 0) / j.square_footage, 2)
    ELSE 0
  END AS carbon_per_sqft,

  -- Comparison to target
  CASE
    WHEN jct.target_carbon_intensity > 0 AND j.square_footage > 0
    THEN ROUND(((COALESCE(SUM(ce.total_carbon_kg), 0) / j.square_footage) / jct.target_carbon_intensity) * 100, 1)
    ELSE NULL
  END AS pct_of_target,

  -- Alternative savings potential
  COALESCE(SUM(ce.potential_carbon_savings), 0) AS potential_savings_kg,

  -- Waste diversion
  wt.total_waste_tons,
  wt.diverted_tons,
  CASE
    WHEN wt.total_waste_tons > 0
    THEN ROUND((wt.diverted_tons / wt.total_waste_tons) * 100, 1)
    ELSE 0
  END AS waste_diversion_pct

FROM jobs j
LEFT JOIN job_carbon_tracking jct ON j.id = jct.job_id
LEFT JOIN carbon_entries ce ON j.id = ce.job_id
LEFT JOIN (
  SELECT
    job_id,
    SUM(CASE WHEN unit = 'tons' THEN quantity ELSE quantity * 0.5 END) AS total_waste_tons,
    SUM(CASE
      WHEN disposition IN ('recycled', 'reused_onsite', 'reused_offsite', 'donated', 'composted')
      THEN CASE WHEN unit = 'tons' THEN quantity ELSE quantity * 0.5 END
      ELSE 0
    END) AS diverted_tons
  FROM waste_tracking
  GROUP BY job_id
) wt ON j.id = wt.job_id
GROUP BY j.id, j.name, j.square_footage, jct.target_carbon_intensity,
         jct.baseline_carbon_estimate, jct.certification_goal,
         wt.total_waste_tons, wt.diverted_tons;
```

---

## AI Integration

### 1. Low-Carbon Material Suggestions
When a PO or invoice is entered, AI analyzes the materials and suggests lower-carbon alternatives:

```typescript
interface CarbonAlternativeSuggestion {
  originalMaterial: string;
  originalCarbon: number; // kg CO2e
  alternativeMaterial: string;
  alternativeCarbon: number;
  savingsKg: number;
  savingsPct: number;
  costImpact: 'lower' | 'similar' | 'higher';
  costDelta: number;
  availability: 'readily_available' | 'special_order' | 'limited';
  recommendation: string; // AI-generated explanation
}
```

### 2. Automated EPD Lookup
When materials are entered, AI searches manufacturer databases for Environmental Product Declarations (EPDs) and auto-populates carbon data.

### 3. ESG Report Generation
AI generates client-ready sustainability reports with:
- Executive summary
- Carbon footprint analysis with visualizations
- Comparison to industry benchmarks
- Certification progress
- Recommendations for improvement

### 4. Waste Optimization
AI analyzes waste patterns and suggests:
- Material ordering optimization to reduce waste
- Recycling opportunities
- Reuse strategies for common materials

---

## UI Components

### 1. Sustainability Dashboard
- Carbon tracker with progress toward goal
- Waste diversion rate
- Certification status
- Material alternatives pending review
- Monthly carbon trend chart

### 2. Material Carbon Lookup
- Search materials by name/category
- View carbon footprint per unit
- Compare alternatives side-by-side
- Link to EPD documents

### 3. Green Certification Tracker
- Credit checklist with progress
- Documentation upload
- Deadline tracking
- Verifier communication

### 4. ESG Report Builder
- Select report type and period
- AI generates narrative
- Customize charts and metrics
- Export as PDF or share link

---

## Integration Points

### Core Integrations
1. **Purchase Orders** → Auto-calculate carbon on material POs
2. **Invoices** → Verify actual materials match estimates
3. **Client Portal** → Share sustainability metrics with clients
4. **Reporting** → Include carbon in job profitability reports

### Estimating Integration (Module 20)
5. **Carbon Per Line Item** → Each estimate line shows kg CO2e based on material quantities
6. **Project Carbon Summary** → Total carbon footprint and kg CO2e/sqft displayed in estimate header
7. **Green Alternative Suggestions** → AI suggests lower-carbon materials during estimating
8. **Eco-Conscious Estimate Mode** → "Green Build" toggle prioritizes low-carbon materials
9. **Carbon-Cost Tradeoff Analysis** → Interactive chart showing cost vs. carbon reduction options
10. **Sustainability Section in Proposals** → Client-facing estimates include optional eco summary

### Selection Management Integration (Module 21)
11. **Eco Badges on Options** → Selection options display sustainability badges (Low Carbon, Recycled, Local, Certified)
12. **Carbon Footprint Display** → Optional kg CO2e shown per selection option
13. **Green Comparison Mode** → Filter/sort selections by eco-rating
14. **Green Alternative Suggestions** → AI suggests lower-carbon alternatives when standard materials selected
15. **Cumulative Carbon Impact** → Dashboard shows total carbon footprint of all confirmed selections
16. **Client Eco Preferences** → Clients can set sustainability preference level (Standard, Eco-Conscious, Green Priority)
17. **ESG Selection Summary** → Export includes sustainability metrics for all selections

---

## Implementation Priority

| Phase | Features |
|-------|----------|
| **Phase 1** | Material carbon database, basic tracking per job |
| **Phase 2** | Waste tracking, AI alternative suggestions |
| **Phase 3** | Green certification support (LEED, ENERGY STAR) |
| **Phase 4** | ESG report generation, client portal integration |

---

## New Database Tables Summary

| Table | Purpose |
|-------|---------|
| `material_carbon_data` | Carbon footprint data per material |
| `job_carbon_tracking` | Job-level carbon targets and actuals |
| `carbon_entries` | Individual carbon entries from POs/invoices |
| `carbon_alternatives` | Low-carbon alternative mappings |
| `green_certifications` | Certification tracking per job |
| `certification_credits` | Point/credit tracking for LEED-style |
| `esg_reports` | Generated sustainability reports |
| `renewable_energy_tracking` | Solar, geothermal, etc. systems |
| `waste_tracking` | Construction waste and diversion |
| **Total** | **9 tables** |

---

---

## Module Integration Summary

| Module | Integration | Documentation |
|--------|-------------|---------------|
| Module 20: Estimating Engine | Carbon per line item, green alternatives, eco-mode | `3-modules/20-estimating-engine.md` §14 |
| Module 21: Selection Management | Eco badges, carbon display, green preferences | `3-modules/21-selection-management.md` §11 |
| Module 10: Purchase Orders | Auto-calculate carbon on material POs | Planned |
| Module 13: Invoices | Verify actual materials match estimates | Planned |
| Module 12: Client Portal | Share sustainability metrics | Planned |

---

*Feature added: February 2026*
*Addresses Gap: Decarbonization & Green Building (from AI capabilities request)*
*Updated: February 2026 — Added Selections & Estimating integration*
