import dynamic from 'next/dynamic'
const CommunicationsPreview = dynamic(() => import('@/components/skeleton/previews/communications-preview').then(mod => mod.CommunicationsPreview), { ssr: false })

export default function InboxPage() {
  return (
    <div className="p-6">
      <CommunicationsPreview />
    </div>
  )
}
