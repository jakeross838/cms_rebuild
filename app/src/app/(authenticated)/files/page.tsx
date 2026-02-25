import Link from 'next/link'

import { FolderOpen } from 'lucide-react'

export default async function FilesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Files & Documents</h1>
        <p className="text-muted-foreground">Company-wide document storage</p>
      </div>

      {/* Empty state */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No files uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload files from within a job or use the document storage system
          </p>
          <Link
            href="/jobs"
            className="text-sm font-medium text-primary hover:underline"
          >
            Go to Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
