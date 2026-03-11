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
import { toast } from 'sonner'

interface RowActionsProps {
  editHref: string
  archiveAction?: {
    entityId: string
    entityType: string
    entityName?: string
  }
}

// Maps entityType used by pages → actual API path for DELETE (soft-delete)
const ENTITY_DELETE_PATH: Record<string, string> = {
  clients: '/api/v1/clients',
  jobs: '/api/v1/jobs',
  vendors: '/api/v1/vendors',
  leads: '/api/v2/crm/leads',
  bids: '/api/v2/bid-packages',
  'punch-lists': '/api/v2/punch-list',
}

function getDeleteUrl(entityType: string, entityId: string): string {
  const basePath = ENTITY_DELETE_PATH[entityType] || `/api/v2/${entityType}`
  return `${basePath}/${entityId}`
}

export function RowActions({ editHref, archiveAction }: RowActionsProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [archiving, setArchiving] = useState(false)

  async function handleArchive() {
    if (!archiveAction) return
    setArchiving(true)
    try {
      const url = getDeleteUrl(archiveAction.entityType, archiveAction.entityId)
      const res = await fetch(url, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${archiveAction.entityName || 'Item'} archived`)
        router.refresh()
      } else {
        toast.error(`Failed to archive ${archiveAction.entityName || 'item'}`)
      }
    } catch {
      toast.error(`Failed to archive ${archiveAction.entityName || 'item'}`)
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
