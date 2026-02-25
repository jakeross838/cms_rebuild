import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

export default function VendorReviewsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vendor Reviews</h1>
        <p className="text-muted-foreground">Community vendor ratings and reviews</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Vendor reviews coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
