import { Card, CardContent } from '@/components/ui/card'
import { FileSearch } from 'lucide-react'

export default function PlanAnalysisPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Plan Analysis</h1>
        <p className="text-muted-foreground">AI analysis of construction plans and documents</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Plan analysis coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
