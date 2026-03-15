import dynamic from 'next/dynamic'
const ActivityPreview = dynamic(() => import('@/components/skeleton/previews/activity-preview'), { ssr: false })

export default function UndoHistoryPage() {
  return <ActivityPreview />
}
