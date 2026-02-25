import { Card, CardContent } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'

export default function SubmitExpensePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Submit Expense</h1>
        <p className="text-muted-foreground">Create a new expense submission</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <PlusCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Expense submission coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
