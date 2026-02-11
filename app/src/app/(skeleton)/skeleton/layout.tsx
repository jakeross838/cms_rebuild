import { CompanyNav } from '@/components/skeleton/company-nav'

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Company Navigation */}
      <CompanyNav />

      {/* Page content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
