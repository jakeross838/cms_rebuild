# Feature: RFI SLA Tracking & Change Order Workflow Enhancements

## Overview

This feature enhances BuildDesk's RFI and Change Order management to align with construction industry best practices, including SLA tracking, escalation workflows, and comprehensive audit trails.

---

## Part 1: RFI SLA Tracking & Escalation

### Industry Research Findings
- Average RFI response time: 6.4-12 days
- 25% of RFIs receive no response at all
- Unanswered RFIs are a leading cause of construction delays
- Best practice: Track response time SLAs with automated escalation

### Database Schema

```sql
-- RFI SLA configurations per project/contract
CREATE TABLE rfi_sla_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Response time SLAs (in business days)
  initial_response_days INT NOT NULL DEFAULT 3,      -- Acknowledge receipt
  full_response_days INT NOT NULL DEFAULT 7,         -- Provide answer
  clarification_response_days INT NOT NULL DEFAULT 2, -- Follow-up questions

  -- Priority-based overrides
  urgent_response_days INT DEFAULT 1,
  high_response_days INT DEFAULT 3,
  normal_response_days INT DEFAULT 7,
  low_response_days INT DEFAULT 10,

  -- Escalation settings
  escalation_enabled BOOLEAN DEFAULT true,
  first_escalation_days INT DEFAULT 5,     -- Days before first escalation
  second_escalation_days INT DEFAULT 7,    -- Days before second escalation
  final_escalation_days INT DEFAULT 10,    -- Days before final escalation

  -- Business day calculation
  include_weekends BOOLEAN DEFAULT false,
  excluded_dates JSONB DEFAULT '[]',  -- Holidays, etc.
  business_hours_start TIME DEFAULT '08:00',
  business_hours_end TIME DEFAULT '17:00',

  -- Notification settings
  notify_on_submit BOOLEAN DEFAULT true,
  notify_on_response BOOLEAN DEFAULT true,
  daily_digest_enabled BOOLEAN DEFAULT true,
  daily_digest_time TIME DEFAULT '07:00',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Enhanced RFI table with SLA tracking
CREATE TABLE rfis_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  rfi_number TEXT NOT NULL,  -- Auto-generated: "RFI-001", etc.

  -- Core fields
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  specification_section TEXT,
  drawing_reference TEXT,
  location TEXT,
  discipline TEXT CHECK (discipline IN (
    'architectural', 'structural', 'mechanical', 'electrical',
    'plumbing', 'civil', 'landscape', 'other'
  )),

  -- Priority & Category
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  category TEXT CHECK (category IN (
    'clarification', 'conflict', 'missing_information',
    'substitution', 'value_engineering', 'coordination', 'other'
  )),
  cost_impact_potential BOOLEAN DEFAULT false,
  schedule_impact_potential BOOLEAN DEFAULT false,

  -- Parties
  submitted_by UUID NOT NULL REFERENCES employees(id),
  assigned_to_company TEXT,  -- Architect, Engineer, etc.
  assigned_to_contact TEXT,
  assigned_to_email TEXT,

  -- SLA tracking timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  due_date DATE,
  responded_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  -- Response
  response TEXT,
  response_by TEXT,
  response_attachments JSONB DEFAULT '[]',
  response_requires_clarification BOOLEAN DEFAULT false,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'draft', 'open', 'acknowledged', 'in_review',
    'responded', 'clarification_needed', 'closed', 'void'
  )),

  -- SLA metrics (calculated)
  business_days_open INT,
  sla_status TEXT CHECK (sla_status IN ('on_track', 'at_risk', 'overdue', 'met', 'missed')),

  -- Escalation tracking
  escalation_level INT DEFAULT 0,  -- 0=none, 1=first, 2=second, 3=final
  last_escalation_at TIMESTAMPTZ,
  escalation_history JSONB DEFAULT '[]',

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Linked items
  linked_submittals JSONB DEFAULT '[]',
  linked_change_orders JSONB DEFAULT '[]',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique RFI number per job
CREATE UNIQUE INDEX idx_rfi_number_unique ON rfis_enhanced(job_id, rfi_number);

-- RFI escalation contacts
CREATE TABLE rfi_escalation_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  escalation_level INT NOT NULL CHECK (escalation_level BETWEEN 1 AND 3),
  contact_type TEXT NOT NULL CHECK (contact_type IN ('internal', 'external')),
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  company TEXT,
  role TEXT,
  notification_method TEXT DEFAULT 'email' CHECK (notification_method IN ('email', 'sms', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, escalation_level, contact_email)
);

-- RFI activity log
CREATE TABLE rfi_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES rfis_enhanced(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'submitted', 'acknowledged', 'assigned', 'responded',
    'clarification_requested', 'clarification_received', 'closed', 'reopened',
    'escalated', 'attachment_added', 'comment_added', 'status_changed',
    'sla_warning', 'sla_overdue'
  )),
  description TEXT NOT NULL,
  performed_by UUID REFERENCES employees(id),
  performed_by_external TEXT, -- For external party actions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFI comments/discussion
CREATE TABLE rfi_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfi_id UUID NOT NULL REFERENCES rfis_enhanced(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES rfi_comments(id),
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,  -- Internal notes vs. visible to all
  author_id UUID REFERENCES employees(id),
  author_external TEXT,
  author_company TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFI SLA metrics aggregation
CREATE TABLE rfi_sla_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Counts
  total_rfis INT DEFAULT 0,
  open_rfis INT DEFAULT 0,
  closed_rfis INT DEFAULT 0,
  overdue_rfis INT DEFAULT 0,

  -- Response times
  avg_response_days DECIMAL(5,2),
  min_response_days INT,
  max_response_days INT,

  -- SLA compliance
  rfis_met_sla INT DEFAULT 0,
  rfis_missed_sla INT DEFAULT 0,
  sla_compliance_pct DECIMAL(5,2),

  -- By discipline
  metrics_by_discipline JSONB DEFAULT '{}',

  -- By party
  metrics_by_responder JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, period_start, period_end)
);
```

