/**
 * Unauthorized page (0C-8)
 * Displayed by Next.js when unauthorized() is called.
 */

import Link from 'next/link'

export default function Unauthorized(): React.ReactElement {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">401</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
