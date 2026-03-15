import dynamic from 'next/dynamic'
const RevenuePreview = dynamic(() => import('@/components/skeleton/previews/revenue-preview'), { ssr: false })

export default function RevenuePage() {
  return <RevenuePreview />
}
