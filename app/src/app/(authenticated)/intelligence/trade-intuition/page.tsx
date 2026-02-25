import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

export default function TradeIntuitionPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trade Intuition</h1>
        <p className="text-muted-foreground">AI predictions for trade performance and pricing</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Trade intuition coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
