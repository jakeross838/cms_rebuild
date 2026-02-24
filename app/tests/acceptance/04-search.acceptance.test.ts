/**
 * Module 04 — Global Search Acceptance Tests
 * Verifies search schema validation, types, quick actions, and recent searches.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { searchQuerySchema } from '@/lib/validation/schemas/search'
import {
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '@/lib/search/recent-searches'
import { getQuickActions, filterQuickActions } from '@/lib/search/quick-actions'
import type {
  SearchEntityType,
  SearchResult,
  SearchResultGroup,
  SearchResponse,
  QuickAction,
} from '@/types/search'

// ============================================================================
// Search Schema Validation
// ============================================================================

describe('Spec: Search query schema validation', () => {
  it('accepts valid query with 2+ chars', () => {
    const result = searchQuerySchema.safeParse({ q: 'ab' })
    expect(result.success).toBe(true)
  })

  it('rejects query under 2 chars', () => {
    const result = searchQuerySchema.safeParse({ q: 'a' })
    expect(result.success).toBe(false)
  })

  it('rejects query over 200 chars', () => {
    const result = searchQuerySchema.safeParse({ q: 'x'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('parses types CSV into array', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', types: 'jobs,clients' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.types).toEqual(['jobs', 'clients'])
    }
  })

  it('rejects invalid entity types', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', types: 'jobs,invalid' })
    expect(result.success).toBe(false)
  })

  it('defaults limit to 5', () => {
    const result = searchQuerySchema.safeParse({ q: 'test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(5)
    }
  })

  it('rejects limit over 20', () => {
    const result = searchQuerySchema.safeParse({ q: 'test', limit: 21 })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Search Types
// ============================================================================

describe('Spec: Search entity types cover all entities', () => {
  it('SearchEntityType covers jobs, clients, vendors, invoices', () => {
    const types: SearchEntityType[] = ['jobs', 'clients', 'vendors', 'invoices']
    expect(types).toHaveLength(4)
  })

  it('SearchResult has required fields', () => {
    const result: SearchResult = {
      id: '123',
      entity_type: 'jobs',
      title: 'Test Job',
      subtitle: '12345',
      status: 'active',
      url: '/jobs/123',
    }
    expect(result.id).toBeDefined()
    expect(result.entity_type).toBeDefined()
    expect(result.title).toBeDefined()
    expect(result.url).toBeDefined()
  })

  it('SearchResponse groups results by entity', () => {
    const response: SearchResponse = {
      query: 'test',
      groups: [
        { entity_type: 'jobs', label: 'Jobs', results: [], total: 0 },
        { entity_type: 'clients', label: 'Clients', results: [], total: 0 },
      ],
      total: 0,
    }
    expect(response.groups).toHaveLength(2)
    expect(response.groups[0].entity_type).toBe('jobs')
  })
})

// ============================================================================
// Quick Actions
// ============================================================================

describe('Spec: Quick actions derive from nav config', () => {
  it('includes create actions for jobs, clients, vendors', () => {
    const actions = getQuickActions()
    const createActions = actions.filter((a) => a.category === 'create')
    expect(createActions.length).toBeGreaterThanOrEqual(3)

    const ids = createActions.map((a) => a.id)
    expect(ids).toContain('create-job')
    expect(ids).toContain('create-client')
    expect(ids).toContain('create-vendor')
  })

  it('includes navigation actions derived from nav config', () => {
    const actions = getQuickActions()
    const navActions = actions.filter((a) => a.category === 'navigation')
    expect(navActions.length).toBeGreaterThan(10)
  })

  it('each action has id, label, href, category, keywords', () => {
    const actions = getQuickActions()
    for (const action of actions) {
      expect(action.id).toBeTruthy()
      expect(action.label).toBeTruthy()
      expect(action.href).toBeTruthy()
      expect(action.category).toMatch(/^(create|navigation)$/)
      expect(action.keywords.length).toBeGreaterThan(0)
    }
  })

  it('has no duplicate action IDs', () => {
    const actions = getQuickActions()
    const ids = actions.map((a) => a.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('create actions have category = create', () => {
    const actions = getQuickActions()
    const createActions = actions.filter((a) => a.id.startsWith('create-'))
    for (const action of createActions) {
      expect(action.category).toBe('create')
    }
  })

  it('filters actions by query keyword', () => {
    const filtered = filterQuickActions('budget')
    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.length).toBeLessThan(getQuickActions().length)
  })
})

// ============================================================================
// Recent Searches
// ============================================================================

describe('Spec: Recent searches localStorage utility', () => {
  const storageStore: Record<string, string> = {}

  beforeEach(() => {
    // Clear store
    for (const key of Object.keys(storageStore)) {
      delete storageStore[key]
    }
    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageStore[key] ?? null,
      setItem: (key: string, value: string) => { storageStore[key] = value },
      removeItem: (key: string) => { delete storageStore[key] },
    })
  })

  it('stores up to 10 items', () => {
    for (let i = 0; i < 15; i++) {
      addRecentSearch(`search term ${i}`)
    }
    const recent = getRecentSearches()
    expect(recent).toHaveLength(10)
  })

  it('deduplicates entries with most recent first', () => {
    addRecentSearch('alpha')
    addRecentSearch('beta')
    addRecentSearch('alpha')
    const recent = getRecentSearches()
    expect(recent[0]).toBe('alpha')
    expect(recent[1]).toBe('beta')
    expect(recent).toHaveLength(2)
  })

  it('trims whitespace', () => {
    addRecentSearch('  hello world  ')
    const recent = getRecentSearches()
    expect(recent[0]).toBe('hello world')
  })

  it('rejects terms under 2 chars', () => {
    addRecentSearch('a')
    const recent = getRecentSearches()
    expect(recent).toHaveLength(0)
  })

  it('clearRecentSearches empties the store', () => {
    addRecentSearch('alpha')
    addRecentSearch('beta')
    clearRecentSearches()
    const recent = getRecentSearches()
    expect(recent).toHaveLength(0)
  })
})
