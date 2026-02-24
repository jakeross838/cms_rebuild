-- ============================================================================
-- Module 24: AI Document Processing — V1 Foundation
-- Tables: document_classifications, document_extractions, extraction_templates,
--         document_processing_queue, ai_feedback
-- ============================================================================

-- ── Document Classifications ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_classifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     UUID NOT NULL REFERENCES companies(id),
  document_id    UUID NOT NULL,
  classified_type VARCHAR(30) NOT NULL CHECK (classified_type IN (
    'invoice', 'receipt', 'lien_waiver', 'change_order', 'purchase_order',
    'contract', 'permit', 'inspection_report', 'plan_sheet', 'specification',
    'submittal', 'rfi', 'other'
  )),
  confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  model_version  VARCHAR(50),
  metadata       JSONB DEFAULT '{}',
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

ALTER TABLE document_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_classifications_tenant_isolation"
  ON document_classifications
  USING (company_id = get_current_company_id());

CREATE INDEX idx_document_classifications_company_id ON document_classifications(company_id);
CREATE INDEX idx_document_classifications_document_id ON document_classifications(document_id);
CREATE INDEX idx_document_classifications_classified_type ON document_classifications(classified_type);
CREATE INDEX idx_document_classifications_confidence ON document_classifications(confidence_score);
CREATE INDEX idx_document_classifications_deleted_at ON document_classifications(deleted_at) WHERE deleted_at IS NULL;

-- ── Extraction Templates ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS extraction_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id       UUID NOT NULL REFERENCES companies(id),
  name             VARCHAR(200) NOT NULL,
  document_type    VARCHAR(30) NOT NULL CHECK (document_type IN (
    'invoice', 'receipt', 'lien_waiver', 'change_order', 'purchase_order',
    'contract', 'permit', 'inspection_report', 'plan_sheet', 'specification',
    'submittal', 'rfi', 'other'
  )),
  field_definitions JSONB NOT NULL DEFAULT '[]',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_system        BOOLEAN NOT NULL DEFAULT false,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

ALTER TABLE extraction_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extraction_templates_tenant_isolation"
  ON extraction_templates
  USING (company_id = get_current_company_id());

CREATE INDEX idx_extraction_templates_company_id ON extraction_templates(company_id);
CREATE INDEX idx_extraction_templates_document_type ON extraction_templates(document_type);
CREATE INDEX idx_extraction_templates_is_active ON extraction_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_extraction_templates_deleted_at ON extraction_templates(deleted_at) WHERE deleted_at IS NULL;

-- ── Document Extractions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_extractions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id),
  document_id           UUID NOT NULL,
  classification_id     UUID REFERENCES document_classifications(id),
  extraction_template_id UUID REFERENCES extraction_templates(id),
  extracted_data        JSONB NOT NULL DEFAULT '{}',
  status                VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'review_needed'
  )),
  reviewed_by           UUID REFERENCES users(id),
  reviewed_at           TIMESTAMPTZ,
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ
);

ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_extractions_tenant_isolation"
  ON document_extractions
  USING (company_id = get_current_company_id());

CREATE INDEX idx_document_extractions_company_id ON document_extractions(company_id);
CREATE INDEX idx_document_extractions_document_id ON document_extractions(document_id);
CREATE INDEX idx_document_extractions_classification_id ON document_extractions(classification_id);
CREATE INDEX idx_document_extractions_template_id ON document_extractions(extraction_template_id);
CREATE INDEX idx_document_extractions_status ON document_extractions(status);
CREATE INDEX idx_document_extractions_company_status ON document_extractions(company_id, status);
CREATE INDEX idx_document_extractions_deleted_at ON document_extractions(deleted_at) WHERE deleted_at IS NULL;

-- ── Document Processing Queue ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_processing_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID NOT NULL REFERENCES companies(id),
  document_id   UUID NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'completed', 'failed', 'cancelled'
  )),
  priority      INT NOT NULL DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  attempts      INT NOT NULL DEFAULT 0,
  max_attempts  INT NOT NULL DEFAULT 3,
  error_message TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_processing_queue_tenant_isolation"
  ON document_processing_queue
  USING (company_id = get_current_company_id());

CREATE INDEX idx_doc_queue_company_id ON document_processing_queue(company_id);
CREATE INDEX idx_doc_queue_document_id ON document_processing_queue(document_id);
CREATE INDEX idx_doc_queue_status ON document_processing_queue(status);
CREATE INDEX idx_doc_queue_priority ON document_processing_queue(priority);
CREATE INDEX idx_doc_queue_company_status ON document_processing_queue(company_id, status);
CREATE INDEX idx_doc_queue_status_priority ON document_processing_queue(status, priority) WHERE status = 'queued';

-- ── AI Feedback ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ai_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  extraction_id   UUID REFERENCES document_extractions(id),
  field_name      VARCHAR(200) NOT NULL,
  original_value  TEXT,
  corrected_value TEXT,
  feedback_type   VARCHAR(20) NOT NULL CHECK (feedback_type IN (
    'correction', 'confirmation', 'rejection'
  )),
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_feedback_tenant_isolation"
  ON ai_feedback
  USING (company_id = get_current_company_id());

CREATE INDEX idx_ai_feedback_company_id ON ai_feedback(company_id);
CREATE INDEX idx_ai_feedback_extraction_id ON ai_feedback(extraction_id);
CREATE INDEX idx_ai_feedback_feedback_type ON ai_feedback(feedback_type);
CREATE INDEX idx_ai_feedback_field_name ON ai_feedback(field_name);

-- ── Updated_at Triggers ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_document_classifications_updated_at
  BEFORE UPDATE ON document_classifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_extraction_templates_updated_at
  BEFORE UPDATE ON extraction_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_document_extractions_updated_at
  BEFORE UPDATE ON document_extractions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_document_processing_queue_updated_at
  BEFORE UPDATE ON document_processing_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ai_feedback_updated_at
  BEFORE UPDATE ON ai_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
