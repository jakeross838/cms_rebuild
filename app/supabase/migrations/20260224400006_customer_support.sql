-- ============================================================================
-- Module 46: Customer Support — V1 Foundation
--
-- Tables: support_tickets, ticket_messages, kb_articles,
--         feature_requests, feature_request_votes
-- Multi-tenant via company_id + RLS. Soft delete via deleted_at.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. support_tickets — core ticket records
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS support_tickets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  user_id           UUID,
  ticket_number     VARCHAR(30) NOT NULL,
  subject           VARCHAR(255) NOT NULL,
  description       TEXT,
  status            VARCHAR(30) NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','in_progress','waiting_on_customer','waiting_on_agent','resolved','closed')),
  priority          VARCHAR(20) NOT NULL DEFAULT 'normal'
                    CHECK (priority IN ('low','normal','high','urgent')),
  category          VARCHAR(30) NOT NULL DEFAULT 'general'
                    CHECK (category IN ('general','billing','technical','feature_request','bug_report','onboarding','integration','other')),
  channel           VARCHAR(20) NOT NULL DEFAULT 'web'
                    CHECK (channel IN ('web','email','chat','phone')),
  assigned_agent_id UUID,
  tags              JSONB NOT NULL DEFAULT '[]'::jsonb,
  first_response_at TIMESTAMPTZ,
  resolved_at       TIMESTAMPTZ,
  closed_at         TIMESTAMPTZ,
  satisfaction_rating INT CHECK (satisfaction_rating IS NULL OR (satisfaction_rating >= 1 AND satisfaction_rating <= 5)),
  created_by        UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_tickets_tenant
  ON support_tickets
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_support_tickets_company ON support_tickets(company_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_channel ON support_tickets(channel);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_agent_id);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);
CREATE INDEX idx_support_tickets_company_status ON support_tickets(company_id, status);
CREATE INDEX idx_support_tickets_company_priority ON support_tickets(company_id, priority);
CREATE INDEX idx_support_tickets_created ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_deleted ON support_tickets(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. ticket_messages — messages within tickets
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ticket_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type     VARCHAR(20) NOT NULL DEFAULT 'customer'
                  CHECK (sender_type IN ('customer','agent','system')),
  sender_id       UUID,
  message_text    TEXT NOT NULL,
  attachments     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_internal     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY ticket_messages_tenant
  ON ticket_messages
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_ticket_messages_company ON ticket_messages(company_id);
CREATE INDEX idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_sender_type ON ticket_messages(sender_type);
CREATE INDEX idx_ticket_messages_sender ON ticket_messages(sender_id);
CREATE INDEX idx_ticket_messages_created ON ticket_messages(created_at);
CREATE INDEX idx_ticket_messages_ticket_created ON ticket_messages(ticket_id, created_at);

CREATE OR REPLACE TRIGGER set_ticket_messages_updated_at
  BEFORE UPDATE ON ticket_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. kb_articles — knowledge base articles
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS kb_articles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID REFERENCES companies(id),
  title             VARCHAR(255) NOT NULL,
  slug              VARCHAR(300) NOT NULL UNIQUE,
  content           TEXT,
  category          VARCHAR(100),
  tags              JSONB NOT NULL DEFAULT '[]'::jsonb,
  status            VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','archived')),
  view_count        INT NOT NULL DEFAULT 0,
  helpful_count     INT NOT NULL DEFAULT 0,
  not_helpful_count INT NOT NULL DEFAULT 0,
  author_id         UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY kb_articles_tenant
  ON kb_articles
  USING (company_id IS NULL OR company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_kb_articles_company ON kb_articles(company_id);
CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_status ON kb_articles(status);
CREATE INDEX idx_kb_articles_category ON kb_articles(category);
CREATE INDEX idx_kb_articles_author ON kb_articles(author_id);
CREATE INDEX idx_kb_articles_company_status ON kb_articles(company_id, status);
CREATE INDEX idx_kb_articles_deleted ON kb_articles(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_kb_articles_updated_at
  BEFORE UPDATE ON kb_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. feature_requests — user feature requests
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  user_id         UUID,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  status          VARCHAR(30) NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','under_review','planned','in_progress','completed','declined')),
  priority        VARCHAR(20) NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low','normal','high','urgent')),
  category        VARCHAR(30) NOT NULL DEFAULT 'general'
                  CHECK (category IN ('general','billing','technical','feature_request','bug_report','onboarding','integration','other')),
  vote_count      INT NOT NULL DEFAULT 0,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_requests_tenant
  ON feature_requests
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_feature_requests_company ON feature_requests(company_id);
CREATE INDEX idx_feature_requests_user ON feature_requests(user_id);
CREATE INDEX idx_feature_requests_status ON feature_requests(status);
CREATE INDEX idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX idx_feature_requests_category ON feature_requests(category);
CREATE INDEX idx_feature_requests_vote_count ON feature_requests(vote_count DESC);
CREATE INDEX idx_feature_requests_company_status ON feature_requests(company_id, status);
CREATE INDEX idx_feature_requests_created ON feature_requests(created_at DESC);
CREATE INDEX idx_feature_requests_deleted ON feature_requests(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. feature_request_votes — votes on feature requests
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS feature_request_votes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  feature_request_id  UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, feature_request_id, user_id)
);

ALTER TABLE feature_request_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_request_votes_tenant
  ON feature_request_votes
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_feature_request_votes_company ON feature_request_votes(company_id);
CREATE INDEX idx_feature_request_votes_request ON feature_request_votes(feature_request_id);
CREATE INDEX idx_feature_request_votes_user ON feature_request_votes(user_id);
CREATE INDEX idx_feature_request_votes_request_user ON feature_request_votes(feature_request_id, user_id);
