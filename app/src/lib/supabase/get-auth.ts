import { cache } from 'react'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

/**
 * Cached server-side auth helper — deduplicates auth + company_id queries
 * within a single RSC render pass. Call from any server component; the DB
 * query runs at most once per request regardless of how many components call it.
 */
export const getServerAuth = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  const companyId = profile?.company_id
  if (!companyId) {
    redirect('/login')
  }

  return { user, companyId, supabase }
})
