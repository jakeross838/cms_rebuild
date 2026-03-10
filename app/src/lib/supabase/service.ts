import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { env } from '@/lib/env'

/**
 * Server-side Supabase client using the service role key.
 * Bypasses RLS — use only in trusted server contexts (API routes, server actions).
 * NEVER expose this client or the service role key to the browser.
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }

  return createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
