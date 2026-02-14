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

import type { Database } from '@/types/database'

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'The admin client requires these env vars and should only be used server-side.'
    )
  }

  adminClient = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
