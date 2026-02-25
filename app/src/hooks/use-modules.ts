'use client'

/**
 * React Query hooks for all v2 API modules.
 * Generated using the createApiHooks factory.
 *
 * Usage:
 *   import { estimates, selections, permits } from '@/hooks/use-modules'
 *   const { data } = estimates.useList({ job_id: '...' })
 */

import { createApiHooks } from './use-api'

// ── Phase 2: Construction Core ──────────────────────────────────
export const timeEntries = createApiHooks('time-entries', '/api/v2/time-entries')

// ── Phase 3: Financial Power ──────────────────────────────────
export const invoiceExtractions = createApiHooks('invoice-extractions', '/api/v2/invoice-extractions')
export const quickbooksSync = createApiHooks('quickbooks-sync', '/api/v2/integrations/quickbooks')
export const financialReports = createApiHooks('financial-reports', '/api/v2/financial-reports')
export const inventory = createApiHooks('inventory', '/api/v2/inventory')

// ── Phase 4: Intelligence ──────────────────────────────────
export const estimates = createApiHooks('estimates', '/api/v2/estimates')
export const selections = createApiHooks('selections', '/api/v2/selections')
export const vendorPerformance = createApiHooks('vendor-performance', '/api/v2/vendor-performance')
export const priceIntelligence = createApiHooks('price-intelligence', '/api/v2/price-intelligence')
export const documentProcessing = createApiHooks('document-processing', '/api/v2/document-processing')
export const scheduleIntelligence = createApiHooks('schedule-intelligence', '/api/v2/schedule-intelligence')
export const bidPackages = createApiHooks('bid-packages', '/api/v2/bid-packages')

// ── Phase 5: Full Platform ──────────────────────────────────
export const clientPortal = createApiHooks('client-portal', '/api/v2/client-portal')
export const vendorPortal = createApiHooks('vendor-portal', '/api/v2/vendor-portal')
export const warranties = createApiHooks('warranties', '/api/v2/warranties')
export const permits = createApiHooks('permits', '/api/v2/permits')
export const inspections = createApiHooks('inspections', '/api/v2/inspections')
export const safetyIncidents = createApiHooks('safety-incidents', '/api/v2/safety/incidents')
export const toolboxTalks = createApiHooks('toolbox-talks', '/api/v2/safety/toolbox-talks')
export const employees = createApiHooks('employees', '/api/v2/hr/employees')
export const equipment = createApiHooks('equipment', '/api/v2/equipment')
export const leads = createApiHooks('leads', '/api/v2/leads')
export const portfolioProjects = createApiHooks('portfolio-projects', '/api/v2/marketing/portfolio')
export const contracts = createApiHooks('contracts', '/api/v2/contracts')
export const reportDefinitions = createApiHooks('report-definitions', '/api/v2/reports')

// ── Phase 6: Scale & Sell ──────────────────────────────────
export const onboarding = createApiHooks('onboarding', '/api/v2/onboarding')
export const dataMigration = createApiHooks('data-migration', '/api/v2/data-migration')
export const subscriptionPlans = createApiHooks('subscription-plans', '/api/v2/billing/plans')
export const branding = createApiHooks('branding', '/api/v2/white-label/branding')
export const apiKeys = createApiHooks('api-keys', '/api/v2/api-marketplace/keys')
export const integrationListings = createApiHooks('integration-listings', '/api/v2/api-marketplace/integrations')
export const supportTickets = createApiHooks('support-tickets', '/api/v2/support/tickets')
export const kbArticles = createApiHooks('kb-articles', '/api/v2/support/kb')
export const trainingCourses = createApiHooks('training-courses', '/api/v2/training/courses')
export const marketplaceTemplates = createApiHooks('marketplace-templates', '/api/v2/marketplace/templates')
export const platformMetrics = createApiHooks('platform-metrics', '/api/v2/analytics/metrics')
export const marketingLeads = createApiHooks('marketing-leads', '/api/v2/marketing-website/leads')
