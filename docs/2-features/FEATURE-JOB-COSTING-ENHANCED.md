# Feature: Enhanced Job Costing & Overhead Allocation

## Overview

This feature enhances BuildDesk's job costing capabilities to align with construction industry best practices, including proper overhead allocation, labor burden calculations, and real-time profitability tracking tied to gross profit metrics.

---

## 1. Overhead Allocation System

### Industry Standard
Construction companies must allocate overhead costs to jobs for accurate profitability analysis. Common allocation bases include:
- **Labor Hours**: Most common (40-50% of companies)
- **Direct Costs**: Second most common
- **Revenue**: Used by some, but can distort job profitability
- **Square Footage**: For similar project types

### Database Schema

```sql
-- Overhead categories and rates
CREATE TABLE overhead_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  allocation_method TEXT NOT NULL CHECK (allocation_method IN (
    'labor_hours', 'direct_labor_cost', 'total_direct_cost',
    'revenue', 'square_footage', 'equipment_hours', 'manual'
  )),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly/yearly overhead budgets
CREATE TABLE overhead_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  category_id UUID NOT NULL REFERENCES overhead_categories(id),
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  budgeted_amount DECIMAL(14,2) NOT NULL,
  actual_amount DECIMAL(14,2) DEFAULT 0,
  variance_amount DECIMAL(14,2) GENERATED ALWAYS AS (actual_amount - budgeted_amount) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, category_id, period_start)
);

-- Overhead allocation rates (recalculated periodically)
CREATE TABLE overhead_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  category_id UUID NOT NULL REFERENCES overhead_categories(id),
  effective_date DATE NOT NULL,
  rate_per_unit DECIMAL(10,4) NOT NULL, -- e.g., $45.50 per labor hour
  unit_type TEXT NOT NULL, -- 'hour', 'dollar', 'sqft', etc.
  calculation_basis_amount DECIMAL(14,2), -- Total overhead for period
  calculation_basis_units DECIMAL(14,2), -- Total units for period
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, category_id, effective_date)
);

-- Job-level overhead allocations
CREATE TABLE job_overhead_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  category_id UUID NOT NULL REFERENCES overhead_categories(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  allocation_basis_value DECIMAL(14,2) NOT NULL, -- Labor hours, direct cost, etc.
  rate_applied DECIMAL(10,4) NOT NULL,
  allocated_amount DECIMAL(14,2) NOT NULL,
  is_finalized BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overhead line items for detailed tracking
CREATE TABLE overhead_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  category_id UUID NOT NULL REFERENCES overhead_categories(id),
  description TEXT NOT NULL,
  vendor TEXT,
  amount DECIMAL(14,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
  receipt_url TEXT,
  gl_account TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Common overhead expense types (seed data reference)
COMMENT ON TABLE overhead_categories IS 'Common categories:
  - Office Rent & Utilities
  - Administrative Salaries
  - Insurance (GL, WC, Auto, Umbrella)
  - Equipment Depreciation
  - Vehicle Expenses (non-job specific)
  - Professional Services (Legal, Accounting)
  - Software & Technology
  - Marketing & Business Development
  - Training & Certifications
  - Safety Programs
  - Small Tools & Supplies';
```

### Overhead Allocation Views

```sql
-- Real-time job overhead summary
CREATE VIEW job_overhead_summary AS
SELECT
  j.id AS job_id,
  j.name AS job_name,
  j.contract_amount,
  COALESCE(SUM(joa.allocated_amount), 0) AS total_overhead_allocated,
  COALESCE(dc.total_direct_costs, 0) AS total_direct_costs,
  COALESCE(dc.total_direct_costs, 0) + COALESCE(SUM(joa.allocated_amount), 0) AS total_job_cost,
  j.contract_amount - (COALESCE(dc.total_direct_costs, 0) + COALESCE(SUM(joa.allocated_amount), 0)) AS gross_profit,
  CASE
    WHEN j.contract_amount > 0
    THEN ROUND(((j.contract_amount - (COALESCE(dc.total_direct_costs, 0) + COALESCE(SUM(joa.allocated_amount), 0))) / j.contract_amount) * 100, 2)
    ELSE 0
  END AS gross_profit_margin_pct
FROM jobs j
LEFT JOIN job_overhead_allocations joa ON j.id = joa.job_id
LEFT JOIN (
  SELECT job_id, SUM(amount) AS total_direct_costs
  FROM job_costs
  GROUP BY job_id
) dc ON j.id = dc.job_id
GROUP BY j.id, j.name, j.contract_amount, dc.total_direct_costs;
```

