import dynamic from 'next/dynamic'
const MeetingsPreview = dynamic(() => import('@/components/skeleton/previews/meetings-preview'), { ssr: false })

export default function MeetingTemplatesPage() {
  return <MeetingsPreview />
}
