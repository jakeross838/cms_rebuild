/**
 * Company Settings API
 *
 * GET /api/v1/settings/company - Get company settings
 * PATCH /api/v1/settings/company - Update company settings
 */

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { createApiHandler, mapDbError, type ApiContext } from '@/lib/api/middleware'
import { getCompanySettings, updateCompanySettings, clearConfigCache } from '@/lib/config'
import type { ConfigSection } from '@/lib/config/types'
import { createClient } from '@/lib/supabase/server'
import type { Company, Json } from '@/types/database'

// ============================================================================
// GET - Get Company Settings
// ============================================================================

async function handleGet(_req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const supabase = await createClient()

  // Get company profile
  const { data: companyData, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  const company = companyData as Company | null

  if (error || !company) {
    return NextResponse.json(
      { error: 'Not Found', message: 'Company not found', requestId: ctx.requestId },
      { status: 404 }
    )
  }

  // Get resolved settings
  const settings = await getCompanySettings(companyId)

  return NextResponse.json({
    company: {
      id: company.id,
      name: company.name,
      legalName: company.legal_name,
      email: company.email,
      phone: company.phone,
      website: company.website,
      address: company.address,
      city: company.city,
      state: company.state,
      zip: company.zip,
      logoUrl: company.logo_url,
      primaryColor: company.primary_color,
      subscriptionTier: company.subscription_tier,
      subscriptionStatus: company.subscription_status,
      trialEndsAt: company.trial_ends_at,
      createdAt: company.created_at,
      updatedAt: company.updated_at,
    },
    settings,
    requestId: ctx.requestId,
  })
}

export const GET = createApiHandler(handleGet, {
  requireAuth: true,
})

// ============================================================================
// PATCH - Update Company Settings
// ============================================================================

const updateCompanySchema = z.object({
  // Company profile fields
  name: z.string().min(1).max(255).optional(),
  legalName: z.string().max(255).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  website: z.string().url().optional().nullable(),
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zip: z.string().max(20).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),

  // Settings (grouped by section)
  settings: z.object({
    // Financial
    invoiceApprovalThreshold: z.number().min(0).optional(),
    poApprovalThreshold: z.number().min(0).optional(),
    defaultMarkupPercent: z.number().min(0).max(100).optional(),
    defaultRetainagePercent: z.number().min(0).max(100).optional(),
    defaultPaymentTerms: z.string().optional(),
    fiscalYearStartMonth: z.number().min(1).max(12).optional(),

    // Regional
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    currency: z.string().length(3).optional(),
    measurementSystem: z.enum(['imperial', 'metric']).optional(),

    // AI
    autoMatchConfidence: z.number().min(0).max(100).optional(),
    costCodeSuggestionEnabled: z.boolean().optional(),
    riskDetectionEnabled: z.boolean().optional(),
    invoiceAutoRouteThreshold: z.number().min(0).optional(),

    // Portal
    clientPortalEnabled: z.boolean().optional(),
    vendorPortalEnabled: z.boolean().optional(),
    allowClientPhotoUpload: z.boolean().optional(),
    showBudgetToClients: z.boolean().optional(),

    // Notifications
    emailNotificationsEnabled: z.boolean().optional(),
    pushNotificationsEnabled: z.boolean().optional(),
    digestFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']).optional(),
  }).optional(),
})

type UpdateCompanyInput = z.infer<typeof updateCompanySchema>

