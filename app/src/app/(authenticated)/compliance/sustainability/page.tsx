import { Card, CardContent } from '@/components/ui/card'
import { Leaf } from 'lucide-react'

export default function SustainabilityPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sustainability &amp; Compliance</h1>
        <p className="text-muted-foreground">Environmental compliance and sustainability tracking</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Leaf className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Sustainability features coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