---

## 2. Labor Burden System

### Industry Standard
Labor burden includes all costs beyond base wages:
- **FICA (Social Security & Medicare)**: 7.65%
- **FUTA (Federal Unemployment)**: 0.6% on first $7,000
- **SUTA (State Unemployment)**: Varies by state (0.5% - 5.4%)
- **Workers' Compensation**: Varies by trade (1% - 30%+)
- **Health Insurance**: Per employee or % of wages
- **401(k) Match**: Company contribution
- **Paid Time Off**: Accrued value
- **Training & Safety**: Allocated per hour

**Typical Range**: 40-70% of base wages

### Database Schema

```sql
-- Labor burden rate components
CREATE TABLE labor_burden_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  burden_type TEXT NOT NULL CHECK (burden_type IN (
    'fica', 'futa', 'suta', 'workers_comp', 'health_insurance',
    'retirement_match', 'pto_accrual', 'training', 'union_benefits', 'other'
  )),
  calculation_method TEXT NOT NULL CHECK (calculation_method IN (
    'percentage_of_gross', 'fixed_per_hour', 'fixed_per_employee_month',
    'percentage_capped', 'tiered'
  )),
  rate_value DECIMAL(10,4) NOT NULL, -- Either percentage or fixed amount
  cap_amount DECIMAL(14,2), -- For capped calculations (e.g., FUTA $7k)
  cap_period TEXT CHECK (cap_period IN ('annual', 'quarterly', 'monthly')),
  applies_to_overtime BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trade-specific workers' comp rates
CREATE TABLE workers_comp_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  state_code TEXT NOT NULL,
  class_code TEXT NOT NULL, -- NCCI class code
  trade_description TEXT NOT NULL,
  rate_per_100 DECIMAL(8,4) NOT NULL, -- Rate per $100 of payroll
  experience_mod DECIMAL(6,4) DEFAULT 1.0000, -- Company's EMR
  effective_rate DECIMAL(8,4) GENERATED ALWAYS AS (rate_per_100 * experience_mod) STORED,
  effective_date DATE NOT NULL,
  expiration_date DATE,
  policy_number TEXT,
  carrier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee-specific burden overrides
CREATE TABLE employee_burden_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  component_id UUID REFERENCES labor_burden_components(id),
  workers_comp_class_code TEXT,
  health_insurance_tier TEXT CHECK (health_insurance_tier IN (
    'waived', 'employee_only', 'employee_spouse', 'employee_children', 'family'
  )),
  retirement_contribution_pct DECIMAL(5,2),
  pto_hours_per_year DECIMAL(6,2),
  union_code TEXT,
  effective_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculated fully-burdened labor rates
CREATE TABLE burdened_labor_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  effective_date DATE NOT NULL,
  base_hourly_rate DECIMAL(10,4) NOT NULL,
  burden_components JSONB NOT NULL DEFAULT '[]',
  -- Example: [{"type": "fica", "amount": 3.82}, {"type": "workers_comp", "amount": 5.25}]
  total_burden_amount DECIMAL(10,4) NOT NULL,
  total_burden_pct DECIMAL(8,4) NOT NULL,
  fully_burdened_rate DECIMAL(10,4) NOT NULL,
  is_current BOOLEAN DEFAULT true,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for current rates lookup
CREATE INDEX idx_burdened_rates_current ON burdened_labor_rates(employee_id, is_current) WHERE is_current = true;
```

### Labor Burden Calculation Function

