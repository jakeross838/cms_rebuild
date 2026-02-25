import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'

export default function ForumsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Forums</h1>
        <p className="text-muted-foreground">Discussion forums for the builder community</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Community forums coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
