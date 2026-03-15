import dynamic from 'next/dynamic'
const RFIManagementPreview = dynamic(() => import('@/components/skeleton/previews/rfi-management-preview'), { ssr: false })

export default function RFISLAPage() {
  return <RFIManagementPreview />
}
