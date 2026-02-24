-- ============================================================================
-- Module 47: Training & Certification Platform — V1 Foundation
--
-- Tables: training_courses, training_paths, training_path_items,
--         user_training_progress, user_certifications
-- Multi-tenant via company_id + RLS. company_id nullable for platform content.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. training_courses — video/article/walkthrough/assessment content items
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  content_url     TEXT,
  thumbnail_url   TEXT,
  duration_minutes INT,
  course_type     VARCHAR(20) NOT NULL DEFAULT 'video'
                  CHECK (course_type IN ('video','article','walkthrough','assessment')),
  category        VARCHAR(100),
  module_tag      VARCHAR(50),
  role_tags       TEXT[] DEFAULT '{}',
  difficulty      VARCHAR(20) NOT NULL DEFAULT 'beginner'
                  CHECK (difficulty IN ('beginner','intermediate','advanced')),
  language        VARCHAR(10) NOT NULL DEFAULT 'en',
  transcript      TEXT,
  sort_order      INT NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  view_count      INT NOT NULL DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_courses_tenant
  ON training_courses
  USING (company_id IS NULL OR company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_training_courses_company ON training_courses(company_id);
CREATE INDEX idx_training_courses_type ON training_courses(course_type);
CREATE INDEX idx_training_courses_difficulty ON training_courses(difficulty);
CREATE INDEX idx_training_courses_category ON training_courses(category);
CREATE INDEX idx_training_courses_published ON training_courses(is_published);
CREATE INDEX idx_training_courses_company_published ON training_courses(company_id, is_published);
CREATE INDEX idx_training_courses_sort ON training_courses(sort_order);
CREATE INDEX idx_training_courses_deleted ON training_courses(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_training_courses_updated_at
  BEFORE UPDATE ON training_courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. training_paths — structured learning paths
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_paths (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  role_key        VARCHAR(50),
  estimated_hours NUMERIC(6,1) DEFAULT 0,
  sort_order      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE training_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_paths_tenant
  ON training_paths
  USING (company_id IS NULL OR company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_training_paths_company ON training_paths(company_id);
CREATE INDEX idx_training_paths_role ON training_paths(role_key);
CREATE INDEX idx_training_paths_active ON training_paths(is_active);
CREATE INDEX idx_training_paths_company_active ON training_paths(company_id, is_active);
CREATE INDEX idx_training_paths_sort ON training_paths(sort_order);

CREATE OR REPLACE TRIGGER set_training_paths_updated_at
  BEFORE UPDATE ON training_paths
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. training_path_items — items within a learning path
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_path_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id),
  path_id         UUID NOT NULL REFERENCES training_paths(id) ON DELETE CASCADE,
  item_type       VARCHAR(20) NOT NULL DEFAULT 'course'
                  CHECK (item_type IN ('course','assessment','checkpoint')),
  item_id         UUID NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  is_required     BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE training_path_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY training_path_items_tenant
  ON training_path_items
  USING (company_id IS NULL OR company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_training_path_items_company ON training_path_items(company_id);
CREATE INDEX idx_training_path_items_path ON training_path_items(path_id);
CREATE INDEX idx_training_path_items_item ON training_path_items(item_id);
CREATE INDEX idx_training_path_items_sort ON training_path_items(path_id, sort_order);

CREATE OR REPLACE TRIGGER set_training_path_items_updated_at
  BEFORE UPDATE ON training_path_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. user_training_progress — per-user progress tracking
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_training_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  item_type       VARCHAR(20) NOT NULL DEFAULT 'course'
                  CHECK (item_type IN ('course','assessment','checkpoint')),
  item_id         UUID NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started','in_progress','completed')),
  progress_pct    INT NOT NULL DEFAULT 0
                  CHECK (progress_pct >= 0 AND progress_pct <= 100),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id, item_type, item_id)
);

ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_training_progress_tenant
  ON user_training_progress
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_utp_company ON user_training_progress(company_id);
CREATE INDEX idx_utp_user ON user_training_progress(user_id);
CREATE INDEX idx_utp_item ON user_training_progress(item_id);
CREATE INDEX idx_utp_status ON user_training_progress(status);
CREATE INDEX idx_utp_company_user ON user_training_progress(company_id, user_id);
CREATE INDEX idx_utp_company_status ON user_training_progress(company_id, status);
CREATE INDEX idx_utp_user_item ON user_training_progress(user_id, item_type, item_id);

CREATE OR REPLACE TRIGGER set_user_training_progress_updated_at
  BEFORE UPDATE ON user_training_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. user_certifications — certification completions / attempts
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_certifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID NOT NULL,
  certification_name VARCHAR(255) NOT NULL,
  certification_level INT NOT NULL DEFAULT 1
                  CHECK (certification_level >= 1 AND certification_level <= 3),
  description     TEXT,
  passing_score   INT DEFAULT 80
                  CHECK (passing_score >= 0 AND passing_score <= 100),
  assessment_score INT
                  CHECK (assessment_score IS NULL OR (assessment_score >= 0 AND assessment_score <= 100)),
  passed          BOOLEAN NOT NULL DEFAULT false,
  attempt_count   INT NOT NULL DEFAULT 1
                  CHECK (attempt_count >= 1),
  certified_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  time_limit_minutes INT,
  issued_by       UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_certifications_tenant
  ON user_certifications
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_user_certs_company ON user_certifications(company_id);
CREATE INDEX idx_user_certs_user ON user_certifications(user_id);
CREATE INDEX idx_user_certs_passed ON user_certifications(passed);
CREATE INDEX idx_user_certs_level ON user_certifications(certification_level);
CREATE INDEX idx_user_certs_company_user ON user_certifications(company_id, user_id);
CREATE INDEX idx_user_certs_company_passed ON user_certifications(company_id, passed);
CREATE INDEX idx_user_certs_expires ON user_certifications(expires_at);
CREATE INDEX idx_user_certs_name ON user_certifications(certification_name);

CREATE OR REPLACE TRIGGER set_user_certifications_updated_at
  BEFORE UPDATE ON user_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
