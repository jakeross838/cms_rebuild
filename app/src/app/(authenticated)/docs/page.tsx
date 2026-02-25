import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">Platform documentation and guides</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Documentation center coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
