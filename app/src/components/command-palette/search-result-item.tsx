'use client'

import { Command } from 'cmdk'
import { Briefcase, Users, Building2, FileText } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { SearchResult, SearchEntityType } from '@/types/search'

const entityConfig: Record<SearchEntityType, { icon: React.ElementType; color: string }> = {
  jobs: { icon: Briefcase, color: 'text-blue-500' },
  clients: { icon: Users, color: 'text-green-500' },
  vendors: { icon: Building2, color: 'text-purple-500' },
  invoices: { icon: FileText, color: 'text-amber-500' },
}

interface SearchResultItemProps {
  result: SearchResult
  onSelect: (url: string) => void
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const config = entityConfig[result.entity_type]
  const Icon = config.icon

  return (
    <Command.Item
      value={`${result.entity_type}-${result.id}`}
      onSelect={() => onSelect(result.url)}
      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer data-[selected=true]:bg-accent"
    >
      <Icon className={cn('h-4 w-4 shrink-0', config.color)} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{result.title}</div>
        {result.subtitle ? (
          <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
        ) : null}
      </div>
      {result.status ? (
        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
          {result.status.replace(/_/g, ' ')}
        </span>
      ) : null}
    </Command.Item>
  )
}

export { entityConfig }
