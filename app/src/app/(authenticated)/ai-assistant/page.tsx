import { Card, CardContent } from '@/components/ui/card'
import { Bot } from 'lucide-react'

export default function AIAssistantPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-muted-foreground">Your intelligent construction management companion</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Bot className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">AI Assistant coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
