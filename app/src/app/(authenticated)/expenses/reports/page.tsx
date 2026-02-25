import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function ExpenseReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Reports</h1>
        <p className="text-muted-foreground">Generate and submit expense reports</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Expense reports coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