### RFI SLA Calculation Function

```sql
-- Function to calculate business days between dates
CREATE OR REPLACE FUNCTION calculate_business_days(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_job_id UUID
) RETURNS INT AS $$
DECLARE
  v_config rfi_sla_configs%ROWTYPE;
  v_days INT := 0;
  v_current DATE;
  v_excluded JSONB;
BEGIN
  SELECT * INTO v_config FROM rfi_sla_configs WHERE job_id = p_job_id;

  IF v_config IS NULL THEN
    -- Default: exclude weekends
    SELECT COUNT(*) INTO v_days
    FROM generate_series(p_start_date::date, p_end_date::date, '1 day'::interval) d
    WHERE EXTRACT(DOW FROM d) NOT IN (0, 6);
    RETURN v_days - 1; -- Exclude start day
  END IF;

  v_current := p_start_date::date + 1;
  v_excluded := v_config.excluded_dates;

  WHILE v_current <= p_end_date::date LOOP
    IF v_config.include_weekends OR EXTRACT(DOW FROM v_current) NOT IN (0, 6) THEN
      IF NOT (v_excluded ? v_current::text) THEN
        v_days := v_days + 1;
      END IF;
    END IF;
    v_current := v_current + 1;
  END LOOP;

  RETURN v_days;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update RFI SLA status
CREATE OR REPLACE FUNCTION update_rfi_sla_status() RETURNS TRIGGER AS $$
DECLARE
  v_config rfi_sla_configs%ROWTYPE;
  v_days_open INT;
  v_due_days INT;
BEGIN
  SELECT * INTO v_config FROM rfi_sla_configs WHERE job_id = NEW.job_id;

  IF v_config IS NULL THEN
    NEW.sla_status := 'on_track';
    RETURN NEW;
  END IF;

  -- Calculate days open
  NEW.business_days_open := calculate_business_days(
    NEW.submitted_at,
    COALESCE(NEW.responded_at, NOW()),
    NEW.job_id
  );

  -- Determine due days based on priority
  v_due_days := CASE NEW.priority
    WHEN 'urgent' THEN v_config.urgent_response_days
    WHEN 'high' THEN v_config.high_response_days
    WHEN 'normal' THEN v_config.normal_response_days
    WHEN 'low' THEN v_config.low_response_days
    ELSE v_config.full_response_days
  END;

  -- Set due date if not set
  IF NEW.due_date IS NULL THEN
    NEW.due_date := (NEW.submitted_at + (v_due_days || ' days')::interval)::date;
  END IF;

  -- Determine SLA status
  IF NEW.responded_at IS NOT NULL THEN
    IF NEW.business_days_open <= v_due_days THEN
      NEW.sla_status := 'met';
    ELSE
      NEW.sla_status := 'missed';
    END IF;
  ELSE
    IF NEW.business_days_open >= v_due_days THEN
      NEW.sla_status := 'overdue';
    ELSIF NEW.business_days_open >= v_due_days - 2 THEN
      NEW.sla_status := 'at_risk';
    ELSE
      NEW.sla_status := 'on_track';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rfi_sla_update
  BEFORE INSERT OR UPDATE ON rfis_enhanced
  FOR EACH ROW
  EXECUTE FUNCTION update_rfi_sla_status();
```

