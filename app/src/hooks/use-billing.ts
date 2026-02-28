'use client'

/**
 * Module 43: Subscription Billing React Query Hooks
 *
 * Covers subscription plans, add-ons, company subscriptions, usage meters, and billing events.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { fetchJson } from '@/lib/api/fetch'
import { createApiHooks } from '@/hooks/use-api'
import type {
  SubscriptionPlan,
  PlanAddon,
  CompanySubscription,
  UsageMeter,
  BillingEvent,
} from '@/types/subscription-billing'

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQs(params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      sp.set(key, String(val))
    }
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

// ── Subscription Plans ───────────────────────────────────────────────────────

type PlanListParams = {
  page?: number
  limit?: number
  tier?: string
  is_active?: boolean
  q?: string
}

type PlanCreateInput = {
  name: string
  slug: string
  tier: string
  price_monthly: number
  price_annual: number
  description?: string | null
  max_users?: number | null
  max_projects?: number | null
  features?: Record<string, unknown>
  is_active?: boolean
  sort_order?: number
}

const planHooks = createApiHooks<PlanListParams, PlanCreateInput>(
  'subscription-plans',
  '/api/v2/billing/plans'
)

export const useSubscriptionPlans = planHooks.useList
export const useSubscriptionPlan = planHooks.useDetail
export const useCreateSubscriptionPlan = planHooks.useCreate
export const useUpdateSubscriptionPlan = planHooks.useUpdate
export const useDeleteSubscriptionPlan = planHooks.useDelete

// ── Plan Add-ons ─────────────────────────────────────────────────────────────

type AddonListParams = {
  page?: number
  limit?: number
  addon_type?: string
  is_active?: boolean
  q?: string
}

type AddonCreateInput = {
  name: string
  slug: string
  addon_type: string
  price_monthly: number
  price_annual: number
  description?: string | null
  is_metered?: boolean
  meter_unit?: string | null
  meter_price_per_unit?: number
  is_active?: boolean
  sort_order?: number
}

const addonHooks = createApiHooks<AddonListParams, AddonCreateInput>(
  'plan-addons',
  '/api/v2/billing/addons'
)

export const usePlanAddons = addonHooks.useList
export const usePlanAddon = addonHooks.useDetail
export const useCreatePlanAddon = addonHooks.useCreate
export const useUpdatePlanAddon = addonHooks.useUpdate
export const useDeletePlanAddon = addonHooks.useDelete

// ── Company Subscriptions ────────────────────────────────────────────────────

type SubscriptionListParams = {
  page?: number
  limit?: number
  status?: string
  plan_id?: string
  billing_cycle?: string
}

type SubscriptionCreateInput = {
  plan_id: string
  billing_cycle: string
  status?: string
  trial_start?: string | null
  trial_end?: string | null
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
}

const subscriptionHooks = createApiHooks<SubscriptionListParams, SubscriptionCreateInput>(
  'subscriptions',
  '/api/v2/billing/subscriptions'
)

export const useSubscriptions = subscriptionHooks.useList
export const useSubscription = subscriptionHooks.useDetail
export const useCreateSubscription = subscriptionHooks.useCreate
export const useUpdateSubscription = subscriptionHooks.useUpdate
export const useDeleteSubscription = subscriptionHooks.useDelete

// ── Usage Meters ─────────────────────────────────────────────────────────────

type UsageListParams = {
  page?: number
  limit?: number
  meter_type?: string
  addon_id?: string
}

export function useUsageMeters(params?: UsageListParams) {
  return useQuery<{ data: UsageMeter[]; total: number }>({
    queryKey: ['usage-meters', params],
    queryFn: () =>
      fetchJson(`/api/v2/billing/usage${buildQs(params)}`),
  })
}

export function useUsageMeter(meterId: string | null) {
  return useQuery<UsageMeter>({
    queryKey: ['usage-meters', meterId],
    queryFn: () =>
      fetchJson(`/api/v2/billing/usage/${meterId}`),
    enabled: !!meterId,
  })
}

export function useCreateUsageMeter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson('/api/v2/billing/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usage-meters'] })
    },
  })
}

export function useUpdateUsageMeter(meterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetchJson(`/api/v2/billing/usage/${meterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usage-meters'] })
    },
  })
}

// ── Billing Events ───────────────────────────────────────────────────────────

type EventListParams = {
  page?: number
  limit?: number
  event_type?: string
}

export function useBillingEvents(params?: EventListParams) {
  return useQuery<{ data: BillingEvent[]; total: number }>({
    queryKey: ['billing-events', params],
    queryFn: () =>
      fetchJson(`/api/v2/billing/events${buildQs(params)}`),
  })
}

export function useBillingEvent(eventId: string | null) {
  return useQuery<BillingEvent>({
    queryKey: ['billing-events', eventId],
    queryFn: () =>
      fetchJson(`/api/v2/billing/events/${eventId}`),
    enabled: !!eventId,
  })
}

// ── Re-export types ──────────────────────────────────────────────────────────

export type { SubscriptionPlan, PlanAddon, CompanySubscription, UsageMeter, BillingEvent }
