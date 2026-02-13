/**
 * Multi-Tenant Caching Layer
 *
 * Provides Redis-based caching with automatic tenant isolation.
 * Designed for 10,000+ companies with 1,000,000+ users.
 *
 * Uses Vercel KV (Redis) in production, in-memory fallback for development.
 */

// @ts-expect-error @vercel/kv not installed yet
import { kv } from '@vercel/kv'

// Cache key prefixes for different data types
const CACHE_PREFIXES = {
  company: 'company',
  user: 'user',
  job: 'job',
  client: 'client',
  vendor: 'vendor',
  settings: 'settings',
  session: 'session',
  rateLimit: 'rl',
} as const

// Default TTL values in seconds
const DEFAULT_TTL = {
  short: 60,           // 1 minute - for frequently changing data
  medium: 300,         // 5 minutes - for moderately stable data
  long: 3600,          // 1 hour - for stable data
  day: 86400,          // 24 hours - for very stable data
  session: 1800,       // 30 minutes - for session data
} as const

type CachePrefix = keyof typeof CACHE_PREFIXES
type CacheTTL = keyof typeof DEFAULT_TTL

// In-memory cache fallback for development
const memoryCache = new Map<string, { value: unknown; expires: number }>()

/**
 * Check if Vercel KV is available
 */
function isKVAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Build a tenant-scoped cache key
 */
export function buildCacheKey(
  companyId: string,
  prefix: CachePrefix,
  ...segments: string[]
): string {
  return `${CACHE_PREFIXES[prefix]}:${companyId}:${segments.join(':')}`
}

/**
 * Build a global (non-tenant) cache key
 */
export function buildGlobalKey(prefix: string, ...segments: string[]): string {
  return `global:${prefix}:${segments.join(':')}`
}

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (isKVAvailable()) {
      return await kv.get<T>(key)
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.value as T
    }
    memoryCache.delete(key)
    return null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Set a value in cache with TTL
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: CacheTTL | number = 'medium'
): Promise<void> {
  const ttlSeconds = typeof ttl === 'number' ? ttl : DEFAULT_TTL[ttl]

  try {
    if (isKVAvailable()) {
      await kv.set(key, value, { ex: ttlSeconds })
    } else {
      // Fallback to memory cache
      memoryCache.set(key, {
        value,
        expires: Date.now() + ttlSeconds * 1000,
      })
    }
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  try {
    if (isKVAvailable()) {
      await kv.del(key)
    } else {
      memoryCache.delete(key)
    }
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

/**
 * Delete all keys matching a pattern (tenant invalidation)
 */
export async function cacheInvalidatePattern(pattern: string): Promise<void> {
  try {
    if (isKVAvailable()) {
      // Use SCAN to find matching keys
      const keys = await kv.keys(pattern)
      if (keys.length > 0) {
        await kv.del(...keys)
      }
    } else {
      // Fallback: iterate memory cache
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern.replace('*', ''))) {
          memoryCache.delete(key)
        }
      }
    }
  } catch (error) {
    console.error('Cache invalidate error:', error)
  }
}

/**
 * Invalidate all cache for a company
 */
export async function invalidateCompanyCache(companyId: string): Promise<void> {
  await cacheInvalidatePattern(`*:${companyId}:*`)
}

/**
 * Cache-through pattern: Get from cache or fetch and cache
 */
export async function cacheThrough<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: CacheTTL | number = 'medium'
): Promise<T> {
  // Try to get from cache
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetcher()

  // Cache the result
  await cacheSet(key, data, ttl)

  return data
}

/**
 * Tenant-aware cache-through helper
 */
export async function tenantCacheThrough<T>(
  companyId: string,
  prefix: CachePrefix,
  segments: string[],
  fetcher: () => Promise<T>,
  ttl: CacheTTL | number = 'medium'
): Promise<T> {
  const key = buildCacheKey(companyId, prefix, ...segments)
  return cacheThrough(key, fetcher, ttl)
}

// ============================================================================
// SPECIALIZED CACHE HELPERS
// ============================================================================

/**
 * Cache company settings (long TTL - rarely changes)
 */
export async function getCachedCompanySettings<T>(
  companyId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  return tenantCacheThrough(companyId, 'settings', ['company'], fetcher, 'long')
}

/**
 * Cache user profile (medium TTL)
 */
export async function getCachedUserProfile<T>(
  companyId: string,
  userId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  return tenantCacheThrough(companyId, 'user', [userId], fetcher, 'medium')
}

/**
 * Cache job summary (short TTL - changes frequently)
 */
export async function getCachedJobSummary<T>(
  companyId: string,
  jobId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  return tenantCacheThrough(companyId, 'job', [jobId, 'summary'], fetcher, 'short')
}

/**
 * Invalidate job cache when job is updated
 */
export async function invalidateJobCache(companyId: string, jobId: string): Promise<void> {
  const pattern = buildCacheKey(companyId, 'job', jobId, '*')
  await cacheInvalidatePattern(pattern)
}

// ============================================================================
// CACHE STATISTICS (for monitoring)
// ============================================================================

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
}

const stats = { hits: 0, misses: 0 }

export function getCacheStats(): CacheStats {
  const total = stats.hits + stats.misses
  return {
    ...stats,
    hitRate: total > 0 ? stats.hits / total : 0,
  }
}

export function resetCacheStats(): void {
  stats.hits = 0
  stats.misses = 0
}
