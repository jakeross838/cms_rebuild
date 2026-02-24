/**
 * Authenticated route loading state (0C-8)
 * Shown during navigation between authenticated pages.
 */

export default function AuthenticatedLoading(): React.ReactElement {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
