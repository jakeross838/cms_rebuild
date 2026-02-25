import { Card, CardContent } from '@/components/ui/card'
import { UserCheck } from 'lucide-react'

export default function EmployeeRevenuePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employee Revenue</h1>
        <p className="text-muted-foreground">Revenue performance by employee</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Employee revenue tracking coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
