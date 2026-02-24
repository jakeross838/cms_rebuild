/**
 * Module 39 — Advanced Reporting & Custom Report Builder Acceptance Tests
 *
 * Pure function tests (no DB required). Validates types, schemas,
 * and constants against the Module 39 spec.
 */

import { describe, test, expect } from 'vitest'

// ── Types ─────────────────────────────────────────────────────────────────

import type {
  WidgetType,
  DataSourceType,
  ReportStatus,
  CustomReportType,
  DashboardLayout,
  RefreshFrequency,
  ReportAudience,
  FilterContext,
  CustomReport,
  CustomReportWidget,
  ReportDashboard,
  DashboardWidget,
  SavedFilter,
} from '@/types/advanced-reporting'

import {
  WIDGET_TYPES,
  DATA_SOURCE_TYPES,
  REPORT_STATUSES,
  CUSTOM_REPORT_TYPES,
  DASHBOARD_LAYOUTS,
  REFRESH_FREQUENCIES,
  REPORT_AUDIENCES,
  FILTER_CONTEXTS,
} from '@/types/advanced-reporting'

// ── Schemas ───────────────────────────────────────────────────────────────

import {
  widgetTypeEnum,
  dataSourceTypeEnum,
  reportStatusEnum,
  customReportTypeEnum,
  dashboardLayoutEnum,
  refreshFrequencyEnum,
  reportAudienceEnum,
  filterContextEnum,
  listCustomReportsSchema,
  createCustomReportSchema,
  updateCustomReportSchema,
  listReportWidgetsSchema,
  createReportWidgetSchema,
  updateReportWidgetSchema,
  listDashboardsSchema,
  createDashboardSchema,
  updateDashboardSchema,
  listDashboardWidgetsSchema,
  createDashboardWidgetSchema,
  updateDashboardWidgetSchema,
  listSavedFiltersSchema,
  createSavedFilterSchema,
  updateSavedFilterSchema,
} from '@/lib/validation/schemas/advanced-reporting'

// ============================================================================
// Type System
// ============================================================================

