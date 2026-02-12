/**
 * Cleanup Cron Job
 *
 * Runs daily to clean up old data:
 * - Old completed/failed jobs from queue
 * - Old API metrics
 * - Expired cache entries
 *
 * To configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldJobs } from '@/lib/queue'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/monitoring'

export const runtime = 'nodejs'
export const maxDuration = 60

const logger = createLogger({ service: 'cleanup' })

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    jobsDeleted: 0,
    metricsDeleted: 0,
    auditLogsDeleted: 0,
  }

  try {
    // 1. Clean up old jobs (older than 7 days)
    results.jobsDeleted = await cleanupOldJobs(7)
    logger.info(`Cleaned up ${results.jobsDeleted} old jobs`)

    // 2. Clean up old metrics (older than 30 days)
    const supabase = await createClient()

    const { data: metricsData } = await supabase.rpc('cleanup_old_metrics')
    results.metricsDeleted = metricsData || 0
    logger.info(`Cleaned up ${results.metricsDeleted} old metrics`)

    // 3. Clean up old audit logs (older than 90 days)
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const { data: auditData } = await supabase
      .from('audit_log')
      .delete()
      .lt('created_at', cutoff.toISOString())
      .select('id')

    results.auditLogsDeleted = auditData?.length || 0
    logger.info(`Cleaned up ${results.auditLogsDeleted} old audit logs`)

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
