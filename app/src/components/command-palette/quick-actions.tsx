'use client'

import { Command } from 'cmdk'
import {
  Briefcase,
  Users,
  Building2,
  Plus,
  ArrowRight,
} from 'lucide-react'

import type { QuickAction } from '@/types/search'

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Users,
  Building2,
}

interface QuickActionItemProps {
  action: QuickAction
  onSelect: (href: string) => void
}

export function QuickActionItem({ action, onSelect }: QuickActionItemProps) {
  const Icon = iconMap[action.icon] || ArrowRight

  return (
    <Command.Item
      value={action.id}
      onSelect={() => onSelect(action.href)}
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-accent group"
    >
      {action.category === 'create' ? (
        <Plus className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{action.label}</div>
        <div className="text-xs text-muted-foreground truncate">{action.description}</div>
      </div>
      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-data-[selected=true]:opacity-100 shrink-0 transition-opacity" />
    </Command.Item>
  )
}
