import { Card, CardContent } from '@/components/ui/card'
import { Calculator } from 'lucide-react'

export default function RevenueFormulasPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue Formulas</h1>
        <p className="text-muted-foreground">Configure revenue calculation formulas</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calculator className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Revenue formulas coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
