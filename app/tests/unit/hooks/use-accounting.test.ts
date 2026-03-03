import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ── GL Accounts ─────────────────────────────────────────────────────────────

describe('useGlAccounts', () => {
  it('fetches a list of GL accounts', async () => {
    const mockAccounts = [
      { id: 'gl-1', account_number: '1000', name: 'Cash', account_type: 'asset' },
      { id: 'gl-2', account_number: '2000', name: 'Accounts Payable', account_type: 'liability' },
    ]

    server.use(
      http.get('/api/v1/gl-accounts', () => {
        return HttpResponse.json({ data: mockAccounts, total: 2 })
      }),
    )

    const { useGlAccounts } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useGlAccounts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockAccounts, total: 2 })
  })

  it('handles server error on GL accounts list', async () => {
    server.use(
      http.get('/api/v1/gl-accounts', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useGlAccounts } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useGlAccounts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── GL Account Detail ───────────────────────────────────────────────────────

describe('useGlAccount', () => {
  it('fetches a single GL account by id', async () => {
    const mockAccount = { id: 'gl-1', account_number: '1000', name: 'Cash', account_type: 'asset' }

    server.use(
      http.get('/api/v1/gl-accounts/gl-1', () => {
        return HttpResponse.json({ data: mockAccount })
      }),
    )

    const { useGlAccount } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useGlAccount('gl-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockAccount })
  })

  it('does not fetch when id is null', async () => {
    const { useGlAccount } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useGlAccount(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── AP Bills ────────────────────────────────────────────────────────────────

describe('useApBills', () => {
  it('fetches a list of AP bills', async () => {
    const mockBills = [
      { id: 'bill-1', vendor_id: 'v-1', bill_number: 'B-001', amount: 5000, status: 'pending' },
      { id: 'bill-2', vendor_id: 'v-2', bill_number: 'B-002', amount: 3200, status: 'approved' },
    ]

    server.use(
      http.get('/api/v1/ap-bills', () => {
        return HttpResponse.json({ data: mockBills, total: 2 })
      }),
    )

    const { useApBills } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useApBills(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockBills, total: 2 })
  })

  it('handles server error on AP bills list', async () => {
    server.use(
      http.get('/api/v1/ap-bills', () => {
        return HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 })
      }),
    )

    const { useApBills } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useApBills(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── AR Invoices ─────────────────────────────────────────────────────────────

describe('useArInvoices', () => {
  it('fetches a list of AR invoices', async () => {
    const mockInvoices = [
      { id: 'inv-1', client_id: 'c-1', invoice_number: 'INV-001', amount: 15000, status: 'sent' },
    ]

    server.use(
      http.get('/api/v1/ar-invoices', () => {
        return HttpResponse.json({ data: mockInvoices, total: 1 })
      }),
    )

    const { useArInvoices } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useArInvoices(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockInvoices, total: 1 })
  })

  it('handles server error on AR invoices list', async () => {
    server.use(
      http.get('/api/v1/ar-invoices', () => {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 })
      }),
    )

    const { useArInvoices } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useArInvoices(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Create GL Account (mutation) ────────────────────────────────────────────

describe('useCreateGlAccount', () => {
  it('creates a new GL account via POST', async () => {
    const newAccount = {
      account_number: '3000',
      name: 'Equity',
      account_type: 'equity',
      normal_balance: 'credit',
    }

    server.use(
      http.post('/api/v1/gl-accounts', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'gl-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateGlAccount } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useCreateGlAccount(), { wrapper: createWrapper() })

    result.current.mutate(newAccount)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'gl-new', ...newAccount } })
  })
})

// ── Journal Lines (custom nested hook) ──────────────────────────────────────

describe('useJournalLines', () => {
  it('fetches journal lines for a specific entry', async () => {
    const mockLines = [
      { id: 'jl-1', account_id: 'gl-1', debit_amount: 1000, credit_amount: 0 },
      { id: 'jl-2', account_id: 'gl-2', debit_amount: 0, credit_amount: 1000 },
    ]

    server.use(
      http.get('/api/v1/journal-entries/je-1', () => {
        return HttpResponse.json({ data: { id: 'je-1', gl_journal_lines: mockLines } })
      }),
    )

    const { useJournalLines } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useJournalLines('je-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockLines)
  })

  it('does not fetch when entryId is null', async () => {
    const { useJournalLines } = await import('@/hooks/use-accounting')
    const { result } = renderHook(() => useJournalLines(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
