import { Card, CardContent } from '@/components/ui/card'
import { Brain } from 'lucide-react'

export default function AIHubPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Command Center</h1>
        <p className="text-muted-foreground">Morning briefings, health scores, and AI insights</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Brain className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">AI Command Center coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
