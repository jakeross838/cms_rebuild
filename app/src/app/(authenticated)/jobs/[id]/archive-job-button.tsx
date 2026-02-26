'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function ArchiveJobButton({ jobId }: { jobId: string }) {
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleConfirmArchive = async () => {
    setArchiving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Not authenticated'); setArchiving(false); return }
    const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    const companyId = profile?.company_id
    if (!companyId) { toast.error('No company found'); setArchiving(false); return }

    const { error } = await supabase
      .from('jobs')
      .update({ deleted_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', jobId)
      .eq('company_id', companyId)
    if (error) {
      toast.error('Failed to archive job')
      setArchiving(false)
      return
    }
    toast.success('Job archived')
    router.push('/jobs')
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setShowArchiveDialog(true)}
        disabled={archiving}
        variant="outline"
        className="text-destructive hover:text-destructive"
      >
        {archiving ? 'Archiving...' : 'Archive'}
      </Button>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this job?"
        description="This job will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </>
  )
}
