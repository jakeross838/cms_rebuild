'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Archive } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface RowActionsProps {
  editHref: string
  archiveAction?: {
    entityId: string
    entityType: string
    entityName?: string
  }
}

export function RowActions({ editHref, archiveAction }: RowActionsProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [archiving, setArchiving] = useState(false)

  async function handleArchive() {
    if (!archiveAction) return
    setArchiving(true)
    try {
      const res = await fetch(`/api/${archiveAction.entityType}/${archiveAction.entityId}/archive`, {
        method: 'POST',
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setArchiving(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              router.push(editHref)
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          {archiveAction && (
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowConfirm(true)
              }}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {archiveAction && (
        <ConfirmDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          title={`Archive ${archiveAction.entityName || 'item'}?`}
          description={`This will archive the ${archiveAction.entityName || 'item'}. You can restore it later.`}
          confirmLabel="Archive"
          variant="destructive"
          onConfirm={handleArchive}
          loading={archiving}
        />
      )}
    </>
  )
}
