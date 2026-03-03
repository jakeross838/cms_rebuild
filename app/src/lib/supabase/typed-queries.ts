/**
 * Typed Supabase Query Helpers
 *
 * Centralized wrappers for insert/update/upsert operations that eliminate
 * scattered `as never` casts across API routes.
 *
 * The Supabase JS client requires exact type matches for insert/update payloads,
 * but our validated payloads (Zod schemas + computed fields like company_id,
 * updated_at) are structurally compatible yet not recognized as exact matches
 * by TypeScript. These helpers centralize the single necessary type assertion
 * so API routes stay cast-free.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TableName = keyof Tables

/**
 * Insert a single row. Accepts any object so call sites don't need casts.
 */
export function typedInsert<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  return supabase.from(table).insert(data as never)
}

/**
 * Insert multiple rows (batch). Accepts any array.
 */
export function typedInsertMany<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
) {
  return supabase.from(table).insert(data as never)
}

/**
 * Update rows. Accepts any object so call sites don't need casts.
 */
export function typedUpdate<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
) {
  return supabase.from(table).update(data as never)
}

/**
 * Upsert rows. Accepts any object so call sites don't need casts.
 */
export function typedUpsert<T extends TableName>(
  supabase: SupabaseClient<Database>,
  table: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  options?: { onConflict?: string }
) {
  return supabase.from(table).upsert(data as never, options)
}
