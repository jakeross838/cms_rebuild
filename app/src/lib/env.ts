/**
 * Environment Variable Validation (0C-3 + 0C-7)
 *
 * Validates required env vars at import time with Zod.
 * Accepts both old (ANON_KEY) and new (PUBLISHABLE_KEY) Supabase naming.
 * Import this instead of using process.env directly.
 */

import { z } from 'zod'

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
})

// Accept both old and new Supabase env var names (0C-7)
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const result = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
})

if (!result.success) {
  throw new Error(
    `Missing required environment variables:\n${result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')}`
  )
}

/** Validated public environment variables (safe for client + server) */
export const env = result.data
