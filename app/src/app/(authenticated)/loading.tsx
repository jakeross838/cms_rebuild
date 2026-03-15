import { ListPageSkeleton } from '@/components/ui/loading-skeletons'

/**
 * Authenticated route loading state (0C-8)
 * Shown during navigation between authenticated pages.
 */
export default function AuthenticatedLoading(): React.ReactElement {
  return <ListPageSkeleton />
}
