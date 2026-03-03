import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import React from 'react'

import {
  useSubscriptionPlans,
  useSubscriptionPlan,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  usePlanAddons,
  usePlanAddon,
  useCreatePlanAddon,
  useUpdatePlanAddon,
  useDeletePlanAddon,
  useSubscriptions,
  useSubscription,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
  useUsageMeters,
  useUsageMeter,
  useCreateUsageMeter,
  useUpdateUsageMeter,
  useBillingEvents,
  useBillingEvent,
} from '@/hooks/use-billing'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

// ---------------------------------------------------------------------------
// Subscription Plans (factory-based)
// ---------------------------------------------------------------------------

describe('useSubscriptionPlans', () => {
  it('fetches from /api/v2/billing/plans', async () => {
    server.use(
      http.get('/api/v2/billing/plans', () =>
        HttpResponse.json({ data: [{ id: 'plan-1', name: 'Pro' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useSubscriptionPlans(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'plan-1', name: 'Pro' }], total: 1 })
  })
})

describe('useSubscriptionPlan', () => {
  it('fetches a single plan by id', async () => {
    server.use(
      http.get('/api/v2/billing/plans/plan-1', () =>
        HttpResponse.json({ id: 'plan-1', name: 'Pro' }),
      ),
    )

    const { result } = renderHook(() => useSubscriptionPlan('plan-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'plan-1' })
  })

  it('does not fetch when id is null', () => {
    const { result } = renderHook(() => useSubscriptionPlan(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateSubscriptionPlan', () => {
  it('posts to /api/v2/billing/plans', async () => {
    let capturedBody: Record<string, unknown> | null = null
    server.use(
      http.post('/api/v2/billing/plans', async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'plan-new' })
      }),
    )

    const { result } = renderHook(() => useCreateSubscriptionPlan(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      name: 'Enterprise',
      slug: 'enterprise',
      tier: 'enterprise',
      price_monthly: 299,
      price_annual: 2990,
    })
    expect(capturedBody).toMatchObject({ name: 'Enterprise', tier: 'enterprise' })
  })
})

describe('useUpdateSubscriptionPlan', () => {
  it('patches to /api/v2/billing/plans/:id', async () => {
    server.use(
      http.patch('/api/v2/billing/plans/plan-1', () =>
        HttpResponse.json({ id: 'plan-1', is_active: false }),
      ),
    )

    const { result } = renderHook(() => useUpdateSubscriptionPlan('plan-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ is_active: false } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteSubscriptionPlan', () => {
  it('sends DELETE to /api/v2/billing/plans/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/billing/plans/plan-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteSubscriptionPlan(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('plan-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Plan Add-ons (factory-based)
// ---------------------------------------------------------------------------

describe('usePlanAddons', () => {
  it('fetches from /api/v2/billing/addons', async () => {
    server.use(
      http.get('/api/v2/billing/addons', () =>
        HttpResponse.json({ data: [{ id: 'addon-1', name: 'Extra Storage' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => usePlanAddons(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'addon-1', name: 'Extra Storage' }], total: 1 })
  })
})

describe('usePlanAddon', () => {
  it('fetches a single addon by id', async () => {
    server.use(
      http.get('/api/v2/billing/addons/addon-1', () =>
        HttpResponse.json({ id: 'addon-1', name: 'Extra Storage' }),
      ),
    )

    const { result } = renderHook(() => usePlanAddon('addon-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'addon-1' })
  })
})

describe('useCreatePlanAddon', () => {
  it('posts to /api/v2/billing/addons', async () => {
    server.use(
      http.post('/api/v2/billing/addons', () =>
        HttpResponse.json({ id: 'addon-new' }),
      ),
    )

    const { result } = renderHook(() => useCreatePlanAddon(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      name: 'API Access',
      slug: 'api-access',
      addon_type: 'feature',
      price_monthly: 49,
      price_annual: 490,
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdatePlanAddon', () => {
  it('patches to /api/v2/billing/addons/:id', async () => {
    server.use(
      http.patch('/api/v2/billing/addons/addon-1', () =>
        HttpResponse.json({ id: 'addon-1', is_active: false }),
      ),
    )

    const { result } = renderHook(() => useUpdatePlanAddon('addon-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ is_active: false } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeletePlanAddon', () => {
  it('sends DELETE to /api/v2/billing/addons/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/billing/addons/addon-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeletePlanAddon(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('addon-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Company Subscriptions (factory-based)
// ---------------------------------------------------------------------------

describe('useSubscriptions', () => {
  it('fetches from /api/v2/billing/subscriptions', async () => {
    server.use(
      http.get('/api/v2/billing/subscriptions', () =>
        HttpResponse.json({ data: [{ id: 'sub-1', status: 'active' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [{ id: 'sub-1', status: 'active' }], total: 1 })
  })
})

describe('useSubscription', () => {
  it('fetches a single subscription by id', async () => {
    server.use(
      http.get('/api/v2/billing/subscriptions/sub-1', () =>
        HttpResponse.json({ id: 'sub-1', status: 'active' }),
      ),
    )

    const { result } = renderHook(() => useSubscription('sub-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'sub-1' })
  })
})

describe('useCreateSubscription', () => {
  it('posts to /api/v2/billing/subscriptions', async () => {
    server.use(
      http.post('/api/v2/billing/subscriptions', () =>
        HttpResponse.json({ id: 'sub-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateSubscription(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ plan_id: 'plan-1', billing_cycle: 'monthly' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateSubscription', () => {
  it('patches to /api/v2/billing/subscriptions/:id', async () => {
    server.use(
      http.patch('/api/v2/billing/subscriptions/sub-1', () =>
        HttpResponse.json({ id: 'sub-1', status: 'cancelled' }),
      ),
    )

    const { result } = renderHook(() => useUpdateSubscription('sub-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ status: 'cancelled' } as any)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useDeleteSubscription', () => {
  it('sends DELETE to /api/v2/billing/subscriptions/:id', async () => {
    let deleteCalled = false
    server.use(
      http.delete('/api/v2/billing/subscriptions/sub-1', () => {
        deleteCalled = true
        return HttpResponse.json({ success: true })
      }),
    )

    const { result } = renderHook(() => useDeleteSubscription(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync('sub-1')
    expect(deleteCalled).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Usage Meters (custom hooks)
// ---------------------------------------------------------------------------

describe('useUsageMeters', () => {
  it('fetches from /api/v2/billing/usage', async () => {
    server.use(
      http.get('/api/v2/billing/usage', () =>
        HttpResponse.json({ data: [{ id: 'meter-1', meter_type: 'storage' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useUsageMeters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })
})

describe('useUsageMeter', () => {
  it('fetches a single meter by id', async () => {
    server.use(
      http.get('/api/v2/billing/usage/meter-1', () =>
        HttpResponse.json({ id: 'meter-1', meter_type: 'storage' }),
      ),
    )

    const { result } = renderHook(() => useUsageMeter('meter-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'meter-1' })
  })

  it('does not fetch when meterId is null', () => {
    const { result } = renderHook(() => useUsageMeter(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})

describe('useCreateUsageMeter', () => {
  it('posts to /api/v2/billing/usage', async () => {
    server.use(
      http.post('/api/v2/billing/usage', () =>
        HttpResponse.json({ id: 'meter-new' }),
      ),
    )

    const { result } = renderHook(() => useCreateUsageMeter(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ meter_type: 'api_calls', addon_id: 'addon-1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUpdateUsageMeter', () => {
  it('patches to /api/v2/billing/usage/:id', async () => {
    server.use(
      http.patch('/api/v2/billing/usage/meter-1', () =>
        HttpResponse.json({ id: 'meter-1', current_usage: 500 }),
      ),
    )

    const { result } = renderHook(() => useUpdateUsageMeter('meter-1'), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({ current_usage: 500 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

// ---------------------------------------------------------------------------
// Billing Events (custom hooks)
// ---------------------------------------------------------------------------

describe('useBillingEvents', () => {
  it('fetches from /api/v2/billing/events', async () => {
    server.use(
      http.get('/api/v2/billing/events', () =>
        HttpResponse.json({ data: [{ id: 'ev-1', event_type: 'payment' }], total: 1 }),
      ),
    )

    const { result } = renderHook(() => useBillingEvents(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.data).toHaveLength(1)
  })
})

describe('useBillingEvent', () => {
  it('fetches a single billing event by id', async () => {
    server.use(
      http.get('/api/v2/billing/events/ev-1', () =>
        HttpResponse.json({ id: 'ev-1', event_type: 'payment' }),
      ),
    )

    const { result } = renderHook(() => useBillingEvent('ev-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ id: 'ev-1' })
  })

  it('does not fetch when eventId is null', () => {
    const { result } = renderHook(() => useBillingEvent(null), {
      wrapper: createWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })
})
