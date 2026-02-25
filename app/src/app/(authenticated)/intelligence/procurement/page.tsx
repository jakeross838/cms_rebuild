import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart } from 'lucide-react'

export default function ProcurementPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Procurement Intelligence</h1>
        <p className="text-muted-foreground">AI-optimized purchasing and vendor selection</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Procurement intelligence coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
