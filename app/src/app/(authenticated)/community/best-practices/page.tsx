import { Card, CardContent } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function BestPracticesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Best Practices</h1>
        <p className="text-muted-foreground">Industry best practices and tips</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Award className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Best practices library coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
