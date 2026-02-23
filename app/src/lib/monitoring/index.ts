/**
 * Monitoring & Observability
 *
 * Provides structured logging, metrics collection, and error tracking
 * for multi-tenant SaaS at scale.
 */

import { createClient } from '@/lib/supabase/server'

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  companyId?: string
  userId?: string
  jobId?: string
  requestId?: string
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context: LogContext
  timestamp: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatLog(entry: LogEntry): string {
  const { level, message, context, timestamp } = entry
  const contextStr = Object.keys(context).length > 0 ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

/**
 * Create a structured logger with context
 */
export function createLogger(baseContext: LogContext = {}) {
  const log = (level: LogLevel, message: string, context: LogContext = {}) => {
    if (!shouldLog(level)) return

    const entry: LogEntry = {
      level,
      message,
      context: { ...baseContext, ...context },
      timestamp: new Date().toISOString(),
    }

    // In production, this could send to external service (Datadog, etc.)
    const formatted = formatLog(entry)

    switch (level) {
      case 'debug':
        console.debug(formatted)
        break
      case 'info':
        console.info(formatted)
        break
      case 'warn':
        console.warn(formatted)
        break
      case 'error':
        console.error(formatted)
        break
    }

    // Send errors to error tracking service in production
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, etc.
      // captureError(message, context)
    }
  }

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
    child: (additionalContext: LogContext) =>
      createLogger({ ...baseContext, ...additionalContext }),
  }
}

// Default logger
export const logger = createLogger()

// ============================================================================
// METRICS COLLECTION
// ============================================================================

interface MetricData {
  companyId?: string
  endpoint: string
  method: string
  statusCode: number
  responseTimeMs: number
}

/**
 * Record API metric (batched for performance)
 */
const metricsBuffer: MetricData[] = []
let flushTimeout: NodeJS.Timeout | null = null

export function recordMetric(data: MetricData): void {
  metricsBuffer.push(data)

  // Flush every 10 seconds or when buffer hits 100
  if (metricsBuffer.length >= 100) {
    flushMetrics()
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flushMetrics, 10000)
  }
}

async function flushMetrics(): Promise<void> {
  if (metricsBuffer.length === 0) return

  const toFlush = [...metricsBuffer]
  metricsBuffer.length = 0

  if (flushTimeout) {
    clearTimeout(flushTimeout)
    flushTimeout = null
  }

  try {
    const supabase = await createClient()

    await supabase.from('api_metrics').insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toFlush.map((m) => ({
        company_id: m.companyId,
        endpoint: m.endpoint,
        method: m.method,
        status_code: m.statusCode,
        response_time_ms: m.responseTimeMs,
      })) as any
    )
  } catch (error) {
    console.error('Failed to flush metrics:', error)
  }
}

// ============================================================================
// AUDIT LOGGING
// ============================================================================

interface AuditEntry {
  companyId: string
  userId?: string
  action: string
  tableName?: string
  recordId?: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Record an audit log entry
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.from('audit_log').insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {
        company_id: entry.companyId,
        user_id: entry.userId,
        action: entry.action,
        table_name: entry.tableName,
        record_id: entry.recordId,
        old_data: entry.oldData,
        new_data: entry.newData,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
      } as any
    )
  } catch (error) {
    console.error('Failed to record audit log:', error)
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  services: {
    database: 'up' | 'down'
    cache: 'up' | 'down'
    queue: 'up' | 'down'
  }
  latency: {
    database: number
    cache: number
  }
}

/**
 * Check system health
 */
export async function checkHealth(): Promise<HealthStatus> {
  const timestamp = new Date().toISOString()
  const version = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local'

  const services = {
    database: 'down' as 'up' | 'down',
    cache: 'down' as 'up' | 'down',
    queue: 'down' as 'up' | 'down',
  }

  const latency = {
    database: -1,
    cache: -1,
  }

  // Check database
  try {
    const start = Date.now()
    const supabase = await createClient()
    await supabase.from('companies').select('id').limit(1)
    latency.database = Date.now() - start
    services.database = 'up'
  } catch {
    services.database = 'down'
  }

  // Check cache (Vercel KV)
  try {
    const start = Date.now()
    // @ts-expect-error @vercel/kv not installed yet
    const { kv } = await import('@vercel/kv')
    await kv.ping()
    latency.cache = Date.now() - start
    services.cache = 'up'
  } catch {
    // Cache might not be configured
    services.cache = process.env.KV_REST_API_URL ? 'down' : 'up'
    latency.cache = 0
  }

  // Check queue (based on database)
  services.queue = services.database

  // Determine overall status
  const anyDown = Object.values(services).some((s) => s === 'down')

  let status: HealthStatus['status'] = 'healthy'
  if (anyDown && services.database === 'down') {
    status = 'unhealthy'
  } else if (anyDown) {
    status = 'degraded'
  }

  return {
    status,
    version,
    timestamp,
    services,
    latency,
  }
}

// ============================================================================
// PERFORMANCE TIMING
// ============================================================================

/**
 * Simple performance timer
 */
export function createTimer(label: string) {
  const start = performance.now()

  return {
    end: (context?: LogContext) => {
      const duration = performance.now() - start
      logger.debug(`${label} completed in ${duration.toFixed(2)}ms`, context)
      return duration
    },
  }
}

/**
 * Wrap async function with timing
 */
export function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const timer = createTimer(label)
  return fn().finally(() => timer.end())
}