describe('Module 39 — Advanced Reporting Types', () => {
  test('WidgetType has 9 values', () => {
    const types: WidgetType[] = [
      'table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap',
    ]
    expect(types).toHaveLength(9)
  })

  test('DataSourceType has 10 values', () => {
    const sources: DataSourceType[] = [
      'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis', 'custom_query',
    ]
    expect(sources).toHaveLength(10)
  })

  test('ReportStatus has 3 values', () => {
    const statuses: ReportStatus[] = ['draft', 'published', 'archived']
    expect(statuses).toHaveLength(3)
  })

  test('CustomReportType has 2 values', () => {
    const types: CustomReportType[] = ['standard', 'custom']
    expect(types).toHaveLength(2)
  })

  test('DashboardLayout has 4 values', () => {
    const layouts: DashboardLayout[] = ['single_column', 'two_column', 'three_column', 'grid']
    expect(layouts).toHaveLength(4)
  })

  test('RefreshFrequency has 4 values', () => {
    const freqs: RefreshFrequency[] = ['manual', 'hourly', 'daily', 'weekly']
    expect(freqs).toHaveLength(4)
  })

  test('ReportAudience has 4 values', () => {
    const audiences: ReportAudience[] = ['internal', 'client', 'bank', 'investor']
    expect(audiences).toHaveLength(4)
  })

  test('FilterContext has 11 values', () => {
    const contexts: FilterContext[] = [
      'reports', 'dashboards', 'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis',
    ]
    expect(contexts).toHaveLength(11)
  })

  test('CustomReport interface has all required fields', () => {
    const report: CustomReport = {
      id: '1', company_id: '1', name: 'Monthly P&L', description: null,
      report_type: 'custom', data_sources: ['budgets'], fields: ['amount'],
      filters: {}, grouping: [], sorting: [], calculated_fields: [],
      visualization_type: 'table', audience: 'internal', status: 'draft',
      refresh_frequency: 'manual', is_template: false, shared_with: [],
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(report.name).toBe('Monthly P&L')
    expect(report.status).toBe('draft')
    expect(report.visualization_type).toBe('table')
  })

  test('CustomReportWidget interface has all required fields', () => {
    const widget: CustomReportWidget = {
      id: '1', report_id: '1', company_id: '1', title: 'Revenue Chart',
      widget_type: 'bar_chart', data_source: 'budgets', configuration: {},
      filters: {}, sort_order: 0,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(widget.title).toBe('Revenue Chart')
    expect(widget.widget_type).toBe('bar_chart')
    expect(widget.data_source).toBe('budgets')
  })

  test('ReportDashboard interface has all required fields', () => {
    const dashboard: ReportDashboard = {
      id: '1', company_id: '1', name: 'Executive Dashboard', description: null,
      layout: 'two_column', is_default: true, is_admin_pushed: false,
      target_roles: [], global_filters: {},
      created_by: '1', created_at: '2026-01-15', updated_at: '2026-01-15', deleted_at: null,
    }
    expect(dashboard.name).toBe('Executive Dashboard')
    expect(dashboard.layout).toBe('two_column')
    expect(dashboard.is_default).toBe(true)
  })

  test('DashboardWidget interface has all required fields', () => {
    const widget: DashboardWidget = {
      id: '1', dashboard_id: '1', company_id: '1', title: 'Active Jobs',
      widget_type: 'kpi_card', data_source: 'jobs', report_id: null,
      position_x: 0, position_y: 0, width: 3, height: 2,
      configuration: {}, refresh_interval_seconds: 300,
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(widget.title).toBe('Active Jobs')
    expect(widget.widget_type).toBe('kpi_card')
    expect(widget.position_x).toBe(0)
    expect(widget.width).toBe(3)
    expect(widget.refresh_interval_seconds).toBe(300)
  })

  test('SavedFilter interface has all required fields', () => {
    const filter: SavedFilter = {
      id: '1', company_id: '1', name: 'Active Jobs Only', description: null,
      context: 'reports', filter_config: { status: 'active' },
      is_global: false, created_by: '1',
      created_at: '2026-01-15', updated_at: '2026-01-15',
    }
    expect(filter.name).toBe('Active Jobs Only')
    expect(filter.context).toBe('reports')
    expect(filter.is_global).toBe(false)
  })
})

// ============================================================================
// Constants
// ============================================================================

describe('Module 39 — Constants', () => {
  test('WIDGET_TYPES has 9 entries with value and label', () => {
    expect(WIDGET_TYPES).toHaveLength(9)
    for (const wt of WIDGET_TYPES) {
      expect(wt).toHaveProperty('value')
      expect(wt).toHaveProperty('label')
      expect(wt.label.length).toBeGreaterThan(0)
    }
  })

  test('WIDGET_TYPES includes all expected values', () => {
    const values = WIDGET_TYPES.map((w) => w.value)
    expect(values).toContain('table')
    expect(values).toContain('bar_chart')
    expect(values).toContain('kpi_card')
    expect(values).toContain('heatmap')
  })

  test('DATA_SOURCE_TYPES has 10 entries with value and label', () => {
    expect(DATA_SOURCE_TYPES).toHaveLength(10)
    for (const ds of DATA_SOURCE_TYPES) {
      expect(ds).toHaveProperty('value')
      expect(ds).toHaveProperty('label')
      expect(ds.label.length).toBeGreaterThan(0)
    }
  })

  test('DATA_SOURCE_TYPES includes all expected values', () => {
    const values = DATA_SOURCE_TYPES.map((d) => d.value)
    expect(values).toContain('jobs')
    expect(values).toContain('budgets')
    expect(values).toContain('rfis')
    expect(values).toContain('custom_query')
  })

  test('REPORT_STATUSES has 3 entries with value and label', () => {
    expect(REPORT_STATUSES).toHaveLength(3)
    for (const s of REPORT_STATUSES) {
      expect(s).toHaveProperty('value')
      expect(s).toHaveProperty('label')
    }
  })

  test('CUSTOM_REPORT_TYPES has 2 entries with value and label', () => {
    expect(CUSTOM_REPORT_TYPES).toHaveLength(2)
    const values = CUSTOM_REPORT_TYPES.map((t) => t.value)
    expect(values).toContain('standard')
    expect(values).toContain('custom')
  })

  test('DASHBOARD_LAYOUTS has 4 entries with value and label', () => {
    expect(DASHBOARD_LAYOUTS).toHaveLength(4)
    const values = DASHBOARD_LAYOUTS.map((l) => l.value)
    expect(values).toContain('single_column')
    expect(values).toContain('two_column')
    expect(values).toContain('three_column')
    expect(values).toContain('grid')
  })

  test('REFRESH_FREQUENCIES has 4 entries with value and label', () => {
    expect(REFRESH_FREQUENCIES).toHaveLength(4)
    const values = REFRESH_FREQUENCIES.map((f) => f.value)
    expect(values).toContain('manual')
    expect(values).toContain('hourly')
    expect(values).toContain('daily')
    expect(values).toContain('weekly')
  })

  test('REPORT_AUDIENCES has 4 entries with value and label', () => {
    expect(REPORT_AUDIENCES).toHaveLength(4)
    const values = REPORT_AUDIENCES.map((a) => a.value)
    expect(values).toContain('internal')
    expect(values).toContain('client')
    expect(values).toContain('bank')
    expect(values).toContain('investor')
  })

  test('FILTER_CONTEXTS has 11 entries with value and label', () => {
    expect(FILTER_CONTEXTS).toHaveLength(11)
    const values = FILTER_CONTEXTS.map((c) => c.value)
    expect(values).toContain('reports')
    expect(values).toContain('dashboards')
    expect(values).toContain('jobs')
    expect(values).toContain('rfis')
  })
})

// ============================================================================
// Enum Schemas
// ============================================================================

describe('Module 39 — Enum Schemas', () => {
  test('widgetTypeEnum accepts all 9 widget types', () => {
    for (const wt of ['table', 'bar_chart', 'line_chart', 'pie_chart', 'kpi_card', 'gauge', 'map', 'timeline', 'heatmap']) {
      expect(widgetTypeEnum.parse(wt)).toBe(wt)
    }
  })

  test('widgetTypeEnum rejects invalid type', () => {
    expect(() => widgetTypeEnum.parse('scatter')).toThrow()
  })

  test('dataSourceTypeEnum accepts all 10 data sources', () => {
    for (const ds of ['jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis', 'custom_query']) {
      expect(dataSourceTypeEnum.parse(ds)).toBe(ds)
    }
  })

  test('dataSourceTypeEnum rejects invalid source', () => {
    expect(() => dataSourceTypeEnum.parse('emails')).toThrow()
  })

  test('reportStatusEnum accepts all 3 statuses', () => {
    for (const s of ['draft', 'published', 'archived']) {
      expect(reportStatusEnum.parse(s)).toBe(s)
    }
  })

  test('reportStatusEnum rejects invalid status', () => {
    expect(() => reportStatusEnum.parse('active')).toThrow()
  })

  test('customReportTypeEnum accepts standard and custom', () => {
    expect(customReportTypeEnum.parse('standard')).toBe('standard')
    expect(customReportTypeEnum.parse('custom')).toBe('custom')
  })

  test('customReportTypeEnum rejects invalid type', () => {
    expect(() => customReportTypeEnum.parse('advanced')).toThrow()
  })

  test('dashboardLayoutEnum accepts all 4 layouts', () => {
    for (const l of ['single_column', 'two_column', 'three_column', 'grid']) {
      expect(dashboardLayoutEnum.parse(l)).toBe(l)
    }
  })

  test('dashboardLayoutEnum rejects invalid layout', () => {
    expect(() => dashboardLayoutEnum.parse('four_column')).toThrow()
  })

  test('refreshFrequencyEnum accepts all 4 frequencies', () => {
    for (const f of ['manual', 'hourly', 'daily', 'weekly']) {
      expect(refreshFrequencyEnum.parse(f)).toBe(f)
    }
  })

  test('refreshFrequencyEnum rejects invalid frequency', () => {
    expect(() => refreshFrequencyEnum.parse('monthly')).toThrow()
  })

  test('reportAudienceEnum accepts all 4 audiences', () => {
    for (const a of ['internal', 'client', 'bank', 'investor']) {
      expect(reportAudienceEnum.parse(a)).toBe(a)
    }
  })

  test('reportAudienceEnum rejects invalid audience', () => {
    expect(() => reportAudienceEnum.parse('public')).toThrow()
  })

  test('filterContextEnum accepts all 11 contexts', () => {
    for (const c of ['reports', 'dashboards', 'jobs', 'budgets', 'invoices', 'change_orders', 'purchase_orders', 'schedules', 'daily_logs', 'punch_items', 'rfis']) {
      expect(filterContextEnum.parse(c)).toBe(c)
    }
  })

  test('filterContextEnum rejects invalid context', () => {
    expect(() => filterContextEnum.parse('vendors')).toThrow()
  })
})

// ============================================================================
// Custom Report Schemas
// ============================================================================

describe('Module 39 — Custom Report Schemas', () => {
  test('listCustomReportsSchema accepts valid params', () => {
    const result = listCustomReportsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listCustomReportsSchema rejects limit > 100', () => {
    expect(() => listCustomReportsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listCustomReportsSchema accepts all filters', () => {
    const result = listCustomReportsSchema.parse({
      status: 'draft',
      report_type: 'custom',
      audience: 'internal',
      visualization_type: 'table',
      q: 'budget',
    })
    expect(result.status).toBe('draft')
    expect(result.report_type).toBe('custom')
    expect(result.audience).toBe('internal')
    expect(result.visualization_type).toBe('table')
    expect(result.q).toBe('budget')
  })

  test('createCustomReportSchema accepts valid report', () => {
    const result = createCustomReportSchema.parse({
      name: 'Monthly Budget Report',
    })
    expect(result.name).toBe('Monthly Budget Report')
    expect(result.status).toBe('draft')
    expect(result.report_type).toBe('custom')
    expect(result.visualization_type).toBe('table')
    expect(result.audience).toBe('internal')
    expect(result.refresh_frequency).toBe('manual')
    expect(result.is_template).toBe(false)
    expect(result.data_sources).toEqual([])
    expect(result.fields).toEqual([])
    expect(result.filters).toEqual({})
    expect(result.shared_with).toEqual([])
  })

  test('createCustomReportSchema requires name', () => {
    expect(() => createCustomReportSchema.parse({})).toThrow()
  })

  test('createCustomReportSchema rejects name > 255 chars', () => {
    expect(() => createCustomReportSchema.parse({ name: 'A'.repeat(256) })).toThrow()
  })

  test('createCustomReportSchema accepts all optional fields', () => {
    const result = createCustomReportSchema.parse({
      name: 'Full Report',
      description: 'A comprehensive report',
      report_type: 'standard',
      data_sources: ['jobs', 'budgets'],
      fields: ['name', 'amount'],
      filters: { status: 'active' },
      grouping: ['project'],
      sorting: [{ field: 'name', direction: 'asc' }],
      calculated_fields: [{ name: 'margin', formula: 'revenue - cost' }],
      visualization_type: 'bar_chart',
      audience: 'client',
      status: 'published',
      refresh_frequency: 'daily',
      is_template: true,
      shared_with: ['user-1', 'user-2'],
    })
    expect(result.report_type).toBe('standard')
    expect(result.visualization_type).toBe('bar_chart')
    expect(result.audience).toBe('client')
    expect(result.status).toBe('published')
    expect(result.refresh_frequency).toBe('daily')
    expect(result.is_template).toBe(true)
  })

  test('updateCustomReportSchema accepts partial updates', () => {
    const result = updateCustomReportSchema.parse({ name: 'Updated Report' })
    expect(result.name).toBe('Updated Report')
    expect(result.status).toBeUndefined()
  })

  test('updateCustomReportSchema accepts empty object', () => {
    const result = updateCustomReportSchema.parse({})
    expect(result.name).toBeUndefined()
  })
})

// ============================================================================
// Report Widget Schemas
// ============================================================================

describe('Module 39 — Report Widget Schemas', () => {
  test('listReportWidgetsSchema accepts valid params with defaults', () => {
    const result = listReportWidgetsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createReportWidgetSchema accepts valid widget', () => {
    const result = createReportWidgetSchema.parse({
      title: 'Revenue by Phase',
      widget_type: 'bar_chart',
      data_source: 'budgets',
    })
    expect(result.title).toBe('Revenue by Phase')
    expect(result.widget_type).toBe('bar_chart')
    expect(result.data_source).toBe('budgets')
    expect(result.sort_order).toBe(0)
    expect(result.configuration).toEqual({})
    expect(result.filters).toEqual({})
  })

  test('createReportWidgetSchema has correct defaults', () => {
    const result = createReportWidgetSchema.parse({})
    expect(result.widget_type).toBe('table')
    expect(result.data_source).toBe('jobs')
    expect(result.sort_order).toBe(0)
  })

  test('updateReportWidgetSchema accepts partial updates', () => {
    const result = updateReportWidgetSchema.parse({ title: 'Updated Widget' })
    expect(result.title).toBe('Updated Widget')
    expect(result.widget_type).toBeUndefined()
  })
})

// ============================================================================
// Dashboard Schemas
// ============================================================================

describe('Module 39 — Dashboard Schemas', () => {
  test('listDashboardsSchema accepts valid params', () => {
    const result = listDashboardsSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listDashboardsSchema rejects limit > 100', () => {
    expect(() => listDashboardsSchema.parse({ limit: 200 })).toThrow()
  })

  test('listDashboardsSchema accepts is_default filter', () => {
    const result = listDashboardsSchema.parse({ is_default: 'true' })
    expect(result.is_default).toBe(true)
  })

  test('createDashboardSchema accepts valid dashboard', () => {
    const result = createDashboardSchema.parse({
      name: 'Executive Dashboard',
    })
    expect(result.name).toBe('Executive Dashboard')
    expect(result.layout).toBe('two_column')
    expect(result.is_default).toBe(false)
    expect(result.is_admin_pushed).toBe(false)
    expect(result.target_roles).toEqual([])
    expect(result.global_filters).toEqual({})
  })

  test('createDashboardSchema requires name', () => {
    expect(() => createDashboardSchema.parse({})).toThrow()
  })

  test('createDashboardSchema rejects name > 200 chars', () => {
    expect(() => createDashboardSchema.parse({ name: 'A'.repeat(201) })).toThrow()
  })

  test('createDashboardSchema accepts all optional fields', () => {
    const result = createDashboardSchema.parse({
      name: 'PM Dashboard',
      description: 'Dashboard for project managers',
      layout: 'grid',
      is_default: true,
      is_admin_pushed: true,
      target_roles: ['pm', 'admin'],
      global_filters: { project_id: '123' },
    })
    expect(result.layout).toBe('grid')
    expect(result.is_default).toBe(true)
    expect(result.is_admin_pushed).toBe(true)
  })

  test('updateDashboardSchema accepts partial updates', () => {
    const result = updateDashboardSchema.parse({ name: 'Updated Dashboard' })
    expect(result.name).toBe('Updated Dashboard')
    expect(result.layout).toBeUndefined()
  })
})

// ============================================================================
// Dashboard Widget Schemas
// ============================================================================

describe('Module 39 — Dashboard Widget Schemas', () => {
  test('listDashboardWidgetsSchema accepts valid params with defaults', () => {
    const result = listDashboardWidgetsSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.limit).toBe(50)
  })

  test('createDashboardWidgetSchema accepts valid widget', () => {
    const result = createDashboardWidgetSchema.parse({
      title: 'Active Jobs Count',
      widget_type: 'kpi_card',
      data_source: 'jobs',
    })
    expect(result.title).toBe('Active Jobs Count')
    expect(result.widget_type).toBe('kpi_card')
    expect(result.data_source).toBe('jobs')
    expect(result.position_x).toBe(0)
    expect(result.position_y).toBe(0)
    expect(result.width).toBe(1)
    expect(result.height).toBe(1)
    expect(result.refresh_interval_seconds).toBe(0)
  })

  test('createDashboardWidgetSchema has correct defaults', () => {
    const result = createDashboardWidgetSchema.parse({})
    expect(result.widget_type).toBe('kpi_card')
    expect(result.data_source).toBe('jobs')
    expect(result.position_x).toBe(0)
    expect(result.position_y).toBe(0)
    expect(result.width).toBe(1)
    expect(result.height).toBe(1)
    expect(result.refresh_interval_seconds).toBe(0)
  })

  test('createDashboardWidgetSchema accepts report_id', () => {
    const result = createDashboardWidgetSchema.parse({
      report_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.report_id).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  test('createDashboardWidgetSchema rejects width > 12', () => {
    expect(() => createDashboardWidgetSchema.parse({ width: 13 })).toThrow()
  })

  test('createDashboardWidgetSchema rejects height > 12', () => {
    expect(() => createDashboardWidgetSchema.parse({ height: 13 })).toThrow()
  })

  test('createDashboardWidgetSchema rejects refresh_interval_seconds > 86400', () => {
    expect(() => createDashboardWidgetSchema.parse({ refresh_interval_seconds: 90000 })).toThrow()
  })

  test('updateDashboardWidgetSchema accepts partial updates', () => {
    const result = updateDashboardWidgetSchema.parse({ position_x: 2, position_y: 3 })
    expect(result.position_x).toBe(2)
    expect(result.position_y).toBe(3)
    expect(result.widget_type).toBeUndefined()
  })
})

// ============================================================================
// Saved Filter Schemas
// ============================================================================

describe('Module 39 — Saved Filter Schemas', () => {
  test('listSavedFiltersSchema accepts valid params', () => {
    const result = listSavedFiltersSchema.parse({ page: '1', limit: '20' })
    expect(result.page).toBe(1)
    expect(result.limit).toBe(20)
  })

  test('listSavedFiltersSchema rejects limit > 100', () => {
    expect(() => listSavedFiltersSchema.parse({ limit: 200 })).toThrow()
  })

  test('listSavedFiltersSchema accepts context and is_global filters', () => {
    const result = listSavedFiltersSchema.parse({
      context: 'reports',
      is_global: 'true',
      q: 'active',
    })
    expect(result.context).toBe('reports')
    expect(result.is_global).toBe(true)
    expect(result.q).toBe('active')
  })

  test('createSavedFilterSchema accepts valid filter', () => {
    const result = createSavedFilterSchema.parse({
      name: 'Active Jobs Only',
    })
    expect(result.name).toBe('Active Jobs Only')
    expect(result.context).toBe('reports')
    expect(result.filter_config).toEqual({})
    expect(result.is_global).toBe(false)
  })

  test('createSavedFilterSchema requires name', () => {
    expect(() => createSavedFilterSchema.parse({})).toThrow()
  })

  test('createSavedFilterSchema rejects name > 200 chars', () => {
    expect(() => createSavedFilterSchema.parse({ name: 'A'.repeat(201) })).toThrow()
  })

  test('createSavedFilterSchema accepts all optional fields', () => {
    const result = createSavedFilterSchema.parse({
      name: 'Q1 Budget Filter',
      description: 'Filter for Q1 2026 budget data',
      context: 'budgets',
      filter_config: { quarter: 1, year: 2026 },
      is_global: true,
    })
    expect(result.context).toBe('budgets')
    expect(result.is_global).toBe(true)
    expect(result.filter_config).toEqual({ quarter: 1, year: 2026 })
  })

  test('updateSavedFilterSchema accepts partial updates', () => {
    const result = updateSavedFilterSchema.parse({ name: 'Updated Filter' })
    expect(result.name).toBe('Updated Filter')
    expect(result.context).toBeUndefined()
  })

  test('updateSavedFilterSchema accepts empty object', () => {
    const result = updateSavedFilterSchema.parse({})
    expect(result.name).toBeUndefined()
  })
})
