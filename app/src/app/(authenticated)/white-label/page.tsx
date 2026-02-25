import { Card, CardContent } from '@/components/ui/card'
import { Paintbrush } from 'lucide-react'

export default function WhiteLabelPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">White-Label &amp; Branding</h1>
        <p className="text-muted-foreground">Custom domains, logos, and themes</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Paintbrush className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">White-label features coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
