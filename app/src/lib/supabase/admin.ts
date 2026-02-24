/**
 * Supabase Admin Client (Service Role)
 *
 * Used ONLY for server-side operations that need to bypass RLS:
 * - Cron jobs
 * - Background workers
 * - System-level operations
 *
 * NEVER expose this client to the browser or pass it to components.
 * NEVER use this for user-initiated requests — use the regular server client instead.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { serverEnv } from '@/lib/env.server'
import type { Database } from '@/types/database'

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  adminClient = createSupabaseClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return adminClient
}
