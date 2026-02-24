const STORAGE_KEY = 'rossos-recent-searches'
const MAX_ITEMS = 10

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addRecentSearch(term: string): void {
  if (typeof window === 'undefined') return
  const trimmed = term.trim()
  if (trimmed.length < 2) return

  try {
    const existing = getRecentSearches()
    const filtered = existing.filter((s) => s !== trimmed)
    const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