---

## Part 2: Change Order Workflow Enhancements

### Industry Research Findings
- Change orders require clear approval chains
- Cost/schedule impact must be documented
- Owner-directed vs. contractor-initiated distinctions
- Markup calculations vary by contract type
- Pending Change Order (PCO) → Change Order Request (COR) → Change Order (CO) workflow

### Database Schema

```sql
-- Change order types and default markups
CREATE TABLE change_order_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Default markup rates
  labor_markup_pct DECIMAL(5,2) DEFAULT 15.00,
  material_markup_pct DECIMAL(5,2) DEFAULT 10.00,
  equipment_markup_pct DECIMAL(5,2) DEFAULT 10.00,
  subcontractor_markup_pct DECIMAL(5,2) DEFAULT 5.00,

  -- Overhead & profit
  overhead_pct DECIMAL(5,2) DEFAULT 10.00,
  profit_pct DECIMAL(5,2) DEFAULT 10.00,

  -- Bond & insurance
  bond_pct DECIMAL(5,2) DEFAULT 1.00,
  insurance_pct DECIMAL(5,2) DEFAULT 2.00,

  -- Time impact rates
  daily_general_conditions DECIMAL(10,2),
  weekly_supervision_cost DECIMAL(10,2),

  -- Approval thresholds (auto-approve below)
  pm_approval_limit DECIMAL(12,2) DEFAULT 5000.00,
  director_approval_limit DECIMAL(12,2) DEFAULT 25000.00,
  executive_approval_limit DECIMAL(12,2) DEFAULT 100000.00,
  -- Above executive limit requires owner approval

  -- Workflow settings
  require_owner_approval_above DECIMAL(12,2) DEFAULT 10000.00,
  allow_verbal_approval BOOLEAN DEFAULT false,
  require_signed_approval BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id)
);

-- Potential Change Orders (PCO) - Initial identification
CREATE TABLE potential_change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  pco_number TEXT NOT NULL,

  -- Origin
  origin_type TEXT NOT NULL CHECK (origin_type IN (
    'owner_directive', 'design_change', 'field_condition',
    'code_requirement', 'value_engineering', 'error_omission',
    'rfi_response', 'unforeseen_condition', 'scope_clarification'
  )),
  origin_document_type TEXT,  -- 'RFI', 'Drawing', 'Email', etc.
  origin_document_ref TEXT,
  linked_rfi_id UUID REFERENCES rfis_enhanced(id),

  -- Description
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  spec_section TEXT,
  drawing_refs JSONB DEFAULT '[]',

  -- Initial assessment
  preliminary_cost_estimate DECIMAL(14,2),
  preliminary_time_impact_days INT,
  confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),

  -- Status
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified', 'under_review', 'pricing', 'submitted_as_cor',
    'rejected', 'void'
  )),

  -- Tracking
  identified_by UUID NOT NULL REFERENCES employees(id),
  identified_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pco_number ON potential_change_orders(job_id, pco_number);

-- Change Order Requests (COR) - Formal pricing/request
CREATE TABLE change_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  cor_number TEXT NOT NULL,
  pco_id UUID REFERENCES potential_change_orders(id),

  -- Request details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT,

  -- Cost breakdown
  labor_cost DECIMAL(14,2) DEFAULT 0,
  labor_hours DECIMAL(10,2) DEFAULT 0,
  material_cost DECIMAL(14,2) DEFAULT 0,
  equipment_cost DECIMAL(14,2) DEFAULT 0,
  subcontractor_cost DECIMAL(14,2) DEFAULT 0,
  other_cost DECIMAL(14,2) DEFAULT 0,
  subtotal DECIMAL(14,2) GENERATED ALWAYS AS (
    labor_cost + material_cost + equipment_cost + subcontractor_cost + other_cost
  ) STORED,

  -- Markups applied
  labor_markup DECIMAL(14,2) DEFAULT 0,
  material_markup DECIMAL(14,2) DEFAULT 0,
  equipment_markup DECIMAL(14,2) DEFAULT 0,
  subcontractor_markup DECIMAL(14,2) DEFAULT 0,
  overhead_amount DECIMAL(14,2) DEFAULT 0,
  profit_amount DECIMAL(14,2) DEFAULT 0,
  bond_amount DECIMAL(14,2) DEFAULT 0,
  insurance_amount DECIMAL(14,2) DEFAULT 0,
  total_markup DECIMAL(14,2) GENERATED ALWAYS AS (
    labor_markup + material_markup + equipment_markup + subcontractor_markup +
    overhead_amount + profit_amount + bond_amount + insurance_amount
  ) STORED,

  -- Total
  total_amount DECIMAL(14,2),

  -- Time impact
  time_impact_days INT DEFAULT 0,
  schedule_impact_description TEXT,
  impacts_critical_path BOOLEAN DEFAULT false,

  -- Status workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'internal_review', 'submitted', 'owner_review',
    'negotiating', 'approved', 'rejected', 'converted_to_co', 'void'
  )),

  -- Submission
  submitted_date DATE,
  submitted_by UUID REFERENCES employees(id),
  submitted_to TEXT,  -- Owner/Architect name

  -- Owner response
  owner_response TEXT CHECK (owner_response IN (
    'pending', 'approved_as_submitted', 'approved_with_changes',
    'rejected', 'more_info_needed'
  )),
  owner_response_date DATE,
  owner_approved_amount DECIMAL(14,2),
  owner_approved_days INT,
  owner_comments TEXT,

  -- Attachments
  backup_documentation JSONB DEFAULT '[]',  -- Cost backup, quotes, etc.
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_cor_number ON change_order_requests(job_id, cor_number);

-- Executed Change Orders (CO)
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  co_number TEXT NOT NULL,
  cor_id UUID REFERENCES change_order_requests(id),

  -- Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN (
    'additive', 'deductive', 'no_cost', 'time_only'
  )),

  -- Financial
  contract_amount_change DECIMAL(14,2) NOT NULL,
  time_extension_days INT DEFAULT 0,

  -- Running totals (for contract tracking)
  original_contract_amount DECIMAL(14,2),
  prior_co_total DECIMAL(14,2),
  new_contract_total DECIMAL(14,2),

  -- Execution
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'partially_executed', 'fully_executed', 'void'
  )),

  -- Signatures
  contractor_signed_by TEXT,
  contractor_signed_date DATE,
  owner_signed_by TEXT,
  owner_signed_date DATE,
  architect_signed_by TEXT,
  architect_signed_date DATE,

  -- Work authorization
  work_authorized_date DATE,
  work_completed_date DATE,

  -- Billing
  billed_to_date DECIMAL(14,2) DEFAULT 0,
  remaining_to_bill DECIMAL(14,2),

  -- Document
  executed_document_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_co_number ON change_orders(job_id, co_number);

-- Change order cost breakdown items
CREATE TABLE change_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cor_id UUID REFERENCES change_order_requests(id),
  co_id UUID REFERENCES change_orders(id),

  -- Item details
  cost_code_id UUID REFERENCES cost_codes(id),
  description TEXT NOT NULL,
  quantity DECIMAL(14,4) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(10,4) NOT NULL,

  -- Cost type
  cost_type TEXT NOT NULL CHECK (cost_type IN (
    'labor', 'material', 'equipment', 'subcontractor', 'other'
  )),

  -- Calculations
  extended_cost DECIMAL(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  markup_pct DECIMAL(5,2),
  markup_amount DECIMAL(14,2),
  total_with_markup DECIMAL(14,2),

  -- For labor
  labor_rate DECIMAL(10,4),
  labor_hours DECIMAL(10,2),

  -- For subcontractors
  subcontractor_name TEXT,
  subcontractor_quote_ref TEXT,

  sort_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change order approval workflow
CREATE TABLE change_order_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cor_id UUID REFERENCES change_order_requests(id),
  co_id UUID REFERENCES change_orders(id),

  -- Approval step
  approval_level INT NOT NULL,  -- 1=PM, 2=Director, 3=Executive, 4=Owner
  approval_type TEXT NOT NULL CHECK (approval_type IN (
    'internal_pm', 'internal_director', 'internal_executive', 'owner', 'architect'
  )),
  required_by_amount DECIMAL(14,2), -- Threshold that triggered this level

  -- Approver
  approver_id UUID REFERENCES employees(id),
  approver_name TEXT NOT NULL,
  approver_email TEXT,

  -- Decision
  decision TEXT CHECK (decision IN ('pending', 'approved', 'rejected', 'deferred')),
  decision_date TIMESTAMPTZ,
  comments TEXT,
  conditions TEXT,  -- Approved with conditions

  -- Notification
  notified_at TIMESTAMPTZ,
  reminder_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Change order log/history
CREATE TABLE change_order_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pco_id UUID REFERENCES potential_change_orders(id),
  cor_id UUID REFERENCES change_order_requests(id),
  co_id UUID REFERENCES change_orders(id),

  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created', 'updated', 'submitted', 'approved', 'rejected',
    'status_changed', 'comment_added', 'attachment_added',
    'sent_to_owner', 'owner_responded', 'executed', 'voided',
    'reminder_sent', 'escalated'
  )),
  description TEXT NOT NULL,
  performed_by UUID REFERENCES employees(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Change Order Summary View

```sql
-- Job change order summary
CREATE VIEW job_change_order_summary AS
SELECT
  j.id AS job_id,
  j.name AS job_name,
  j.contract_amount AS original_contract,

  -- PCO summary
  COUNT(DISTINCT pco.id) AS total_pcos,
  COUNT(DISTINCT pco.id) FILTER (WHERE pco.status = 'identified') AS pending_pcos,

  -- COR summary
  COUNT(DISTINCT cor.id) AS total_cors,
  COUNT(DISTINCT cor.id) FILTER (WHERE cor.status IN ('draft', 'internal_review')) AS draft_cors,
  COUNT(DISTINCT cor.id) FILTER (WHERE cor.status IN ('submitted', 'owner_review', 'negotiating')) AS pending_cors,
  SUM(cor.total_amount) FILTER (WHERE cor.status IN ('submitted', 'owner_review', 'negotiating')) AS pending_cor_value,

  -- CO summary
  COUNT(DISTINCT co.id) AS total_cos,
  COUNT(DISTINCT co.id) FILTER (WHERE co.change_type = 'additive') AS additive_cos,
  COUNT(DISTINCT co.id) FILTER (WHERE co.change_type = 'deductive') AS deductive_cos,

  -- Financial impact
  COALESCE(SUM(co.contract_amount_change), 0) AS net_change_amount,
  j.contract_amount + COALESCE(SUM(co.contract_amount_change), 0) AS revised_contract,
  COALESCE(SUM(co.time_extension_days), 0) AS total_time_extension,

  -- Percentages
  ROUND((COALESCE(SUM(co.contract_amount_change), 0) / NULLIF(j.contract_amount, 0)) * 100, 2) AS change_percentage

