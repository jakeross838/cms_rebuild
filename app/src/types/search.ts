export type SearchEntityType = 'jobs' | 'clients' | 'vendors' | 'invoices'

export interface SearchResult {
  id: string
  entity_type: SearchEntityType
  title: string
  subtitle: string | null
  status: string | null
  url: string
}

export interface SearchResultGroup {
  entity_type: SearchEntityType
  label: string
  results: SearchResult[]
  total: number
}

export interface SearchResponse {
  query: string
  groups: SearchResultGroup[]
  total: number
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  href: string
  category: 'navigation' | 'create'
  keywords: string[]
}
