/**
 * Background Job Processor (Cron Endpoint)
 *
 * Called by Vercel Cron every minute to process pending jobs.
 * Protected by CRON_SECRET environment variable.
 *
 * To configure in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/process-jobs",
 *     "schedule": "* * * * *"
 *   }]
 * }
 */

import { type NextRequest, NextResponse } from 'next/server'

import { serverEnv } from '@/lib/env.server'
import { createLogger } from '@/lib/monitoring'
import { getNextJobs, processJob, markJobProcessing } from '@/lib/queue'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds max

const logger = createLogger({ service: 'job-processor' })

export async function GET(req: NextRequest) {
  // Verify cron secret — REQUIRED in all environments
  const authHeader = req.headers.get('authorization')
  const cronSecret = serverEnv.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized', requestId: crypto.randomUUID() }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    processed: 0,
    failed: 0,
    skipped: 0,
    jobs: [] as string[],
  }

  try {
    // Get pending jobs (limit to 10 per invocation)
    const jobs = await getNextJobs(10)

    logger.info(`Found ${jobs.length} pending jobs`)

    for (const job of jobs) {
      // Try to claim the job
      const claimed = await markJobProcessing(job.id)

      if (!claimed) {
        results.skipped++
        continue
      }

      try {
        await processJob(job)
        results.processed++
        results.jobs.push(job.id)
        logger.info(`Processed job ${job.id}`, { type: job.type, companyId: job.company_id })
      } catch (error) {
        results.failed++
        logger.error(`Failed to process job ${job.id}`, {
          type: job.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Check if we're running low on time (leave 5s buffer)
      if (Date.now() - startTime > 55000) {
        logger.warn('Approaching timeout, stopping job processing')
        break
      }
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      duration,
      ...results,
    })
  } catch (error) {
    logger.error('Job processor error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Job processor encountered an error',
        ...results,
      },
      { status: 500 }
    )
  }
}
