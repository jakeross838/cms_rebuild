-- ============================================================================
-- Module 50: Marketing Website & Sales Pipeline
-- ============================================================================
-- V1 core tables for the public marketing website and sales pipeline:
-- marketing_leads, marketing_referrals, testimonials, case_studies, blog_posts
-- ============================================================================
-- NOTE: marketing_leads, case_studies, and blog_posts are PLATFORM-LEVEL tables
-- (no company_id). testimonials and marketing_referrals are tenant-scoped.
-- ============================================================================

-- ── Marketing Leads (Sales Pipeline — platform-level) ─────────────────────
CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'contact_form' CHECK (source IN (
    'website_trial', 'demo_request', 'contact_form', 'referral'
  )),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  company_size VARCHAR(50),
  current_tools TEXT,
  pipeline_stage TEXT NOT NULL DEFAULT 'captured' CHECK (pipeline_stage IN (
    'captured', 'qualified', 'demo_scheduled', 'demo_completed',
    'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'
  )),
  assigned_to UUID,
  deal_value DECIMAL(10, 2) DEFAULT 0,
  close_probability INT DEFAULT 0 CHECK (close_probability >= 0 AND close_probability <= 100),
  closed_at TIMESTAMPTZ,
  closed_reason TEXT CHECK (closed_reason IS NULL OR closed_reason IN (
    'won', 'lost_price', 'lost_features', 'lost_competitor', 'lost_timing'
  )),
  competitor_name VARCHAR(255),
  notes TEXT,
  crm_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketing_leads_source ON marketing_leads(source);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_email ON marketing_leads(email);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_pipeline_stage ON marketing_leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_assigned_to ON marketing_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_closed_reason ON marketing_leads(closed_reason);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_created ON marketing_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_deleted ON marketing_leads(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_marketing_leads_compound_stage ON marketing_leads(pipeline_stage, created_at DESC);

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admin access" ON marketing_leads USING (true);

CREATE TRIGGER set_updated_at_marketing_leads
  BEFORE UPDATE ON marketing_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Marketing Referrals (Referral program — tenant-scoped) ────────────────
CREATE TABLE IF NOT EXISTS marketing_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_company_id UUID NOT NULL REFERENCES companies(id),
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  referred_email VARCHAR(255) NOT NULL,
  referred_company_name VARCHAR(255),
  referred_company_id UUID,
  status TEXT NOT NULL DEFAULT 'link_created' CHECK (status IN (
    'link_created', 'clicked', 'signed_up', 'converted'
  )),
  referrer_credit DECIMAL(10, 2) DEFAULT 0,
  credit_applied BOOLEAN DEFAULT false,
  clicked_at TIMESTAMPTZ,
  signed_up_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_referrals_referrer ON marketing_referrals(referrer_company_id);
CREATE INDEX IF NOT EXISTS idx_marketing_referrals_code ON marketing_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_marketing_referrals_email ON marketing_referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_marketing_referrals_status ON marketing_referrals(status);
CREATE INDEX IF NOT EXISTS idx_marketing_referrals_referred ON marketing_referrals(referred_company_id);
CREATE INDEX IF NOT EXISTS idx_marketing_referrals_created ON marketing_referrals(created_at DESC);

ALTER TABLE marketing_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON marketing_referrals
  USING (referrer_company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_marketing_referrals
  BEFORE UPDATE ON marketing_referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Testimonials (customer testimonials — tenant-scoped) ──────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  contact_name VARCHAR(200) NOT NULL,
  contact_title VARCHAR(200),
  company_display_name VARCHAR(255),
  quote_text TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  video_url TEXT,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  display_on TEXT[] DEFAULT '{}',
  collected_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_company ON testimonials(company_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON testimonials(rating);
CREATE INDEX IF NOT EXISTS idx_testimonials_created ON testimonials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_compound ON testimonials(is_approved, is_featured);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation" ON testimonials
  USING (company_id = get_current_company_id());

CREATE TRIGGER set_updated_at_testimonials
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Case Studies (marketing content — platform-level) ─────────────────────
CREATE TABLE IF NOT EXISTS case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  company_name VARCHAR(255),
  company_size VARCHAR(50),
  challenge TEXT,
  solution TEXT,
  results TEXT,
  metrics JSONB DEFAULT '{}',
  quote_text TEXT,
  quote_author VARCHAR(200),
  photos TEXT[] DEFAULT '{}',
  industry_tags TEXT[] DEFAULT '{}',
  region_tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_published ON case_studies(is_published);
CREATE INDEX IF NOT EXISTS idx_case_studies_created ON case_studies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_published_at ON case_studies(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_studies_deleted ON case_studies(deleted_at) WHERE deleted_at IS NULL;

ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admin access" ON case_studies USING (true);

CREATE TRIGGER set_updated_at_case_studies
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Blog Posts (content marketing — platform-level) ───────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  body_html TEXT,
  author_name VARCHAR(200),
  category TEXT DEFAULT 'industry' CHECK (category IN (
    'industry', 'product', 'how_to', 'customer_spotlight'
  )),
  tags TEXT[] DEFAULT '{}',
  featured_image TEXT,
  meta_title VARCHAR(200),
  meta_description VARCHAR(500),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0 CHECK (view_count >= 0),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_deleted ON blog_posts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_compound ON blog_posts(is_published, published_at DESC);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platform admin access" ON blog_posts USING (true);

CREATE TRIGGER set_updated_at_blog_posts
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
