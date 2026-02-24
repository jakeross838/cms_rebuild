-- ============================================================================
-- Module 34: HR & Workforce Management — V1 Foundation
--
-- Tables: departments, positions, employees, employee_certifications,
--         employee_documents
-- Multi-tenant via company_id + RLS. Soft delete on employees.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. departments — organizational structure
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  name            VARCHAR(200) NOT NULL,
  description     TEXT,
  parent_id       UUID REFERENCES departments(id),
  head_user_id    UUID,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY departments_tenant
  ON departments
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_departments_company ON departments(company_id);
CREATE INDEX idx_departments_parent ON departments(parent_id);
CREATE INDEX idx_departments_active ON departments(company_id, is_active);

CREATE OR REPLACE TRIGGER set_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. positions — job titles and roles
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS positions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  department_id   UUID REFERENCES departments(id),
  pay_grade       VARCHAR(50),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY positions_tenant
  ON positions
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_positions_company ON positions(company_id);
CREATE INDEX idx_positions_department ON positions(department_id);
CREATE INDEX idx_positions_active ON positions(company_id, is_active);

CREATE OR REPLACE TRIGGER set_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. employees — employee records beyond basic users
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID NOT NULL REFERENCES companies(id),
  user_id           UUID,
  employee_number   VARCHAR(50) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  email             VARCHAR(255),
  phone             VARCHAR(20),
  hire_date         DATE NOT NULL,
  termination_date  DATE,
  department_id     UUID REFERENCES departments(id),
  position_id       UUID REFERENCES positions(id),
  employment_status VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (employment_status IN ('active','inactive','terminated','on_leave','probation')),
  employment_type   VARCHAR(20) NOT NULL DEFAULT 'full_time'
                    CHECK (employment_type IN ('full_time','part_time','contract','seasonal','temp')),
  base_wage         NUMERIC(12,2) DEFAULT 0,
  pay_type          VARCHAR(10) DEFAULT 'hourly'
                    CHECK (pay_type IN ('hourly','salary')),
  workers_comp_class VARCHAR(50),
  emergency_contact_name  VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  address           TEXT,
  notes             TEXT,
  created_by        UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY employees_tenant
  ON employees
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_position ON employees(position_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_type ON employees(employment_type);
CREATE INDEX idx_employees_company_status ON employees(company_id, employment_status);
CREATE INDEX idx_employees_company_number ON employees(company_id, employee_number);
CREATE INDEX idx_employees_deleted ON employees(deleted_at) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. employee_certifications — licenses, certs, training records
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employee_certifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID NOT NULL REFERENCES companies(id),
  employee_id         UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  certification_name  VARCHAR(255) NOT NULL,
  certification_type  VARCHAR(100),
  certification_number VARCHAR(100),
  issuing_authority   VARCHAR(200),
  issued_date         DATE,
  expiration_date     DATE,
  status              VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','expired','pending_renewal','revoked')),
  document_url        TEXT,
  notes               TEXT,
  created_by          UUID,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_certifications_tenant
  ON employee_certifications
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_emp_certs_company ON employee_certifications(company_id);
CREATE INDEX idx_emp_certs_employee ON employee_certifications(employee_id);
CREATE INDEX idx_emp_certs_status ON employee_certifications(status);
CREATE INDEX idx_emp_certs_expiration ON employee_certifications(expiration_date);
CREATE INDEX idx_emp_certs_company_status ON employee_certifications(company_id, status);
CREATE INDEX idx_emp_certs_company_employee ON employee_certifications(company_id, employee_id);

CREATE OR REPLACE TRIGGER set_employee_certifications_updated_at
  BEFORE UPDATE ON employee_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. employee_documents — HR documents (resume, contract, tax forms, etc.)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS employee_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  employee_id     UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type   VARCHAR(30) NOT NULL DEFAULT 'other'
                  CHECK (document_type IN ('resume','contract','tax_form','identification','certification','performance_review','disciplinary','other')),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  file_url        TEXT,
  file_name       VARCHAR(255),
  file_size_bytes BIGINT,
  uploaded_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_documents_tenant
  ON employee_documents
  USING (company_id = current_setting('app.current_company_id', true)::uuid);

CREATE INDEX idx_emp_docs_company ON employee_documents(company_id);
CREATE INDEX idx_emp_docs_employee ON employee_documents(employee_id);
CREATE INDEX idx_emp_docs_type ON employee_documents(document_type);
CREATE INDEX idx_emp_docs_company_employee ON employee_documents(company_id, employee_id);

CREATE OR REPLACE TRIGGER set_employee_documents_updated_at
  BEFORE UPDATE ON employee_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
