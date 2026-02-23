'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

// Mock job data - in real app this would come from context/API
const mockJob = {
  id: 'smith-residence',
  name: 'Smith Residence',
  client: 'John & Sarah Smith',
  address: '123 Oceanfront Drive',
  status: 'In Progress',
  percentComplete: 65,
  contractValue: 2450000,
  health: 'good' as 'good' | 'warning' | 'critical',
}

export function JobContextBar() {
  const _params = useParams()

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/skeleton/jobs"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Jobs
          </Link>

          <div className="h-6 w-px bg-border" />

          <div>
            <h1 className="font-semibold text-foreground">{mockJob.name}</h1>
            <p className="text-sm text-muted-foreground">
              {mockJob.client} &bull; {mockJob.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${mockJob.percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-medium text-foreground">
              {mockJob.percentComplete}%
            </span>
          </div>

          {/* Status */}
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              mockJob.health === 'good' && 'bg-green-100 text-green-700',
              mockJob.health === 'warning' && 'bg-amber-100 text-amber-700',
              mockJob.health === 'critical' && 'bg-red-100 text-red-700'
            )}
          >
            {mockJob.status}
          </span>

          {/* Contract Value */}
          <span className="text-sm font-medium text-foreground">
            ${(mockJob.contractValue / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>
    </div>
  )
}
