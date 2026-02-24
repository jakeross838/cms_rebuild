/**
 * Module 39: Advanced Reporting & Custom Report Builder Validation Schemas
 */

import { z } from 'zod'

// ── Enums ─────────────────────────────────────────────────────────────────

export const widgetTypeEnum = z.enum([
  'table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap',
])

export const dataSourceTypeEnum = z.enum([
  'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis', 'custom_query',
])

export const reportStatusEnum = z.enum(['draft', 'published', 'archived'])

export const customReportTypeEnum = z.enum(['standard', 'custom'])

export const dashboardLayoutEnum = z.enum(['single_column', 'two_column', 'three_column', 'grid'])

export const refreshFrequencyEnum = z.enum(['manual', 'hourly', 'daily', 'weekly'])

export const reportAudienceEnum = z.enum(['internal', 'client', 'bank', 'investor'])

export const filterContextEnum = z.enum([
  'reports', 'dashboards', 'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis',
])

// ── Custom Reports ────────────────────────────────────────────────────────

export const listCustomReportsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: reportStatusEnum.optional(),
  report_type: customReportTypeEnum.optional(),
  audience: reportAudienceEnum.optional(),
  visualization_type: widgetTypeEnum.optional(),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createCustomReportSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(10000).nullable().optional(),
  report_type: customReportTypeEnum.optional().default('custom'),
  data_sources: z.array(z.unknown()).optional().default([]),
  fields: z.array(z.unknown()).optional().default([]),
  filters: z.record(z.string(), z.unknown()).optional().default({}),
  grouping: z.array(z.unknown()).optional().default([]),
  sorting: z.array(z.unknown()).optional().default([]),
  calculated_fields: z.array(z.unknown()).optional().default([]),
  visualization_type: widgetTypeEnum.optional().default('table'),
  audience: reportAudienceEnum.optional().default('internal'),
  status: reportStatusEnum.optional().default('draft'),
  refresh_frequency: refreshFrequencyEnum.optional().default('manual'),
  is_template: z.boolean().optional().default(false),
  shared_with: z.array(z.unknown()).optional().default([]),
})

export const updateCustomReportSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  report_type: customReportTypeEnum.optional(),
  data_sources: z.array(z.unknown()).optional(),
  fields: z.array(z.unknown()).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  grouping: z.array(z.unknown()).optional(),
  sorting: z.array(z.unknown()).optional(),
  calculated_fields: z.array(z.unknown()).optional(),
  visualization_type: widgetTypeEnum.optional(),
  audience: reportAudienceEnum.optional(),
  status: reportStatusEnum.optional(),
  refresh_frequency: refreshFrequencyEnum.optional(),
  is_template: z.boolean().optional(),
  shared_with: z.array(z.unknown()).optional(),
})

// ── Custom Report Widgets ─────────────────────────────────────────────────

export const listReportWidgetsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createReportWidgetSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  widget_type: widgetTypeEnum.optional().default('table'),
  data_source: dataSourceTypeEnum.optional().default('jobs'),
  configuration: z.record(z.string(), z.unknown()).optional().default({}),
  filters: z.record(z.string(), z.unknown()).optional().default({}),
  sort_order: z.number().int().min(0).optional().default(0),
})

export const updateReportWidgetSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  widget_type: widgetTypeEnum.optional(),
  data_source: dataSourceTypeEnum.optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  sort_order: z.number().int().min(0).optional(),
})

// ── Report Dashboards ─────────────────────────────────────────────────────

export const listDashboardsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  is_default: z.preprocess((v) => {
    if (v === 'true') return true
    if (v === 'false') return false
    return v
  }, z.boolean().optional()),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createDashboardSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullable().optional(),
  layout: dashboardLayoutEnum.optional().default('two_column'),
  is_default: z.boolean().optional().default(false),
  is_admin_pushed: z.boolean().optional().default(false),
  target_roles: z.array(z.unknown()).optional().default([]),
  global_filters: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateDashboardSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  layout: dashboardLayoutEnum.optional(),
  is_default: z.boolean().optional(),
  is_admin_pushed: z.boolean().optional(),
  target_roles: z.array(z.unknown()).optional(),
  global_filters: z.record(z.string(), z.unknown()).optional(),
})

// ── Dashboard Widgets ─────────────────────────────────────────────────────

export const listDashboardWidgetsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
})

export const createDashboardWidgetSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  widget_type: widgetTypeEnum.optional().default('kpi_card'),
  data_source: dataSourceTypeEnum.optional().default('jobs'),
  report_id: z.string().uuid().nullable().optional(),
  position_x: z.number().int().min(0).optional().default(0),
  position_y: z.number().int().min(0).optional().default(0),
  width: z.number().int().min(1).max(12).optional().default(1),
  height: z.number().int().min(1).max(12).optional().default(1),
  configuration: z.record(z.string(), z.unknown()).optional().default({}),
  refresh_interval_seconds: z.number().int().min(0).max(86400).optional().default(0),
})

export const updateDashboardWidgetSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),
  widget_type: widgetTypeEnum.optional(),
  data_source: dataSourceTypeEnum.optional(),
  report_id: z.string().uuid().nullable().optional(),
  position_x: z.number().int().min(0).optional(),
  position_y: z.number().int().min(0).optional(),
  width: z.number().int().min(1).max(12).optional(),
  height: z.number().int().min(1).max(12).optional(),
  configuration: z.record(z.string(), z.unknown()).optional(),
  refresh_interval_seconds: z.number().int().min(0).max(86400).optional(),
})

// ── Saved Filters ─────────────────────────────────────────────────────────

export const listSavedFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  context: filterContextEnum.optional(),
  is_global: z.preprocess((v) => {
    if (v === 'true') return true
    if (v === 'false') return false
    return v
  }, z.boolean().optional()),
  q: z.string().trim().min(1).max(200).optional(),
})

export const createSavedFilterSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  context: filterContextEnum.optional().default('reports'),
  filter_config: z.record(z.string(), z.unknown()).optional().default({}),
  is_global: z.boolean().optional().default(false),
})

export const updateSavedFilterSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  context: filterContextEnum.optional(),
  filter_config: z.record(z.string(), z.unknown()).optional(),
  is_global: z.boolean().optional(),
})
