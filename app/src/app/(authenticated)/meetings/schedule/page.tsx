import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default function MeetingSchedulePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meeting Schedule</h1>
        <p className="text-muted-foreground">View upcoming and past meetings</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Meeting scheduling coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