```sql
-- Function to calculate fully burdened rate for an employee
CREATE OR REPLACE FUNCTION calculate_burdened_rate(
  p_employee_id UUID,
  p_base_rate DECIMAL,
  p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  component_name TEXT,
  component_type TEXT,
  burden_amount DECIMAL,
  burden_pct DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH employee_info AS (
    SELECT
      e.id,
      e.company_id,
      COALESCE(ebo.workers_comp_class_code, e.default_trade_code) AS wc_class,
      COALESCE(ebo.health_insurance_tier, 'employee_only') AS health_tier,
      e.state_code
    FROM employees e
    LEFT JOIN employee_burden_overrides ebo ON e.id = ebo.employee_id
      AND p_as_of_date BETWEEN ebo.effective_date AND COALESCE(ebo.end_date, '9999-12-31')
    WHERE e.id = p_employee_id
  )
  SELECT
    lbc.name,
    lbc.burden_type,
    CASE lbc.calculation_method
      WHEN 'percentage_of_gross' THEN ROUND(p_base_rate * lbc.rate_value / 100, 4)
      WHEN 'fixed_per_hour' THEN lbc.rate_value
      WHEN 'percentage_capped' THEN ROUND(LEAST(p_base_rate * lbc.rate_value / 100, lbc.cap_amount / 2080), 4)
      ELSE lbc.rate_value
    END AS burden_amount,
    CASE lbc.calculation_method
      WHEN 'percentage_of_gross' THEN lbc.rate_value
      WHEN 'fixed_per_hour' THEN ROUND((lbc.rate_value / p_base_rate) * 100, 2)
      ELSE 0
    END AS burden_pct
  FROM labor_burden_components lbc
  CROSS JOIN employee_info ei
  WHERE lbc.company_id = ei.company_id
    AND lbc.is_active = true
    AND p_as_of_date >= lbc.effective_date
    AND (lbc.end_date IS NULL OR p_as_of_date <= lbc.end_date);
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Bonus System (Gross Profit Based)

### Industry Standard
Construction bonuses should be tied to **Gross Profit**, not Net Revenue or Net Profit:
- **Gross Profit** = Revenue - Direct Costs - Allocated Overhead
- Avoids rewarding low-margin high-volume jobs
- Aligns employee incentives with company profitability
- Provides real-time visibility for motivation

### Database Schema

```sql
-- Bonus programs
CREATE TABLE bonus_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  description TEXT,
  bonus_type TEXT NOT NULL CHECK (bonus_type IN (
    'job_completion', 'gross_profit_share', 'performance_threshold',
    'safety_bonus', 'efficiency_bonus', 'retention_bonus'
  )),
  calculation_method TEXT NOT NULL CHECK (calculation_method IN (
    'percentage_of_gross_profit',
    'percentage_of_profit_above_target',
    'fixed_amount_per_milestone',
    'tiered_percentage',
    'pool_distribution'
  )),
  base_rate DECIMAL(8,4), -- Base percentage or fixed amount
  target_margin_pct DECIMAL(5,2), -- e.g., 25% target margin
  minimum_margin_pct DECIMAL(5,2), -- e.g., 15% minimum to qualify
  cap_amount DECIMAL(14,2), -- Maximum bonus per job/period
  eligible_roles JSONB DEFAULT '[]', -- ["project_manager", "superintendent", "foreman"]
  requires_job_completion BOOLEAN DEFAULT true,
  requires_positive_margin BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  effective_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bonus tiers for tiered programs
CREATE TABLE bonus_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES bonus_programs(id),
  tier_order INT NOT NULL,
  margin_floor_pct DECIMAL(5,2) NOT NULL, -- e.g., 20%
  margin_ceiling_pct DECIMAL(5,2), -- e.g., 25%, NULL for unlimited
  bonus_rate_pct DECIMAL(8,4) NOT NULL, -- e.g., 10% of GP in this tier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(program_id, tier_order)
);

