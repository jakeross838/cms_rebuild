import { JobSelectorSidebar } from '@/components/layout/job-selector-sidebar'

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 overflow-hidden -m-4 md:-m-6">
      {/* Job selector sidebar */}
      <JobSelectorSidebar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}
