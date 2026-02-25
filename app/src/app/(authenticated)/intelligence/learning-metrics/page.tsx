import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

export default function LearningMetricsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Learning Metrics</h1>
        <p className="text-muted-foreground">Track AI learning and improvement metrics</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Learning metrics coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
