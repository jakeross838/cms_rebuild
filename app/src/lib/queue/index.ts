/**
 * Background Job Queue System
 *
 * Simple but scalable queue system for background processing.
 * Uses database-backed queue with support for:
 * - Delayed jobs
 * - Retries with exponential backoff
 * - Priority queues
 * - Tenant isolation
 *
 * In production, can be upgraded to dedicated queue service (BullMQ, etc.)
 */

import { createClient } from '@/lib/supabase/server'

// Job status enum
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// Job priority (lower = higher priority)
export type JobPriority = 1 | 2 | 3 | 4 | 5

// Job types
export type JobType =
  | 'email:send'
  | 'email:batch'
  | 'invoice:process'
  | 'invoice:ocr'
  | 'report:generate'
  | 'notification:send'
  | 'notification:batch'
  | 'sync:quickbooks'
  | 'sync:calendar'
  | 'cleanup:files'
  | 'cleanup:cache'
  | 'ai:analyze'
  | 'ai:extract'
  | 'webhook:deliver'

interface JobPayload {
  [key: string]: unknown
}

interface Job {
  id: string
  company_id: string
  type: JobType
  payload: JobPayload
  status: JobStatus
  priority: JobPriority
  attempts: number
  max_attempts: number
  run_at: string
  started_at: string | null
  completed_at: string | null
  error: string | null
  created_at: string
}

interface QueueJobOptions {
  priority?: JobPriority
  runAt?: Date
  maxAttempts?: number
}

// Default job configurations
const JOB_DEFAULTS: Record<JobType, { priority: JobPriority; maxAttempts: number }> = {
  'email:send': { priority: 2, maxAttempts: 3 },
  'email:batch': { priority: 3, maxAttempts: 3 },
  'invoice:process': { priority: 2, maxAttempts: 3 },
  'invoice:ocr': { priority: 2, maxAttempts: 2 },
  'report:generate': { priority: 4, maxAttempts: 2 },
  'notification:send': { priority: 1, maxAttempts: 3 },
  'notification:batch': { priority: 2, maxAttempts: 3 },
  'sync:quickbooks': { priority: 3, maxAttempts: 3 },
  'sync:calendar': { priority: 3, maxAttempts: 3 },
  'cleanup:files': { priority: 5, maxAttempts: 1 },
  'cleanup:cache': { priority: 5, maxAttempts: 1 },
  'ai:analyze': { priority: 3, maxAttempts: 2 },
  'ai:extract': { priority: 2, maxAttempts: 2 },
  'webhook:deliver': { priority: 1, maxAttempts: 5 },
}

/**
 * Add a job to the queue
 */
export async function enqueueJob(
  companyId: string,
  type: JobType,
  payload: JobPayload,
  options: QueueJobOptions = {}
): Promise<string> {
  const supabase = await createClient()
  const defaults = JOB_DEFAULTS[type]

  const { data, error } = await supabase
    .from('job_queue')
    .insert({
      company_id: companyId,
      type,
      payload,
      status: 'pending',
      priority: options.priority ?? defaults.priority,
      max_attempts: options.maxAttempts ?? defaults.maxAttempts,
      run_at: options.runAt?.toISOString() ?? new Date().toISOString(),
      attempts: 0,
    } as any)
    .select('id')
    .single()

  if (error) {
    console.error('Failed to enqueue job:', error)
    throw new Error(`Failed to enqueue job: ${error.message}`)
  }

  return (data as any).id
}

/**
 * Enqueue multiple jobs in a batch
 */
export async function enqueueJobs(
  jobs: Array<{
    companyId: string
    type: JobType
    payload: JobPayload
    options?: QueueJobOptions
  }>
): Promise<string[]> {
  const supabase = await createClient()

  const jobRecords = jobs.map((job) => {
    const defaults = JOB_DEFAULTS[job.type]
    return {
      company_id: job.companyId,
      type: job.type,
      payload: job.payload,
      status: 'pending' as const,
      priority: job.options?.priority ?? defaults.priority,
      max_attempts: job.options?.maxAttempts ?? defaults.maxAttempts,
      run_at: job.options?.runAt?.toISOString() ?? new Date().toISOString(),
      attempts: 0,
    }
  })

  const { data, error } = await supabase
    .from('job_queue')
    .insert(jobRecords as any)
    .select('id')

  if (error) {
    console.error('Failed to enqueue jobs:', error)
    throw new Error(`Failed to enqueue jobs: ${error.message}`)
  }

  return (data as any[]).map((d) => d.id)
}

