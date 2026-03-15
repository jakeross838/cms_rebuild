import { Skeleton } from '@/components/ui/skeleton'

/**
 * Dashboard loading skeleton — matches stats cards + recent items layout
 */
export function DashboardSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <Skeleton className="h-8 w-48" />

      {/* Stats cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent items */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * List page skeleton — matches filter bar + item rows layout
 */
export function ListPageSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Page header with title and action button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* List items */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Detail page skeleton — matches header + content sections layout
 */
export function DetailPageSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-20" />

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Form page skeleton — matches form layout with fields
 */
export function FormPageSkeleton(): React.ReactElement {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <Skeleton className="h-4 w-20" />

      {/* Title */}
      <Skeleton className="h-8 w-48" />

      {/* Form fields */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}
