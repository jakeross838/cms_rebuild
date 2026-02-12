import { UnifiedNav } from '@/components/skeleton/unified-nav'

export const metadata = {
  title: 'RossOS - Skeleton Preview',
  description: 'Visual preview of all views in the Construction Intelligence Platform',
}

export default function SkeletonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <UnifiedNav />

      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  )
}
