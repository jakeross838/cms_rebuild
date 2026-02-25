import { Card, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'

export default function AccuracyEnginePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accuracy Engine</h1>
        <p className="text-muted-foreground">Track and improve estimate accuracy over time</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Target className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Accuracy engine coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
