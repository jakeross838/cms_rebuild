import { Card, CardContent } from '@/components/ui/card'
import { Gavel } from 'lucide-react'

export default function BiddingPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bid Intelligence</h1>
        <p className="text-muted-foreground">AI-powered bid analysis and optimization</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Gavel className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Bid intelligence coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
