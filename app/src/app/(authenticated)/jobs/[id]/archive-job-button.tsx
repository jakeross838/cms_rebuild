'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useDeleteJob } from '@/hooks/use-jobs'
import { toast } from 'sonner'

export function ArchiveJobButton({ jobId }: { jobId: string }) {
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const router = useRouter()
  const deleteJob = useDeleteJob()

  const handleConfirmArchive = async () => {
    try {
      setArchiving(true)

      await deleteJob.mutateAsync(jobId)

      toast.success('Job archived')
      router.push('/jobs')
      router.refresh()

    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to archive job')
      setArchiving(false)
    }
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
