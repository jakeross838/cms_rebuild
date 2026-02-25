import Link from 'next/link'

import { Camera } from 'lucide-react'

export default async function PhotosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Photos</h1>
        <p className="text-muted-foreground">Project photos across all jobs</p>
      </div>

      {/* Empty state */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="text-center py-12">
          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No photos yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload photos from within a job to see them here
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