FROM jobs j
LEFT JOIN potential_change_orders pco ON j.id = pco.job_id AND pco.status != 'void'
LEFT JOIN change_order_requests cor ON j.id = cor.job_id AND cor.status != 'void'
LEFT JOIN change_orders co ON j.id = co.job_id AND co.status != 'void'
GROUP BY j.id, j.name, j.contract_amount;
```

---

## UI Components

### RFI Management

1. **RFI Dashboard**
   - Active RFIs with SLA status indicators (green/yellow/red)
   - Overdue RFI alerts
   - Response time metrics
   - By-discipline and by-responder breakdowns

2. **RFI Detail View**
   - Full conversation history
   - SLA countdown timer
   - Escalation status
   - Linked documents (drawings, specs, photos)

3. **RFI Submission Form**
   - Discipline selection
   - Priority setting
   - Drawing/spec reference lookup
   - Attachment upload
   - Assignment to external party

4. **SLA Configuration**
   - Per-project SLA settings
   - Escalation contact management
   - Holiday calendar
   - Notification preferences

### Change Order Management

1. **Change Order Dashboard**
   - PCO → COR → CO pipeline view
   - Pending approval items
   - Contract value tracker
   - Time impact summary

2. **PCO Quick Entry**
   - Rapid identification of potential changes
   - Link to origin (RFI, field condition, etc.)
   - Preliminary impact estimate

3. **COR Pricing Calculator**
   - Line item entry
   - Automatic markup application
   - Labor hour calculator
   - Subcontractor quote attachment
   - Total with all markups

4. **Approval Workflow**
   - Visual approval chain
   - One-click approve/reject
   - Comments and conditions
   - Email/notification integration

5. **CO Execution**
   - Document generation
   - E-signature integration
   - Contract tracking update
   - Billing integration

---

## Integration Points

1. **RFI → Submittals**: RFI responses may require submittal updates
2. **RFI → Change Orders**: RFI responses that identify scope changes create PCOs
3. **Change Orders → Schedule**: Time extensions update project schedule
4. **Change Orders → Budget**: Approved COs update job budgets
5. **Change Orders → Billing**: CO amounts added to pay application schedule of values
6. **Email Integration**: Send/receive RFIs and CORs via email with tracking
7. **Document Management**: All attachments stored with version control

---

## Notification Rules

### RFI Notifications
- New RFI submitted → Assigned party
- RFI acknowledged → Submitter
- RFI approaching due date (2 days) → Assigned party + PM
- RFI overdue → Escalation contacts + PM + Superintendent
- RFI responded → Submitter + PM
- Clarification requested → Original responder

### Change Order Notifications
- PCO identified → PM
- COR ready for review → Approval chain
- COR submitted to owner → PM + Superintendent
- Owner response received → Estimator + PM
- CO executed → Accounting + PM + Billing

---

## Implementation Priority

1. **Phase 1**: RFI SLA tracking and basic escalation
2. **Phase 2**: Change order workflow (PCO → COR → CO)
3. **Phase 3**: Approval workflow automation
4. **Phase 4**: Email integration
5. **Phase 5**: Advanced reporting and analytics
