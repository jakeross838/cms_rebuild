import dynamic from 'next/dynamic'
const AIAssistantPreview = dynamic(() => import('@/components/skeleton/previews/ai-assistant-preview'), { ssr: false })

export default function AIAssistantPage() {
  return <AIAssistantPreview />
}