-- Example tier structure:
-- Tier 1: 15-20% margin = 5% of GP
-- Tier 2: 20-25% margin = 10% of GP
-- Tier 3: 25-30% margin = 15% of GP
-- Tier 4: 30%+ margin = 20% of GP

-- Employee bonus assignments
CREATE TABLE employee_bonus_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  program_id UUID NOT NULL REFERENCES bonus_programs(id),
  job_id UUID REFERENCES jobs(id), -- NULL for company-wide programs
  allocation_pct DECIMAL(5,2) NOT NULL DEFAULT 100, -- Share of bonus pool
  role_in_job TEXT, -- 'project_manager', 'superintendent', etc.
  effective_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calculated and paid bonuses
CREATE TABLE bonus_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  program_id UUID NOT NULL REFERENCES bonus_programs(id),
  job_id UUID REFERENCES jobs(id),
  calculation_period_start DATE NOT NULL,
  calculation_period_end DATE NOT NULL,

  -- Financial basis
  job_revenue DECIMAL(14,2),
  job_direct_costs DECIMAL(14,2),
  job_overhead_allocated DECIMAL(14,2),
  job_gross_profit DECIMAL(14,2),
  job_gross_margin_pct DECIMAL(5,2),

  -- Bonus calculation
  employee_allocation_pct DECIMAL(5,2),
  applicable_tier INT,
  tier_rate_pct DECIMAL(8,4),
  calculated_bonus DECIMAL(14,2) NOT NULL,
  adjustment_amount DECIMAL(14,2) DEFAULT 0,
  adjustment_reason TEXT,
  final_bonus DECIMAL(14,2) NOT NULL,

  -- Status
  status TEXT DEFAULT 'calculated' CHECK (status IN (
    'calculated', 'pending_approval', 'approved', 'paid', 'reversed'
  )),
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  paid_date DATE,
  payroll_reference TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time bonus projection view
CREATE VIEW employee_bonus_projections AS
SELECT
  eba.employee_id,
  e.name AS employee_name,
  eba.job_id,
  j.name AS job_name,
  j.contract_amount AS job_revenue,
  COALESCE(jc.total_costs, 0) AS direct_costs,
  COALESCE(jo.allocated_overhead, 0) AS overhead,
  j.contract_amount - COALESCE(jc.total_costs, 0) - COALESCE(jo.allocated_overhead, 0) AS current_gross_profit,
  ROUND(((j.contract_amount - COALESCE(jc.total_costs, 0) - COALESCE(jo.allocated_overhead, 0)) / NULLIF(j.contract_amount, 0)) * 100, 2) AS current_margin_pct,
  bp.name AS bonus_program,
  bp.base_rate,
  bp.target_margin_pct,
  eba.allocation_pct,
  -- Projected bonus calculation
  ROUND(
    GREATEST(0, j.contract_amount - COALESCE(jc.total_costs, 0) - COALESCE(jo.allocated_overhead, 0))
    * (bp.base_rate / 100)
    * (eba.allocation_pct / 100),
    2
  ) AS projected_bonus
FROM employee_bonus_assignments eba
JOIN employees e ON eba.employee_id = e.id
JOIN bonus_programs bp ON eba.program_id = bp.id
LEFT JOIN jobs j ON eba.job_id = j.id
LEFT JOIN (
  SELECT job_id, SUM(amount) AS total_costs FROM job_costs GROUP BY job_id
) jc ON j.id = jc.job_id
LEFT JOIN (
  SELECT job_id, SUM(allocated_amount) AS allocated_overhead FROM job_overhead_allocations GROUP BY job_id
) jo ON j.id = jo.job_id
WHERE eba.end_date IS NULL OR eba.end_date >= CURRENT_DATE;
```

---

## 4. Cost Code System Enhancement

### Database Schema

```sql
-- Enhanced cost code structure (CSI MasterFormat based)
CREATE TABLE cost_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  code TEXT NOT NULL, -- e.g., "03.30.00" for Cast-in-Place Concrete
  description TEXT NOT NULL,
  division TEXT NOT NULL, -- CSI Division number
  subdivision TEXT,
  detail_level INT DEFAULT 1, -- 1=Division, 2=Subdivision, 3=Detail
  parent_code_id UUID REFERENCES cost_codes(id),

  -- Budget/estimate defaults
  default_unit TEXT, -- 'SF', 'LF', 'CY', 'EA', 'HR', etc.
  default_unit_cost DECIMAL(10,4),
  default_labor_hours_per_unit DECIMAL(8,4),
  default_material_pct DECIMAL(5,2),
  default_labor_pct DECIMAL(5,2),
  default_equipment_pct DECIMAL(5,2),
  default_sub_pct DECIMAL(5,2),

  is_active BOOLEAN DEFAULT true,
  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job-specific cost code budgets
