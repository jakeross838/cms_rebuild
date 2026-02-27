import Link from 'next/link'

import { FileQuestion, Home } from 'lucide-react'

export default function AuthenticatedNotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-foreground">Page not found</h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist, has been moved, or you don&apos;t have access.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  )
}
