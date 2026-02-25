import { Card, CardContent } from '@/components/ui/card'
import { Factory } from 'lucide-react'

export default function ProductionPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Production Intelligence</h1>
        <p className="text-muted-foreground">AI-driven production tracking and optimization</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Factory className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Production intelligence coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
