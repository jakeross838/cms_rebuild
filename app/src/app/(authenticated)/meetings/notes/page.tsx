import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function MeetingNotesPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meeting Notes</h1>
        <p className="text-muted-foreground">View and search meeting notes</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Meeting notes coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
