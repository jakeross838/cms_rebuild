/**
 * Cleanup Cron Job
 *
 * Runs daily to clean up old data:
 * - Old completed/failed jobs from queue (soft delete / archive)
 * - Old API metrics
 *
 * IMPORTANT: Audit logs are NEVER deleted (7-year financial retention).
 *
 * To configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

import { type NextRequest, NextResponse } from 'next/server'

import { createLogger } from '@/lib/monitoring'
import { cleanupOldJobs } from '@/lib/queue'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

const logger = createLogger({ service: 'cleanup' })

export async function GET(req: NextRequest) {
  // Verify cron secret — REQUIRED in all environments
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized', requestId: crypto.randomUUID() }, { status: 401 })
  }

  const results = {
    jobsArchived: 0,
    metricsDeleted: 0,
  }

  try {
    // 1. Archive old jobs (older than 7 days) — soft delete
    results.jobsArchived = await cleanupOldJobs(7)
    logger.info(`Archived ${results.jobsArchived} old jobs`)

    // 2. Clean up old metrics (older than 30 days)
    const supabase = await createClient()

    const { data: metricsData } = await supabase.rpc('cleanup_old_metrics')
    results.metricsDeleted = metricsData || 0
    logger.info(`Cleaned up ${results.metricsDeleted} old metrics`)

    // NOTE: Audit logs are NEVER deleted.
    // Financial SaaS requires 7-year retention minimum.

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    logger.error('Cleanup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...results,
      },
      { status: 500 }
    )
  }
}
