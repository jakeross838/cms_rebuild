import { JobContextBar } from '@/components/skeleton/job-context-bar'

export default function JobLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col">
      <JobContextBar />

      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
