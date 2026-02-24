-- ============================================================================
-- Module 41: Onboarding Wizard
-- ============================================================================
-- V1 core tables for guided setup experience:
-- onboarding_sessions, onboarding_milestones, onboarding_reminders,
-- sample_data_sets, onboarding_checklists
-- ============================================================================

-- ── Onboarding Sessions (core wizard session tracking) ──────────────────────
CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'in_progress', 'completed', 'skipped'
  )),
  current_step INT DEFAULT 1,
  total_steps INT DEFAULT 8,
  company_type VARCHAR(50) CHECK (company_type IS NULL OR company_type IN (
    'custom_home', 'production', 'remodel', 'commercial', 'specialty'
  )),
  company_size VARCHAR(30) CHECK (company_size IS NULL OR company_size IN (
    '1-5', '6-20', '21-50', '51-100', '100+'
  )),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_company ON onboarding_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user ON onboarding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_status ON onboarding_sessions(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_company_status ON onboarding_sessions(company_id, status);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_deleted ON onboarding_sessions(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON onboarding_sessions
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_onboarding_sessions
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Onboarding Milestones (individual step completion tracking) ─────────────
CREATE TABLE IF NOT EXISTS onboarding_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  milestone_key VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped'
  )),
  sort_order INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_milestones_company ON onboarding_milestones(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_milestones_session ON onboarding_milestones(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_milestones_key ON onboarding_milestones(milestone_key);
CREATE INDEX IF NOT EXISTS idx_onboarding_milestones_company_session ON onboarding_milestones(company_id, session_id);

ALTER TABLE onboarding_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON onboarding_milestones
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_onboarding_milestones
  BEFORE UPDATE ON onboarding_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Onboarding Reminders (nudges for incomplete onboarding) ─────────────────
CREATE TABLE IF NOT EXISTS onboarding_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  reminder_type VARCHAR(30) NOT NULL DEFAULT 'email' CHECK (reminder_type IN (
    'email', 'in_app', 'push'
  )),
  subject VARCHAR(255),
  message TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'sent', 'cancelled', 'failed'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_company ON onboarding_reminders(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_session ON onboarding_reminders(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_status ON onboarding_reminders(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_scheduled ON onboarding_reminders(scheduled_at);

ALTER TABLE onboarding_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON onboarding_reminders
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_onboarding_reminders
  BEFORE UPDATE ON onboarding_reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Sample Data Sets (pre-built demo data configurations) ───────────────────
CREATE TABLE IF NOT EXISTS sample_data_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  data_type VARCHAR(50) NOT NULL DEFAULT 'full_demo' CHECK (data_type IN (
    'full_demo', 'minimal', 'custom_home', 'production', 'remodel', 'commercial'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'generating', 'ready', 'applied', 'failed'
  )),
  content JSONB DEFAULT '{}',
  applied_at TIMESTAMPTZ,
  applied_by UUID,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sample_data_sets_company ON sample_data_sets(company_id);
CREATE INDEX IF NOT EXISTS idx_sample_data_sets_type ON sample_data_sets(data_type);
CREATE INDEX IF NOT EXISTS idx_sample_data_sets_status ON sample_data_sets(status);

ALTER TABLE sample_data_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON sample_data_sets
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_sample_data_sets
  BEFORE UPDATE ON sample_data_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Onboarding Checklists (setup checklist items) ───────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  session_id UUID NOT NULL REFERENCES onboarding_sessions(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'setup', 'data', 'team', 'workflow', 'integration'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  completed_by UUID,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_company ON onboarding_checklists(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_session ON onboarding_checklists(session_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_category ON onboarding_checklists(category);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_completed ON onboarding_checklists(company_id, is_completed);

ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON onboarding_checklists
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_onboarding_checklists
  BEFORE UPDATE ON onboarding_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
