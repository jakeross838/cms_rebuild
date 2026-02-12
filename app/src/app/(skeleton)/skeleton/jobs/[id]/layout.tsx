import { JobSidebar } from '@/components/skeleton/job-sidebar'

export default function JobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 overflow-hidden -m-6">
      <JobSidebar />

      <div className="flex-1 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  )
}
