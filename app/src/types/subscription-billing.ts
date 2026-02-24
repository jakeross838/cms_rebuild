/**
 * Module 43: Subscription Billing Types
 */

// -- Enums ────────────────────────────────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise'

export type AddonType =
  | 'module'
  | 'storage'
  | 'users'
  | 'api_access'
  | 'support'
  | 'training'
  | 'white_label'

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'suspended'
  | 'expired'

export type BillingCycle = 'monthly' | 'annual'

export type BillingEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'invoice_created'
  | 'invoice_paid'
  | 'refund'
  | 'credit_applied'
  | 'trial_started'
  | 'trial_ended'
  | 'plan_changed'
  | 'addon_added'
  | 'addon_removed'

export type MeterType = 'storage_gb' | 'active_users' | 'api_calls' | 'ai_processing'

// -- Interfaces ───────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string | null
  tier: PlanTier
  price_monthly: number
  price_annual: number
  max_users: number | null
  max_projects: number | null
  features: Record<string, unknown>
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface PlanAddon {
  id: string
  name: string
  slug: string
  description: string | null
  addon_type: AddonType
  price_monthly: number
  price_annual: number
  is_metered: boolean
  meter_unit: string | null
  meter_price_per_unit: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CompanySubscription {
  id: string
  company_id: string
  plan_id: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  current_period_start: string | null
  current_period_end: string | null
  trial_start: string | null
  trial_end: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  grandfathered_plan: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface UsageMeter {
  id: string
  company_id: string
  addon_id: string | null
  meter_type: string
  period_start: string
  period_end: string
  quantity: number
  unit: string | null
  overage_quantity: number
  overage_cost: number
  created_at: string
  updated_at: string
}

export interface BillingEvent {
  id: string
  company_id: string
  event_type: BillingEventType
  description: string | null
  amount: number
  currency: string
  stripe_event_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// -- Constants ────────────────────────────────────────────────────────────────

export const PLAN_TIERS: { value: PlanTier; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'professional', label: 'Professional' },
  { value: 'business', label: 'Business' },
  { value: 'enterprise', label: 'Enterprise' },
]

export const ADDON_TYPES: { value: AddonType; label: string }[] = [
  { value: 'module', label: 'Module' },
  { value: 'storage', label: 'Storage' },
  { value: 'users', label: 'Users' },
  { value: 'api_access', label: 'API Access' },
  { value: 'support', label: 'Support' },
  { value: 'training', label: 'Training' },
  { value: 'white_label', label: 'White Label' },
]

export const SUBSCRIPTION_STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'trialing', label: 'Trialing' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'expired', label: 'Expired' },
]

export const BILLING_CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

export const BILLING_EVENT_TYPES: { value: BillingEventType; label: string }[] = [
  { value: 'subscription_created', label: 'Subscription Created' },
  { value: 'subscription_updated', label: 'Subscription Updated' },
  { value: 'subscription_cancelled', label: 'Subscription Cancelled' },
  { value: 'payment_succeeded', label: 'Payment Succeeded' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'invoice_created', label: 'Invoice Created' },
  { value: 'invoice_paid', label: 'Invoice Paid' },
  { value: 'refund', label: 'Refund' },
  { value: 'credit_applied', label: 'Credit Applied' },
  { value: 'trial_started', label: 'Trial Started' },
  { value: 'trial_ended', label: 'Trial Ended' },
  { value: 'plan_changed', label: 'Plan Changed' },
  { value: 'addon_added', label: 'Add-on Added' },
  { value: 'addon_removed', label: 'Add-on Removed' },
]

export const METER_TYPES: { value: MeterType; label: string }[] = [
  { value: 'storage_gb', label: 'Storage (GB)' },
  { value: 'active_users', label: 'Active Users' },
  { value: 'api_calls', label: 'API Calls' },
  { value: 'ai_processing', label: 'AI Processing' },
]
