import { Card, CardContent } from '@/components/ui/card'
import { Gift } from 'lucide-react'

export default function BonusesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bonuses</h1>
        <p className="text-muted-foreground">Performance bonuses and incentives</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Gift className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Bonus tracking coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
