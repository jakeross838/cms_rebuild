import { JobNav } from '@/components/skeleton/job-nav'

export default function JobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
      {/* Job Navigation */}
      <JobNav />

      {/* Job Page content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
