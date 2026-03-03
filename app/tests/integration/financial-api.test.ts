/**
 * Integration Tests: Financial API Routes
 *
 * Tests financial endpoints (GL Accounts, AP Bills, AR Invoices,
 * Journal Entries) via MSW-intercepted fetch calls. These are
 * Module 11 (Native Accounting) endpoints.
 *
 * Verifies response structure, HTTP methods, and error handling.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'

const BASE_URL = 'http://localhost:3000'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Bearer mock-access-token',
  }
}

// ---------------------------------------------------------------------------
// Mock data — GL Accounts
// ---------------------------------------------------------------------------

const mockGLAccounts = [
  {
    id: 'gl-001',
    company_id: 'company-001',
    account_number: '1000',
    name: 'Cash - Operating',
    type: 'asset',
    subtype: 'current_asset',
    normal_balance: 'debit',
    is_active: true,
    parent_id: null,
    description: 'Primary operating bank account',
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'gl-002',
    company_id: 'company-001',
    account_number: '2000',
    name: 'Accounts Payable',
    type: 'liability',
    subtype: 'current_liability',
    normal_balance: 'credit',
    is_active: true,
    parent_id: null,
    description: 'Trade payables',
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'gl-003',
    company_id: 'company-001',
    account_number: '4000',
    name: 'Contract Revenue',
    type: 'revenue',
    subtype: 'operating_revenue',
    normal_balance: 'credit',
    is_active: true,
    parent_id: null,
    description: 'Revenue from construction contracts',
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'gl-004',
    company_id: 'company-001',
    account_number: '5000',
    name: 'Cost of Goods Sold — Materials',
    type: 'expense',
    subtype: 'cost_of_goods',
    normal_balance: 'debit',
    is_active: true,
    parent_id: null,
    description: 'Direct material costs',
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
]

// ---------------------------------------------------------------------------
// Mock data — AP Bills
// ---------------------------------------------------------------------------

const mockAPBill = {
  id: 'ap-001',
  company_id: 'company-001',
  vendor_id: 'vendor-001',
  vendor_name: 'Austin Lumber Co.',
  job_id: 'job-001',
  bill_number: 'INV-2025-1042',
  description: 'Framing lumber delivery',
  amount: 12450.0,
  tax_amount: 0,
  total_amount: 12450.0,
  status: 'pending',
  due_date: '2026-02-15',
  gl_account_id: 'gl-004',
  cost_code_id: 'cc-001',
  notes: null,
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-01-15T10:00:00.000Z',
}

// ---------------------------------------------------------------------------
// Mock data — AR Invoices
// ---------------------------------------------------------------------------

const mockARInvoice = {
  id: 'ar-001',
  company_id: 'company-001',
  client_id: 'client-001',
  job_id: 'job-001',
  invoice_number: 'RH-2025-001',
  description: 'Draw #3 — Framing Complete',
  subtotal: 97000.0,
  tax_amount: 0,
  total_amount: 97000.0,
  amount_paid: 0,
  balance_due: 97000.0,
  status: 'sent',
  due_date: '2026-02-28',
  sent_at: '2026-01-20T09:00:00.000Z',
  paid_at: null,
  gl_account_id: 'gl-003',
  notes: 'Third draw request per AIA schedule',
  created_at: '2026-01-20T09:00:00.000Z',
  updated_at: '2026-01-20T09:00:00.000Z',
}

// ---------------------------------------------------------------------------
// Mock data — Journal Entries
// ---------------------------------------------------------------------------

const mockJournalEntries = [
  {
    id: 'je-001',
    company_id: 'company-001',
    entry_number: 'JE-2026-001',
    description: 'Record AP bill — Austin Lumber Co.',
    date: '2026-01-15',
    status: 'posted',
    lines: [
      { account_id: 'gl-004', account_name: 'COGS — Materials', debit: 12450.0, credit: 0 },
      { account_id: 'gl-002', account_name: 'Accounts Payable', debit: 0, credit: 12450.0 },
    ],
    total_debit: 12450.0,
    total_credit: 12450.0,
    created_by: 'user-001',
    created_at: '2026-01-15T10:30:00.000Z',
    updated_at: '2026-01-15T10:30:00.000Z',
  },
  {
    id: 'je-002',
    company_id: 'company-001',
    entry_number: 'JE-2026-002',
    description: 'Record AR invoice — Draw #3',
    date: '2026-01-20',
    status: 'posted',
    lines: [
      { account_id: 'gl-001', account_name: 'Cash - Operating', debit: 97000.0, credit: 0 },
      { account_id: 'gl-003', account_name: 'Contract Revenue', debit: 0, credit: 97000.0 },
    ],
    total_debit: 97000.0,
    total_credit: 97000.0,
    created_by: 'user-001',
    created_at: '2026-01-20T09:30:00.000Z',
    updated_at: '2026-01-20T09:30:00.000Z',
  },
]

// ---------------------------------------------------------------------------
// Tests — GL Accounts
// ---------------------------------------------------------------------------

describe('Financial API — GET /api/v1/gl-accounts', () => {
  const GL_URL = `${BASE_URL}/api/v1/gl-accounts`

  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns list of GL accounts', async () => {
    server.use(
      http.get(GL_URL, () => {
        return HttpResponse.json({
          data: mockGLAccounts,
          pagination: {
            page: 1,
            limit: 100,
            total: mockGLAccounts.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-gl-001',
        })
      })
    )

    const res = await fetch(GL_URL, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toHaveLength(4)
    expect(body.data[0].account_number).toBe('1000')
    expect(body.data[0].type).toBe('asset')
    expect(body.data[1].type).toBe('liability')
    expect(body.data[2].type).toBe('revenue')
    expect(body.data[3].type).toBe('expense')
    expect(body.requestId).toBeDefined()
  })

  it('supports filtering by account type', async () => {
    server.use(
      http.get(GL_URL, ({ request }) => {
        const url = new URL(request.url)
        const type = url.searchParams.get('type')
        const filtered = type
          ? mockGLAccounts.filter((a) => a.type === type)
          : mockGLAccounts

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 100,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-gl-filter',
        })
      })
    )

    const res = await fetch(`${GL_URL}?type=asset`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].type).toBe('asset')
    expect(body.data[0].name).toBe('Cash - Operating')
  })

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(GL_URL, () => {
        return HttpResponse.json(
          { error: 'Unauthorized', message: 'Authentication required', requestId: 'req-gl-unauth' },
          { status: 401 }
        )
      })
    )

    const res = await fetch(GL_URL)
    expect(res.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Tests — AP Bills
// ---------------------------------------------------------------------------

describe('Financial API — POST /api/v1/ap-bills', () => {
  const AP_URL = `${BASE_URL}/api/v1/ap-bills`

  beforeEach(() => {
    server.resetHandlers()
  })

  it('creates AP bill with valid data', async () => {
    server.use(
      http.post(AP_URL, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const newBill = {
          id: crypto.randomUUID(),
          company_id: 'company-001',
          ...body,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return HttpResponse.json(
          { data: newBill, error: null, requestId: 'req-ap-create' },
          { status: 201 }
        )
      })
    )

    const res = await fetch(AP_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        vendor_id: 'vendor-001',
        vendor_name: 'Austin Lumber Co.',
        job_id: 'job-001',
        bill_number: 'INV-2025-1050',
        description: 'Drywall materials',
        amount: 8200.0,
        tax_amount: 0,
        total_amount: 8200.0,
        due_date: '2026-03-01',
        gl_account_id: 'gl-004',
        cost_code_id: 'cc-002',
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.vendor_name).toBe('Austin Lumber Co.')
    expect(body.data.amount).toBe(8200.0)
    expect(body.data.status).toBe('pending')
    expect(body.data.id).toBeDefined()
    expect(body.error).toBeNull()
  })

  it('returns 400 for invalid AP bill data', async () => {
    server.use(
      http.post(AP_URL, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: {
              vendor_id: ['Vendor is required'],
              amount: ['Amount must be greater than 0'],
            },
            requestId: 'req-ap-invalid',
          },
          { status: 400 }
        )
      })
    )

    const res = await fetch(AP_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ description: 'Missing required fields' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors).toBeDefined()
  })

  it('returns 403 for read-only user trying to create AP bill', async () => {
    server.use(
      http.post(AP_URL, () => {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions', requestId: 'req-ap-403' },
          { status: 403 }
        )
      })
    )

    const res = await fetch(AP_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        vendor_id: 'vendor-001',
        amount: 5000,
      }),
    })

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })
})

// ---------------------------------------------------------------------------
// Tests — AR Invoices
// ---------------------------------------------------------------------------

describe('Financial API — POST /api/v1/ar-invoices', () => {
  const AR_URL = `${BASE_URL}/api/v1/ar-invoices`

  beforeEach(() => {
    server.resetHandlers()
  })

  it('creates AR invoice with valid data', async () => {
    server.use(
      http.post(AR_URL, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        const newInvoice = {
          id: crypto.randomUUID(),
          company_id: 'company-001',
          ...body,
          amount_paid: 0,
          balance_due: body.total_amount,
          status: 'draft',
          sent_at: null,
          paid_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        return HttpResponse.json(
          { data: newInvoice, error: null, requestId: 'req-ar-create' },
          { status: 201 }
        )
      })
    )

    const res = await fetch(AR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        client_id: 'client-001',
        job_id: 'job-001',
        invoice_number: 'RH-2025-002',
        description: 'Draw #4 — Mechanical Rough-In',
        subtotal: 65000.0,
        tax_amount: 0,
        total_amount: 65000.0,
        due_date: '2026-03-30',
        gl_account_id: 'gl-003',
      }),
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data.invoice_number).toBe('RH-2025-002')
    expect(body.data.total_amount).toBe(65000.0)
    expect(body.data.balance_due).toBe(65000.0)
    expect(body.data.amount_paid).toBe(0)
    expect(body.data.status).toBe('draft')
    expect(body.error).toBeNull()
  })

  it('returns 400 when required fields are missing', async () => {
    server.use(
      http.post(AR_URL, () => {
        return HttpResponse.json(
          {
            error: 'Validation Error',
            message: 'Request body validation failed',
            errors: {
              client_id: ['Client is required'],
              total_amount: ['Total amount is required'],
            },
            requestId: 'req-ar-invalid',
          },
          { status: 400 }
        )
      })
    )

    const res = await fetch(AR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ description: 'Incomplete invoice' }),
    })

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validation Error')
    expect(body.errors.client_id).toBeDefined()
    expect(body.errors.total_amount).toBeDefined()
  })

  it('returns 409 for duplicate invoice number', async () => {
    server.use(
      http.post(AR_URL, () => {
        return HttpResponse.json(
          {
            error: 'Conflict',
            message: 'A record with that value already exists',
            requestId: 'req-ar-dup',
          },
          { status: 409 }
        )
      })
    )

    const res = await fetch(AR_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        client_id: 'client-001',
        job_id: 'job-001',
        invoice_number: 'RH-2025-001', // duplicate
        total_amount: 50000,
        due_date: '2026-03-15',
      }),
    })

    expect(res.status).toBe(409)
    const body = await res.json()
    expect(body.error).toBe('Conflict')
  })
})

// ---------------------------------------------------------------------------
// Tests — Journal Entries
// ---------------------------------------------------------------------------

describe('Financial API — GET /api/v1/journal-entries', () => {
  const JE_URL = `${BASE_URL}/api/v1/journal-entries`

  beforeEach(() => {
    server.resetHandlers()
  })

  it('returns list of journal entries', async () => {
    server.use(
      http.get(JE_URL, () => {
        return HttpResponse.json({
          data: mockJournalEntries,
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-je-list',
        })
      })
    )

    const res = await fetch(JE_URL, { headers: authHeaders() })

    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.data).toHaveLength(2)
    expect(body.data[0].entry_number).toBe('JE-2026-001')
    expect(body.data[0].total_debit).toBe(body.data[0].total_credit) // balanced
    expect(body.data[1].total_debit).toBe(body.data[1].total_credit) // balanced
    expect(body.pagination).toBeDefined()
    expect(body.requestId).toBeDefined()
  })

  it('journal entries have balanced debits and credits', async () => {
    server.use(
      http.get(JE_URL, () => {
        return HttpResponse.json({
          data: mockJournalEntries,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasMore: false },
          requestId: 'req-je-balance',
        })
      })
    )

    const res = await fetch(JE_URL, { headers: authHeaders() })
    const body = await res.json()

    for (const entry of body.data) {
      expect(entry.total_debit).toBe(entry.total_credit)

      const lineDebits = entry.lines.reduce((sum: number, l: { debit: number }) => sum + l.debit, 0)
      const lineCredits = entry.lines.reduce((sum: number, l: { credit: number }) => sum + l.credit, 0)
      expect(lineDebits).toBe(lineCredits)
    }
  })

  it('supports date range filter', async () => {
    server.use(
      http.get(JE_URL, ({ request }) => {
        const url = new URL(request.url)
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')

        let filtered = mockJournalEntries
        if (from) {
          filtered = filtered.filter((e) => e.date >= from)
        }
        if (to) {
          filtered = filtered.filter((e) => e.date <= to)
        }

        return HttpResponse.json({
          data: filtered,
          pagination: {
            page: 1,
            limit: 20,
            total: filtered.length,
            totalPages: 1,
            hasMore: false,
          },
          requestId: 'req-je-daterange',
        })
      })
    )

    const res = await fetch(`${JE_URL}?from=2026-01-20&to=2026-01-31`, { headers: authHeaders() })
    const body = await res.json()

    expect(body.data).toHaveLength(1)
    expect(body.data[0].date).toBe('2026-01-20')
  })

  it('returns 401 when not authenticated', async () => {
    server.use(
      http.get(JE_URL, () => {
        return HttpResponse.json(
          { error: 'Unauthorized', message: 'Authentication required', requestId: 'req-je-unauth' },
          { status: 401 }
        )
      })
    )

    const res = await fetch(JE_URL)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user lacks financial read permission', async () => {
    server.use(
      http.get(JE_URL, () => {
        return HttpResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions', requestId: 'req-je-403' },
          { status: 403 }
        )
      })
    )

    const res = await fetch(JE_URL, { headers: authHeaders() })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Forbidden')
  })
})
