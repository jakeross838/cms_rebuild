import type { User, Company, Job, UserRole } from '@/types/database'

// Role type for the new roles table
export interface Role {
  id: string
  company_id: string
  name: string
  description: string | null
  base_role: UserRole
  is_system: boolean
  permissions: Record<string, boolean>
  field_overrides: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Auth audit log type
export interface AuthAuditLog {
  id: string
  company_id: string
  user_id: string
  event_type: string
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    company_id: crypto.randomUUID(),
    email: 'mike.carpenter@rosshomes.com',
    name: 'Mike Carpenter',
    role: 'pm',
    phone: '(555) 234-5678',
    avatar_url: null,
    is_active: true,
    last_login_at: '2026-02-10T14:22:00.000Z',
    preferences: null,
    deleted_at: null,
    created_at: '2025-08-01T09:00:00.000Z',
    updated_at: '2025-08-01T09:00:00.000Z',
    ...overrides,
  }
}

export function createMockCompany(overrides?: Partial<Company>): Company {
  return {
    id: crypto.randomUUID(),
    name: 'Ross Custom Homes',
    legal_name: 'Ross Custom Homes LLC',
    email: 'info@rosshomes.com',
    phone: '(555) 100-2000',
    website: 'https://rosshomes.com',
    address: '1200 Builder Lane',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    logo_url: null,
    primary_color: '#2563eb',
    settings: null,
    subscription_tier: 'pro',
    subscription_status: 'active',
    trial_ends_at: null,
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
    ...overrides,
  }
}

export function createMockJob(overrides?: Partial<Job>): Job {
  return {
    id: crypto.randomUUID(),
    company_id: crypto.randomUUID(),
    client_id: crypto.randomUUID(),
    job_number: 'JOB-2025-042',
    name: 'Lakewood Residence Remodel',
    address: '4500 Lakeshore Dr',
    city: 'Austin',
    state: 'TX',
    zip: '78746',
    status: 'active',
    contract_amount: 485000,
    contract_type: 'fixed_price',
    start_date: '2025-09-01',
    target_completion: '2026-03-15',
    actual_completion: null,
    notes: 'Full kitchen and master bath remodel with addition',
    version: 1,
    currency_code: 'USD',
    created_at: '2025-08-20T14:30:00.000Z',
    updated_at: '2025-08-20T14:30:00.000Z',
    ...overrides,
  }
}

export function createMockRole(overrides?: Partial<Role>): Role {
  return {
    id: crypto.randomUUID(),
    company_id: crypto.randomUUID(),
    name: 'Project Manager',
    description: 'Manages project timelines, budgets, and team coordination',
    base_role: 'pm',
    is_system: false,
    permissions: {
      'jobs.read': true,
      'jobs.write': true,
      'jobs.delete': false,
      'invoices.read': true,
      'invoices.write': true,
      'invoices.approve': true,
      'reports.read': true,
      'settings.read': false,
      'settings.write': false,
    },
    field_overrides: {},
    created_at: '2025-07-10T11:00:00.000Z',
    updated_at: '2025-07-10T11:00:00.000Z',
    deleted_at: null,
    ...overrides,
  }
}

export function createMockAuditEntry(overrides?: Partial<AuthAuditLog>): AuthAuditLog {
  return {
    id: crypto.randomUUID(),
    company_id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    event_type: 'login',
    ip_address: '192.168.1.42',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: {
      method: 'password',
      success: true,
    },
    created_at: '2026-01-20T08:15:00.000Z',
    ...overrides,
  }
}
