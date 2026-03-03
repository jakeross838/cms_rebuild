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

// ── Contracts List ──────────────────────────────────────────────────────────

describe('useContracts', () => {
  it('fetches a list of contracts', async () => {
    const mockContracts = [
      { id: 'ctr-1', title: 'Subcontract - Plumbing', contract_type: 'subcontract', status: 'active' },
      { id: 'ctr-2', title: 'Owner Agreement', contract_type: 'prime', status: 'draft' },
    ]

    server.use(
      http.get('/api/v2/contracts', () => {
        return HttpResponse.json({ data: mockContracts, total: 2 })
      }),
    )

    const { useContracts } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockContracts, total: 2 })
  })

  it('handles server error on contracts list', async () => {
    server.use(
      http.get('/api/v2/contracts', () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      }),
    )

    const { useContracts } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContracts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeDefined()
  })
})

// ── Contract Detail ─────────────────────────────────────────────────────────

describe('useContract', () => {
  it('fetches a single contract by id', async () => {
    const mockContract = { id: 'ctr-1', title: 'Subcontract - Plumbing', contract_type: 'subcontract', status: 'active' }

    server.use(
      http.get('/api/v2/contracts/ctr-1', () => {
        return HttpResponse.json({ data: mockContract })
      }),
    )

    const { useContract } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContract('ctr-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockContract })
  })

  it('does not fetch when id is null', async () => {
    const { useContract } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContract(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Create Contract ─────────────────────────────────────────────────────────

describe('useCreateContract', () => {
  it('creates a new contract via POST', async () => {
    const newContract = {
      title: 'Electrical Subcontract',
      contract_type: 'subcontract',
      contract_number: 'SC-2026-001',
      vendor_id: 'vendor-1',
      contract_value: 45000,
    }

    server.use(
      http.post('/api/v2/contracts', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ data: { id: 'ctr-new', ...(body as any) } }, { status: 201 })
      }),
    )

    const { useCreateContract } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useCreateContract(), { wrapper: createWrapper() })

    result.current.mutate(newContract)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: { id: 'ctr-new', ...newContract } })
  })
})

// ── Contract Versions (nested) ──────────────────────────────────────────────

describe('useContractVersions', () => {
  it('fetches versions for a contract', async () => {
    const mockVersions = [
      { id: 'ver-1', contract_id: 'ctr-1', version_number: 1, status: 'current' },
    ]

    server.use(
      http.get('/api/v2/contracts/ctr-1/versions', () => {
        return HttpResponse.json({ data: mockVersions, total: 1 })
      }),
    )

    const { useContractVersions } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContractVersions('ctr-1'), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockVersions, total: 1 })
  })

  it('does not fetch versions when contractId is null', async () => {
    const { useContractVersions } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContractVersions(null), { wrapper: createWrapper() })

    expect(result.current.fetchStatus).toBe('idle')
  })
})

// ── Contract Templates ──────────────────────────────────────────────────────

describe('useContractTemplates', () => {
  it('fetches a list of contract templates', async () => {
    const mockTemplates = [
      { id: 'tpl-1', name: 'Standard Subcontract', contract_type: 'subcontract', is_active: true },
    ]

    server.use(
      http.get('/api/v2/contracts/templates', () => {
        return HttpResponse.json({ data: mockTemplates, total: 1 })
      }),
    )

    const { useContractTemplates } = await import('@/hooks/use-contracts')
    const { result } = renderHook(() => useContractTemplates(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: mockTemplates, total: 1 })
  })
})
