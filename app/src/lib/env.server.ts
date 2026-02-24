/**
 * Server-Only Environment Variable Validation
 *
 * Extends public env with server-only vars (e.g., service role key).
 * NEVER import this file from client-side code.
 */

import { z } from 'zod'

import { env } from './env'

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
})

const result = serverSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
})

if (!result.success) {
  throw new Error(
    `Missing required server environment variables:\n${result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`
  )
}

/** Validated server environment variables (public + server-only) */
export const serverEnv = { ...env, ...result.data }