/**
 * Get next jobs to process (for cron worker)
 */
export async function getNextJobs(limit: number = 10): Promise<Job[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('run_at', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Failed to get next jobs:', error)
    return []
  }

  return (data as any[]) as Job[]
}

/**
 * Mark job as processing
 */
export async function markJobProcessing(jobId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await (supabase
    .from('job_queue') as any)
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: (supabase as any).rpc('increment_attempts', { job_id: jobId }),
    })
    .eq('id', jobId)
    .eq('status', 'pending') // Only if still pending (optimistic lock)

  return !error
}

/**
 * Mark job as completed
 */
export async function markJobCompleted(jobId: string): Promise<void> {
  const supabase = await createClient()

  await (supabase
    .from('job_queue') as any)
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

/**
 * Mark job as failed (with retry logic)
 */
export async function markJobFailed(
  jobId: string,
  error: string,
  currentAttempts: number,
  maxAttempts: number
): Promise<void> {
  const supabase = await createClient()

  if (currentAttempts >= maxAttempts) {
    // Max retries reached - mark as permanently failed
    await (supabase
      .from('job_queue') as any)
      .update({
        status: 'failed',
        error,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
  } else {
    // Schedule retry with exponential backoff
    const backoffSeconds = Math.pow(2, currentAttempts) * 60 // 1min, 2min, 4min, 8min...
    const retryAt = new Date(Date.now() + backoffSeconds * 1000)

    await (supabase
      .from('job_queue') as any)
      .update({
        status: 'pending',
        error,
        run_at: retryAt.toISOString(),
      })
      .eq('id', jobId)
  }
}

/**
 * Cancel a job
 */
export async function cancelJob(jobId: string): Promise<void> {
  const supabase = await createClient()

  await (supabase
    .from('job_queue') as any)
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .in('status', ['pending', 'processing'])
}

/**
 * Get job by ID
 */
export async function getJob(jobId: string): Promise<Job | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_queue')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) return null
  return (data as any) as Job
}

/**
 * Get jobs for a company
 */
export async function getCompanyJobs(
  companyId: string,
  status?: JobStatus,
  limit: number = 50
): Promise<Job[]> {
  const supabase = await createClient()

  let query = supabase
    .from('job_queue')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) return []
  return (data as any[]) as Job[]
}

/**
 * Clean up old completed/failed jobs
 */
export async function cleanupOldJobs(olderThanDays: number = 7): Promise<number> {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('job_queue')
    .delete()
    .in('status', ['completed', 'failed', 'cancelled'])
    .lt('completed_at', cutoff.toISOString())
    .select('id')

  if (error) return 0
  return (data as any[]).length
}

// ============================================================================
// JOB HANDLERS REGISTRY
// ============================================================================

type JobHandler = (job: Job) => Promise<void>

const handlers = new Map<JobType, JobHandler>()

/**
 * Register a job handler
 */
export function registerJobHandler(type: JobType, handler: JobHandler): void {
  handlers.set(type, handler)
}

/**
 * Get job handler
 */
export function getJobHandler(type: JobType): JobHandler | undefined {
  return handlers.get(type)
}

/**
 * Process a single job
 */
export async function processJob(job: Job): Promise<void> {
  const handler = handlers.get(job.type)

  if (!handler) {
    await markJobFailed(job.id, `No handler for job type: ${job.type}`, job.attempts, job.max_attempts)
    return
  }

  try {
    await handler(job)
    await markJobCompleted(job.id)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    await markJobFailed(job.id, errorMessage, job.attempts, job.max_attempts)
  }
}
