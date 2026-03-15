import dynamic from 'next/dynamic'
const AIABillingPreview = dynamic(() => import('@/components/skeleton/previews/aia-billing-preview'), { ssr: false })

export default function BillingPage() {
  return <AIABillingPreview />
}