CREATE TABLE job_cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id),

  -- Quantities
  estimated_quantity DECIMAL(14,4),
  unit TEXT,

  -- Budget by type
  labor_budget DECIMAL(14,2) DEFAULT 0,
  material_budget DECIMAL(14,2) DEFAULT 0,
  equipment_budget DECIMAL(14,2) DEFAULT 0,
  subcontractor_budget DECIMAL(14,2) DEFAULT 0,
  other_budget DECIMAL(14,2) DEFAULT 0,
  total_budget DECIMAL(14,2) GENERATED ALWAYS AS (
    labor_budget + material_budget + equipment_budget + subcontractor_budget + other_budget
  ) STORED,

  -- Labor hours
  estimated_labor_hours DECIMAL(10,2),

  -- Actuals (updated via triggers)
  actual_labor DECIMAL(14,2) DEFAULT 0,
  actual_material DECIMAL(14,2) DEFAULT 0,
  actual_equipment DECIMAL(14,2) DEFAULT 0,
  actual_subcontractor DECIMAL(14,2) DEFAULT 0,
  actual_other DECIMAL(14,2) DEFAULT 0,
  actual_total DECIMAL(14,2) GENERATED ALWAYS AS (
    actual_labor + actual_material + actual_equipment + actual_subcontractor + actual_other
  ) STORED,
  actual_labor_hours DECIMAL(10,2) DEFAULT 0,

  -- Variances (computed)
  variance DECIMAL(14,2) GENERATED ALWAYS AS (
    (labor_budget + material_budget + equipment_budget + subcontractor_budget + other_budget) -
    (actual_labor + actual_material + actual_equipment + actual_subcontractor + actual_other)
  ) STORED,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, cost_code_id)
);

-- Productivity tracking
CREATE TABLE productivity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id),
  work_date DATE NOT NULL,

  -- Production
  quantity_installed DECIMAL(14,4) NOT NULL,
  unit TEXT NOT NULL,

  -- Labor
  labor_hours DECIMAL(8,2) NOT NULL,
  crew_size INT,

  -- Calculated productivity
  units_per_hour DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN labor_hours > 0 THEN quantity_installed / labor_hours ELSE 0 END
  ) STORED,
  hours_per_unit DECIMAL(10,4) GENERATED ALWAYS AS (
    CASE WHEN quantity_installed > 0 THEN labor_hours / quantity_installed ELSE 0 END
  ) STORED,

  -- Weather/conditions affecting productivity
  weather_condition TEXT,
  site_conditions TEXT,
  notes TEXT,

  recorded_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Productivity benchmarks
CREATE TABLE productivity_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  cost_code_id UUID NOT NULL REFERENCES cost_codes(id),

  source TEXT CHECK (source IN ('company_historical', 'industry_standard', 'estimating_guide')),

  -- Benchmark values
  benchmark_units_per_hour DECIMAL(10,4),
  benchmark_hours_per_unit DECIMAL(10,4),
  unit TEXT NOT NULL,

  -- Conditions
  difficulty_factor TEXT CHECK (difficulty_factor IN ('easy', 'average', 'difficult')),
  crew_composition TEXT,
  notes TEXT,

  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Work-in-Progress (WIP) Reporting

### Database Schema