async function handlePatch(req: NextRequest, ctx: ApiContext) {
  const companyId = ctx.companyId!
  const body = ctx.validatedBody as UpdateCompanyInput
  const supabase = await createClient()

  // Build company profile update
  const profileUpdate: Record<string, unknown> = {}
  if (body.name !== undefined) profileUpdate.name = body.name
  if (body.legalName !== undefined) profileUpdate.legal_name = body.legalName
  if (body.email !== undefined) profileUpdate.email = body.email
  if (body.phone !== undefined) profileUpdate.phone = body.phone
  if (body.website !== undefined) profileUpdate.website = body.website
  if (body.address !== undefined) profileUpdate.address = body.address
  if (body.city !== undefined) profileUpdate.city = body.city
  if (body.state !== undefined) profileUpdate.state = body.state
  if (body.zip !== undefined) profileUpdate.zip = body.zip
  if (body.logoUrl !== undefined) profileUpdate.logo_url = body.logoUrl
  if (body.primaryColor !== undefined) profileUpdate.primary_color = body.primaryColor

  // Update company profile if there are changes
  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase
      .from('companies')
      .update(profileUpdate)
      .eq('id', companyId)

    if (error) {
      const mapped = mapDbError(error)
      return NextResponse.json(
        { error: mapped.error, message: mapped.message, requestId: ctx.requestId },
        { status: mapped.status }
      )
    }
  }

  // Build settings updates
  if (body.settings) {
    const settingsToUpdate: Array<{ section: ConfigSection; key: string; value: Json }> = []

    // Map settings to section/key pairs
    const settingsMap: Record<string, { section: ConfigSection; key: string }> = {
      invoiceApprovalThreshold: { section: 'financial', key: 'invoice_approval_threshold' },
      poApprovalThreshold: { section: 'financial', key: 'po_approval_threshold' },
      defaultMarkupPercent: { section: 'financial', key: 'default_markup_percent' },
      defaultRetainagePercent: { section: 'financial', key: 'default_retainage_percent' },
      defaultPaymentTerms: { section: 'financial', key: 'default_payment_terms' },
      fiscalYearStartMonth: { section: 'financial', key: 'fiscal_year_start_month' },
      timezone: { section: 'regional', key: 'timezone' },
      dateFormat: { section: 'regional', key: 'date_format' },
      currency: { section: 'regional', key: 'currency' },
      measurementSystem: { section: 'regional', key: 'measurement_system' },
      autoMatchConfidence: { section: 'ai', key: 'auto_match_confidence' },
      costCodeSuggestionEnabled: { section: 'ai', key: 'cost_code_suggestion_enabled' },
      riskDetectionEnabled: { section: 'ai', key: 'risk_detection_enabled' },
      invoiceAutoRouteThreshold: { section: 'ai', key: 'invoice_auto_route_threshold' },
      clientPortalEnabled: { section: 'portal', key: 'client_portal_enabled' },
      vendorPortalEnabled: { section: 'portal', key: 'vendor_portal_enabled' },
      allowClientPhotoUpload: { section: 'portal', key: 'allow_client_photo_upload' },
      showBudgetToClients: { section: 'portal', key: 'show_budget_to_clients' },
      emailNotificationsEnabled: { section: 'notifications', key: 'email_notifications_enabled' },
      pushNotificationsEnabled: { section: 'notifications', key: 'push_notifications_enabled' },
      digestFrequency: { section: 'notifications', key: 'digest_frequency' },
    }

    for (const [settingKey, value] of Object.entries(body.settings)) {
      if (value !== undefined && settingsMap[settingKey]) {
        const { section, key } = settingsMap[settingKey]
        settingsToUpdate.push({ section, key, value: value as Json })
      }
    }

    if (settingsToUpdate.length > 0) {
      await updateCompanySettings(companyId, settingsToUpdate)
    }
  }

  // Clear cache and return updated data
  clearConfigCache(companyId)

  // Fetch updated company and settings
  const { data: updatedCompanyData } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  const updatedCompany = updatedCompanyData as unknown as Company

  const settings = await getCompanySettings(companyId)

  return NextResponse.json({
    company: {
      id: updatedCompany.id,
      name: updatedCompany.name,
      legalName: updatedCompany.legal_name,
      email: updatedCompany.email,
      phone: updatedCompany.phone,
      website: updatedCompany.website,
      address: updatedCompany.address,
      city: updatedCompany.city,
      state: updatedCompany.state,
      zip: updatedCompany.zip,
      logoUrl: updatedCompany.logo_url,
      primaryColor: updatedCompany.primary_color,
      subscriptionTier: updatedCompany.subscription_tier,
      subscriptionStatus: updatedCompany.subscription_status,
      trialEndsAt: updatedCompany.trial_ends_at,
      createdAt: updatedCompany.created_at,
      updatedAt: updatedCompany.updated_at,
    },
    settings,
    requestId: ctx.requestId,
  })
}

export const PATCH = createApiHandler(handlePatch, {
  requireAuth: true,
  requiredRoles: ['owner', 'admin'],
  schema: updateCompanySchema,
  auditAction: 'settings.company.update',
})
