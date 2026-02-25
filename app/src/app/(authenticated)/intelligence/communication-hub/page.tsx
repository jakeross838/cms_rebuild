import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function CommunicationHubPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Communication Hub</h1>
        <p className="text-muted-foreground">AI-managed communications and follow-ups</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Communication hub coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
