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
    <div className="flex flex-col h-screen bg-gray-50">
      {children}
    </div>
  )
}
