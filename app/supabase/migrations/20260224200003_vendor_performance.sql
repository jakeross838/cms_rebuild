-- ==========================================================================
-- Module 22: Vendor Performance Scoring — V1 Foundation
-- ==========================================================================
-- Tables: vendor_scores, vendor_score_history, vendor_job_performance,
--         vendor_warranty_callbacks, vendor_notes
-- Multi-tenant: company_id on every table + RLS
-- Soft delete: deleted_at on vendor_scores, vendor_job_performance
-- 5-dimension scoring: quality, timeliness, communication, budget_adherence, safety
-- ==========================================================================

-- ── Vendor Scores (overall per-vendor composite scores) ──────────────────

CREATE TABLE IF NOT EXISTS vendor_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  quality_score NUMERIC(5,2) DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  timeliness_score NUMERIC(5,2) DEFAULT 0 CHECK (timeliness_score >= 0 AND timeliness_score <= 100),
  communication_score NUMERIC(5,2) DEFAULT 0 CHECK (communication_score >= 0 AND communication_score <= 100),
  budget_adherence_score NUMERIC(5,2) DEFAULT 0 CHECK (budget_adherence_score >= 0 AND budget_adherence_score <= 100),
  safety_score NUMERIC(5,2) DEFAULT 0 CHECK (safety_score >= 0 AND safety_score <= 100),
  overall_score NUMERIC(5,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  data_point_count INT DEFAULT 0,
  calculation_window_months INT DEFAULT 12,
  manual_adjustment NUMERIC(5,2) DEFAULT 0 CHECK (manual_adjustment >= -10 AND manual_adjustment <= 10),
  manual_adjustment_reason TEXT,
  calculated_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, vendor_id)
);

-- ── Vendor Score History (snapshots over time) ───────────────────────────

CREATE TABLE IF NOT EXISTS vendor_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_score_id UUID NOT NULL REFERENCES vendor_scores(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,
  quality_score NUMERIC(5,2) DEFAULT 0,
  timeliness_score NUMERIC(5,2) DEFAULT 0,
  communication_score NUMERIC(5,2) DEFAULT 0,
  budget_adherence_score NUMERIC(5,2) DEFAULT 0,
  safety_score NUMERIC(5,2) DEFAULT 0,
  overall_score NUMERIC(5,2) DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Vendor Job Performance (per-job ratings) ─────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_job_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  job_id UUID NOT NULL,
  trade VARCHAR(100),
  quality_rating NUMERIC(5,2) CHECK (quality_rating IS NULL OR (quality_rating >= 0 AND quality_rating <= 100)),
  timeliness_rating NUMERIC(5,2) CHECK (timeliness_rating IS NULL OR (timeliness_rating >= 0 AND timeliness_rating <= 100)),
  communication_rating NUMERIC(5,2) CHECK (communication_rating IS NULL OR (communication_rating >= 0 AND communication_rating <= 100)),
  budget_adherence_rating NUMERIC(5,2) CHECK (budget_adherence_rating IS NULL OR (budget_adherence_rating >= 0 AND budget_adherence_rating <= 100)),
  safety_rating NUMERIC(5,2) CHECK (safety_rating IS NULL OR (safety_rating >= 0 AND safety_rating <= 100)),
  overall_rating NUMERIC(5,2) CHECK (overall_rating IS NULL OR (overall_rating >= 0 AND overall_rating <= 100)),
  tasks_on_time INT DEFAULT 0,
  tasks_total INT DEFAULT 0,
  punch_items_count INT DEFAULT 0,
  punch_resolution_avg_days NUMERIC(8,2),
  inspection_pass_rate NUMERIC(5,2),
  bid_amount NUMERIC(15,2),
  final_amount NUMERIC(15,2),
  change_order_count INT DEFAULT 0,
  rating_notes TEXT,
  rated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Vendor Warranty Callbacks ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_warranty_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  job_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor'
    CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  status TEXT NOT NULL DEFAULT 'reported'
    CHECK (status IN ('reported', 'acknowledged', 'in_progress', 'resolved', 'disputed')),
  reported_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  resolution_notes TEXT,
  resolution_cost NUMERIC(15,2),
  resolution_days INT,
  reported_by UUID,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── Vendor Notes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS vendor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  author_id UUID,
  title VARCHAR(255),
  body TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE vendor_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_job_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_warranty_callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_notes ENABLE ROW LEVEL SECURITY;

-- ── Indexes ──────────────────────────────────────────────────────────────

-- vendor_scores
CREATE INDEX IF NOT EXISTS idx_vendor_scores_company_id ON vendor_scores(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_scores_vendor_id ON vendor_scores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_scores_company_vendor ON vendor_scores(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_scores_overall ON vendor_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_scores_deleted_at ON vendor_scores(deleted_at) WHERE deleted_at IS NULL;

-- vendor_score_history
CREATE INDEX IF NOT EXISTS idx_vendor_score_history_company_id ON vendor_score_history(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_score_history_score_id ON vendor_score_history(vendor_score_id);
CREATE INDEX IF NOT EXISTS idx_vendor_score_history_vendor_id ON vendor_score_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_score_history_snapshot ON vendor_score_history(snapshot_date DESC);

-- vendor_job_performance
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_company_id ON vendor_job_performance(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_vendor_id ON vendor_job_performance(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_job_id ON vendor_job_performance(job_id);
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_company_vendor ON vendor_job_performance(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_trade ON vendor_job_performance(trade);
CREATE INDEX IF NOT EXISTS idx_vendor_job_perf_deleted_at ON vendor_job_performance(deleted_at) WHERE deleted_at IS NULL;

-- vendor_warranty_callbacks
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_company_id ON vendor_warranty_callbacks(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_vendor_id ON vendor_warranty_callbacks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_job_id ON vendor_warranty_callbacks(job_id);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_status ON vendor_warranty_callbacks(status);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_severity ON vendor_warranty_callbacks(severity);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_company_vendor ON vendor_warranty_callbacks(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_callbacks_deleted_at ON vendor_warranty_callbacks(deleted_at) WHERE deleted_at IS NULL;

-- vendor_notes
CREATE INDEX IF NOT EXISTS idx_vendor_notes_company_id ON vendor_notes(company_id);
CREATE INDEX IF NOT EXISTS idx_vendor_notes_vendor_id ON vendor_notes(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_notes_company_vendor ON vendor_notes(company_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_notes_deleted_at ON vendor_notes(deleted_at) WHERE deleted_at IS NULL;

-- ── Updated-at trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vendor_scores_updated_at
  BEFORE UPDATE ON vendor_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_job_performance_updated_at
  BEFORE UPDATE ON vendor_job_performance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_warranty_callbacks_updated_at
  BEFORE UPDATE ON vendor_warranty_callbacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vendor_notes_updated_at
  BEFORE UPDATE ON vendor_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
