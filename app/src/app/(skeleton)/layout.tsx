import { SkeletonTopNav } from '@/components/skeleton/skeleton-top-nav'
import { SkeletonJobFilter } from '@/components/skeleton/skeleton-job-filter'

export const metadata = {
  title: 'RossOS - Skeleton Preview',
  description: 'Visual preview of all views in the Construction Intelligence Platform',
}

export default function SkeletonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navigation */}
      <SkeletonTopNav />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden relative z-0">
        {/* Job Filter Sidebar */}
        <SkeletonJobFilter />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
