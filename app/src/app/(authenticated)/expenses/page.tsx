import { Card, CardContent } from '@/components/ui/card'
import { Receipt } from 'lucide-react'

export default function ExpensesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <p className="text-muted-foreground">Track and manage expense reports</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Expense tracking coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
