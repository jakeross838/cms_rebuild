-- ============================================================================
-- Module 06: Document Storage & Management
-- ============================================================================
-- Core tables for file/document operations: folders, documents, versions,
-- tags, search content, expirations, and settings.
-- ============================================================================

-- ── Document Folders ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  parent_folder_id UUID REFERENCES document_folders(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, job_id, path)
);

CREATE INDEX IF NOT EXISTS idx_folders_company_job ON document_folders(company_id, job_id);

ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON document_folders
  USING (company_id = get_current_company_id());

-- ── Documents ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  job_id UUID REFERENCES jobs(id),
  folder_id UUID REFERENCES document_folders(id),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  document_type TEXT,
  ai_classification TEXT,
  ai_confidence NUMERIC(3,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted', 'quarantined', 'legal_hold')),
  current_version_id UUID,
  thumbnail_path TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_company ON documents(company_id, job_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(company_id, document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(company_id, status);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON documents
  USING (company_id = get_current_company_id());

-- ── Document Versions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  change_notes TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_versions_document ON document_versions(document_id);

-- ── Document Tags ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_doc_tags_tag ON document_tags(tag);

-- ── Company Tag Library ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_tag_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  tag TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, tag)
);

ALTER TABLE company_tag_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON company_tag_library
  USING (company_id = get_current_company_id());

-- ── Document Search Content ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_search_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id),
  extracted_text TEXT,
  tsv_content TSVECTOR,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_method TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, version_id)
);

CREATE INDEX IF NOT EXISTS idx_doc_search_tsv ON document_search_content USING GIN(tsv_content);

-- ── Document Expirations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_expirations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  expiration_date DATE NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  alert_90_sent BOOLEAN DEFAULT false,
  alert_60_sent BOOLEAN DEFAULT false,
  alert_30_sent BOOLEAN DEFAULT false,
  alert_14_sent BOOLEAN DEFAULT false,
  alert_expired_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_exp_date ON document_expirations(company_id, expiration_date);

ALTER TABLE document_expirations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON document_expirations
  USING (company_id = get_current_company_id());

-- ── Company Document Settings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_document_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) UNIQUE,
  folder_templates JSONB DEFAULT '[]',
  retention_policy JSONB DEFAULT '{}',
  max_file_size_mb INT DEFAULT 500,
  blocked_extensions TEXT[] DEFAULT '{exe,bat,sh,cmd,ps1}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE company_document_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON company_document_settings
  USING (company_id = get_current_company_id());

-- ── Company Storage Usage ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) UNIQUE,
  total_bytes BIGINT DEFAULT 0,
  file_count INT DEFAULT 0,
  quota_bytes BIGINT NOT NULL DEFAULT 53687091200, -- 50 GB default (starter tier)
  last_calculated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE company_storage_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON company_storage_usage
  USING (company_id = get_current_company_id());

-- ── GIN indexes for document filename search ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_documents_filename_trgm ON documents USING GIN(filename gin_trgm_ops);
