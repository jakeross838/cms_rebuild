'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

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
  const params = useParams()
  const jobId = params.id as string

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/skeleton/jobs"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Jobs
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          <div>
            <h1 className="font-semibold text-gray-900">{mockJob.name}</h1>
            <p className="text-sm text-gray-500">
              {mockJob.client} &bull; {mockJob.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${mockJob.percentComplete}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {mockJob.percentComplete}%
            </span>
          </div>

          {/* Status */}
          <span
            className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              mockJob.health === 'good' && 'bg-green-100 text-green-700',
              mockJob.health === 'warning' && 'bg-yellow-100 text-yellow-700',
              mockJob.health === 'critical' && 'bg-red-100 text-red-700'
            )}
          >
            {mockJob.status}
          </span>

          {/* Contract Value */}
          <span className="text-sm font-medium text-gray-700">
            ${(mockJob.contractValue / 1000000).toFixed(2)}M
          </span>
        </div>
      </div>
    </div>
  )
}
