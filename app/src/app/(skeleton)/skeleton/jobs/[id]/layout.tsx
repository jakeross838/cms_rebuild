import { JobSelectorSidebar } from '@/components/skeleton/job-selector-sidebar'

export default function JobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 overflow-hidden -m-6">
      <JobSelectorSidebar />

      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  )
}
