import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function ExpenseApprovalsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Expense Approvals</h1>
        <p className="text-muted-foreground">Review and approve expense submissions</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Expense approvals coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
