import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useVendorContacts,
  useVendorContact,
  useCreateVendorContact,
  useUpdateVendorContact,
  useDeleteVendorContact,
  useVendorInsurance,
  useVendorInsuranceDetail,
  useCreateVendorInsurance,
  useUpdateVendorInsurance,
  useDeleteVendorInsurance,
  useVendorCompliance,
  useCreateVendorCompliance,
  useVendorRatings,
  useCreateVendorRating,
  useContactFlat,
  useUpdateContactFlat,
  useCreateContactFlat,
  useVendorInsuranceFlat,
  useUpdateVendorInsuranceFlat,
  useCreateVendorInsuranceFlat,
} from '@/hooks/use-vendor-management'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Vendor Contacts (nested under vendor)
// ---------------------------------------------------------------------------

describe('useVendorContacts', () => {
  it('fetches contacts for a vendor', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/contacts', () =>
        HttpResponse.json({ data: [{ id: 'vc-1', name: 'John Doe' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useVendorContacts('v-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorContacts(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useVendorContact', () => {
  it('fetches a single contact by vendor and contact id', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/contacts/vc-1', () =>
        HttpResponse.json({ id: 'vc-1', name: 'John Doe' }),
      ),
    )

    const { result } = renderHook(() => useVendorContact('v-1', 'vc-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'vc-1' })
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorContact(null, 'vc-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('does not fetch when contactId is null', () => {
    const { result } = renderHook(() => useVendorContact('v-1', null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateVendorContact', () => {
  it('posts to /api/v1/vendors/:id/contacts', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v1/vendors/v-1/contacts', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'vc-new' })
      }),
    )

    const { result } = renderHook(() => useCreateVendorContact('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Jane Smith', email: 'jane@vendor.com' })
    expect(capturedBody).toMatchObject({ name: 'Jane Smith', email: 'jane@vendor.com' })
  })
})

describe('useUpdateVendorContact', () => {
  it('patches to /api/v1/vendors/:vendorId/contacts/:contactId', async () => {
    server.use(
      http.patch('/api/v1/vendors/v-1/contacts/vc-1', () =>
        HttpResponse.json({ id: 'vc-1', phone: '555-1234' }),
      ),
    )

    const { result } = renderHook(() => useUpdateVendorContact('v-1', 'vc-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ phone: '555-1234' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteVendorContact', () => {
  it('sends DELETE to /api/v1/vendors/:vendorId/contacts/:contactId', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v1/vendors/v-1/contacts/vc-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteVendorContact('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('vc-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Vendor Insurance (nested under vendor)
// ---------------------------------------------------------------------------

describe('useVendorInsurance', () => {
  it('fetches insurance records for a vendor', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/insurance', () =>
        HttpResponse.json({
          data: [{ id: 'ins-1', insurance_type: 'general_liability' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => useVendorInsurance('v-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorInsurance(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useVendorInsuranceDetail', () => {
  it('fetches a single insurance record', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/insurance/ins-1', () =>
        HttpResponse.json({ id: 'ins-1', insurance_type: 'general_liability' }),
      ),
    )

    const { result } = renderHook(() => useVendorInsuranceDetail('v-1', 'ins-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'ins-1' })
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorInsuranceDetail(null, 'ins-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateVendorInsurance', () => {
  it('posts to /api/v1/vendors/:id/insurance', async () => {
    server.use(
      http.post('/api/v1/vendors/v-1/insurance', () =>
        HttpResponse.json({ id: 'ins-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateVendorInsurance('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ insurance_type: 'workers_comp', coverage_amount: 1000000 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateVendorInsurance', () => {
  it('patches to /api/v1/vendors/:vendorId/insurance/:insuranceId', async () => {
    server.use(
      http.patch('/api/v1/vendors/v-1/insurance/ins-1', () =>
        HttpResponse.json({ id: 'ins-1', status: 'expired' }),
      ),
    )

    const { result } = renderHook(() => useUpdateVendorInsurance('v-1', 'ins-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'expired' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteVendorInsurance', () => {
  it('sends DELETE to /api/v1/vendors/:vendorId/insurance/:insuranceId', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v1/vendors/v-1/insurance/ins-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteVendorInsurance('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('ins-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Vendor Compliance
// ---------------------------------------------------------------------------

describe('useVendorCompliance', () => {
  it('fetches compliance records for a vendor', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/compliance', () =>
        HttpResponse.json({
          data: [{ id: 'comp-1', requirement_type: 'license' }],
          total: 1,
        }),
      ),
    )

    const { result } = renderHook(() => useVendorCompliance('v-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorCompliance(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateVendorCompliance', () => {
  it('posts to /api/v1/vendors/:id/compliance', async () => {
    server.use(
      http.post('/api/v1/vendors/v-1/compliance', () =>
        HttpResponse.json({ id: 'comp-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateVendorCompliance('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ requirement_type: 'certification', name: 'OSHA' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Vendor Ratings
// ---------------------------------------------------------------------------

describe('useVendorRatings', () => {
  it('fetches ratings for a vendor', async () => {
    server.use(
      http.get('/api/v1/vendors/v-1/ratings', () =>
        HttpResponse.json({ data: [{ id: 'rat-1', score: 4.5 }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useVendorRatings('v-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })

  it('does not fetch when vendorId is null', () => {
    const { result } = renderHook(() => useVendorRatings(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateVendorRating', () => {
  it('posts to /api/v1/vendors/:id/ratings', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v1/vendors/v-1/ratings', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'rat-new' })
      }),
    )

    const { result } = renderHook(() => useCreateVendorRating('v-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ score: 5, category: 'quality', job_id: 'job-1' })
    expect(capturedBody).toMatchObject({ score: 5, category: 'quality' })
  })
})

// ---------------------------------------------------------------------------
// Flat Contact Routes
// ---------------------------------------------------------------------------

describe('useContactFlat', () => {
  it('fetches from /api/v2/contacts/:id', async () => {
    server.use(
      http.get('/api/v2/contacts/c-1', () =>
        HttpResponse.json({ id: 'c-1', name: 'John Doe' }),
      ),
    )

    const { result } = renderHook(() => useContactFlat('c-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'c-1' })
  })

  it('does not fetch when contactId is null', () => {
    const { result } = renderHook(() => useContactFlat(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useUpdateContactFlat', () => {
  it('patches to /api/v2/contacts/:id', async () => {
    server.use(
      http.patch('/api/v2/contacts/c-1', () =>
        HttpResponse.json({ id: 'c-1', name: 'Updated Name' }),
      ),
    )

    const { result } = renderHook(() => useUpdateContactFlat('c-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'Updated Name' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useCreateContactFlat', () => {
  it('posts to /api/v2/contacts', async () => {
    server.use(
      http.post('/api/v2/contacts', () =>
        HttpResponse.json({ id: 'c-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateContactFlat(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ name: 'New Contact', vendor_id: 'v-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Flat Vendor Insurance Routes
// ---------------------------------------------------------------------------

describe('useVendorInsuranceFlat', () => {
  it('fetches from /api/v2/vendor-insurance/:id', async () => {
    server.use(
      http.get('/api/v2/vendor-insurance/ins-1', () =>
        HttpResponse.json({ id: 'ins-1', insurance_type: 'general_liability' }),
      ),
    )

    const { result } = renderHook(() => useVendorInsuranceFlat('ins-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'ins-1' })
  })

  it('does not fetch when insuranceId is null', () => {
    const { result } = renderHook(() => useVendorInsuranceFlat(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useUpdateVendorInsuranceFlat', () => {
  it('patches to /api/v2/vendor-insurance/:id', async () => {
    server.use(
      http.patch('/api/v2/vendor-insurance/ins-1', () =>
        HttpResponse.json({ id: 'ins-1', status: 'active' }),
      ),
    )

    const { result } = renderHook(() => useUpdateVendorInsuranceFlat('ins-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'active' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useCreateVendorInsuranceFlat', () => {
  it('posts to /api/v2/vendor-insurance', async () => {
    server.use(
      http.post('/api/v2/vendor-insurance', () =>
        HttpResponse.json({ id: 'ins-flat-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateVendorInsuranceFlat(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      vendor_id: 'v-1',
      insurance_type: 'auto',
      coverage_amount: 500000,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