```sql
-- WIP schedule snapshots
CREATE TABLE wip_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  snapshot_date DATE NOT NULL,
  snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('monthly', 'quarterly', 'annual', 'ad_hoc')),

  -- Aggregate metrics
  total_contract_value DECIMAL(16,2),
  total_costs_to_date DECIMAL(16,2),
  total_billings_to_date DECIMAL(16,2),
  total_estimated_profit DECIMAL(16,2),
  total_earned_revenue DECIMAL(16,2),

  -- Overbilled/Underbilled
  total_overbilled DECIMAL(16,2),
  total_underbilled DECIMAL(16,2),
  net_billing_position DECIMAL(16,2),

  -- Job count
  jobs_in_progress INT,
  jobs_overbilled INT,
  jobs_underbilled INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, snapshot_date, snapshot_type)
);

-- WIP details per job
CREATE TABLE wip_job_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES wip_snapshots(id),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Contract info
  original_contract DECIMAL(14,2),
  approved_changes DECIMAL(14,2),
  revised_contract DECIMAL(14,2),

  -- Costs
  costs_to_date DECIMAL(14,2),
  estimated_cost_to_complete DECIMAL(14,2),
  total_estimated_cost DECIMAL(14,2),

  -- Revenue recognition (ASC 606)
  percent_complete DECIMAL(5,2),
  earned_revenue DECIMAL(14,2),

  -- Profit
  estimated_gross_profit DECIMAL(14,2),
  profit_to_date DECIMAL(14,2),
  profit_margin_pct DECIMAL(5,2),

  -- Billing
  billings_to_date DECIMAL(14,2),

  -- Position
  overbilled_amount DECIMAL(14,2) GENERATED ALWAYS AS (
    CASE WHEN billings_to_date > earned_revenue THEN billings_to_date - earned_revenue ELSE 0 END
  ) STORED,
  underbilled_amount DECIMAL(14,2) GENERATED ALWAYS AS (
    CASE WHEN earned_revenue > billings_to_date THEN earned_revenue - billings_to_date ELSE 0 END
  ) STORED,

  -- Flags
  has_projected_loss BOOLEAN DEFAULT false,
  projected_loss_amount DECIMAL(14,2),
  fade_from_prior_month DECIMAL(14,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WIP alerts and issues
CREATE TABLE wip_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'projected_loss', 'significant_fade', 'major_overbilling',
    'cost_overrun', 'stalled_billing', 'margin_decline'
  )),
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical')),
  threshold_value DECIMAL(10,4),
  actual_value DECIMAL(10,4),
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES employees(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## UI Components

### 1. Overhead Allocation Dashboard
- Visual breakdown of overhead categories
- Rate calculator with real-time updates
- Job allocation preview before posting
- Historical rate trends

### 2. Labor Burden Calculator
- Employee burden rate cards
- Component breakdown visualization
- What-if scenarios for rate changes
- Comparison to industry benchmarks

### 3. Bonus Tracker
- Real-time gross profit visualization
- Projected bonus amounts
- Tier progress indicators
- Historical bonus payments

### 4. Job Profitability Dashboard
- True profitability including overhead
- Margin trending over job life
- Cost code variance analysis
- Productivity vs. benchmark comparison

### 5. WIP Report Generator
- Monthly snapshot automation
- Overbilled/underbilled visualization
- Fade analysis and alerts
- Export to accounting systems

---

## Integration Points

1. **Timekeeping** → Burdened labor costs posted automatically
2. **Accounts Payable** → Overhead expenses categorized
3. **Job Costing** → Overhead allocated per period
4. **Payroll** → Bonus calculations integrated
5. **General Ledger** → WIP journal entries
6. **ASC 606** → Cost-to-cost % complete calculation

---

## Implementation Priority

1. **Phase 1**: Cost code structure and job budgets
2. **Phase 2**: Labor burden components and rates
3. **Phase 3**: Overhead allocation system
4. **Phase 4**: Bonus program configuration
5. **Phase 5**: WIP reporting and alerts
