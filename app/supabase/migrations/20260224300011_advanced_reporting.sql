-- ============================================================================
-- Module 39: Advanced Reporting & Custom Report Builder (V1 Foundation)
--
-- V1 tables:
--   custom_reports        — user-built report definitions
--   custom_report_widgets — individual widgets/charts in a report
--   report_dashboards     — executive dashboard layouts
--   dashboard_widgets     — widgets on dashboards
--   saved_filters         — reusable filter configurations
-- ============================================================================

-- ── custom_reports ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  report_type     TEXT NOT NULL DEFAULT 'custom' CHECK (report_type IN ('standard', 'custom')),
  data_sources    JSONB NOT NULL DEFAULT '[]',
  fields          JSONB NOT NULL DEFAULT '[]',
  filters         JSONB NOT NULL DEFAULT '{}',
  grouping        JSONB NOT NULL DEFAULT '[]',
  sorting         JSONB NOT NULL DEFAULT '[]',
  calculated_fields JSONB NOT NULL DEFAULT '[]',
  visualization_type TEXT NOT NULL DEFAULT 'table' CHECK (visualization_type IN ('table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap')),
  audience        TEXT NOT NULL DEFAULT 'internal' CHECK (audience IN ('internal', 'client', 'bank', 'investor')),
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  refresh_frequency TEXT NOT NULL DEFAULT 'manual' CHECK (refresh_frequency IN ('manual', 'hourly', 'daily', 'weekly')),
  is_template     BOOLEAN NOT NULL DEFAULT false,
  shared_with     JSONB NOT NULL DEFAULT '[]',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_reports_tenant ON custom_reports
  USING (company_id = get_current_company_id());

CREATE INDEX idx_custom_reports_company ON custom_reports(company_id);
CREATE INDEX idx_custom_reports_status ON custom_reports(status);
CREATE INDEX idx_custom_reports_report_type ON custom_reports(report_type);
CREATE INDEX idx_custom_reports_audience ON custom_reports(audience);
CREATE INDEX idx_custom_reports_created_by ON custom_reports(created_by);
CREATE INDEX idx_custom_reports_company_status ON custom_reports(company_id, status);
CREATE INDEX idx_custom_reports_deleted ON custom_reports(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_custom_reports_created ON custom_reports(created_at DESC);

CREATE TRIGGER set_custom_reports_updated_at
  BEFORE UPDATE ON custom_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── custom_report_widgets ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_report_widgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL REFERENCES companies(id),
  title           VARCHAR(200),
  widget_type     TEXT NOT NULL DEFAULT 'table' CHECK (widget_type IN ('table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap')),
  data_source     TEXT NOT NULL DEFAULT 'jobs' CHECK (data_source IN ('jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis', 'custom_query')),
  configuration   JSONB NOT NULL DEFAULT '{}',
  filters         JSONB NOT NULL DEFAULT '{}',
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE custom_report_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY custom_report_widgets_tenant ON custom_report_widgets
  USING (company_id = get_current_company_id());

CREATE INDEX idx_custom_report_widgets_report ON custom_report_widgets(report_id);
CREATE INDEX idx_custom_report_widgets_company ON custom_report_widgets(company_id);
CREATE INDEX idx_custom_report_widgets_type ON custom_report_widgets(widget_type);

CREATE TRIGGER set_custom_report_widgets_updated_at
  BEFORE UPDATE ON custom_report_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── report_dashboards ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS report_dashboards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  layout          TEXT NOT NULL DEFAULT 'two_column' CHECK (layout IN ('single_column', 'two_column', 'three_column', 'grid')),
  is_default      BOOLEAN NOT NULL DEFAULT false,
  is_admin_pushed BOOLEAN NOT NULL DEFAULT false,
  target_roles    JSONB NOT NULL DEFAULT '[]',
  global_filters  JSONB NOT NULL DEFAULT '{}',
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE report_dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY report_dashboards_tenant ON report_dashboards
  USING (company_id = get_current_company_id());

CREATE INDEX idx_report_dashboards_company ON report_dashboards(company_id);
CREATE INDEX idx_report_dashboards_created_by ON report_dashboards(created_by);
CREATE INDEX idx_report_dashboards_company_default ON report_dashboards(company_id, is_default);
CREATE INDEX idx_report_dashboards_deleted ON report_dashboards(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_report_dashboards_created ON report_dashboards(created_at DESC);

CREATE TRIGGER set_report_dashboards_updated_at
  BEFORE UPDATE ON report_dashboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── dashboard_widgets ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id      UUID NOT NULL REFERENCES report_dashboards(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id),
  title             VARCHAR(200),
  widget_type       TEXT NOT NULL DEFAULT 'kpi_card' CHECK (widget_type IN ('table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap')),
  data_source       TEXT NOT NULL DEFAULT 'jobs' CHECK (data_source IN ('jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis', 'custom_query')),
  report_id         UUID REFERENCES custom_reports(id) ON DELETE SET NULL,
  position_x        INT NOT NULL DEFAULT 0,
  position_y        INT NOT NULL DEFAULT 0,
  width             INT NOT NULL DEFAULT 1,
  height            INT NOT NULL DEFAULT 1,
  configuration     JSONB NOT NULL DEFAULT '{}',
  refresh_interval_seconds INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY dashboard_widgets_tenant ON dashboard_widgets
  USING (company_id = get_current_company_id());

CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id);
CREATE INDEX idx_dashboard_widgets_company ON dashboard_widgets(company_id);
CREATE INDEX idx_dashboard_widgets_report ON dashboard_widgets(report_id);

CREATE TRIGGER set_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── saved_filters ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_filters (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  context         TEXT NOT NULL DEFAULT 'reports' CHECK (context IN ('reports', 'dashboards', 'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis')),
  filter_config   JSONB NOT NULL DEFAULT '{}',
  is_global       BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY saved_filters_tenant ON saved_filters
  USING (company_id = get_current_company_id());

CREATE INDEX idx_saved_filters_company ON saved_filters(company_id);
CREATE INDEX idx_saved_filters_context ON saved_filters(context);
CREATE INDEX idx_saved_filters_created_by ON saved_filters(created_by);
CREATE INDEX idx_saved_filters_company_context ON saved_filters(company_id, context);

CREATE TRIGGER set_saved_filters_updated_at
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
