'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function ArchiveJobButton({ jobId }: { jobId: string }) {
  const [archiving, setArchiving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleArchive = async () => {
    if (!window.confirm('Archive this job? It can be restored later.')) return
    setArchiving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { alert('Not authenticated'); setArchiving(false); return }
    const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    const companyId = profile?.company_id
    if (!companyId) { alert('No company found'); setArchiving(false); return }

    const { error } = await supabase
      .from('jobs')
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', jobId)
      .eq('company_id', companyId)
    if (error) {
      alert('Failed to archive job')
      setArchiving(false)
      return
    }
    router.push('/jobs')
    router.refresh()
  }

  return (
    <button
      onClick={handleArchive}
      disabled={archiving}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
    >
      {archiving ? 'Archiving...' : 'Archive'}
    </button>
  )
}
