import { CheckCircle, Circle, Loader2, Rocket } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

interface ChecklistItem {
  id: string
  title: string
  description: string | null
  is_completed: boolean | null
  sort_order: number | null
  category: string
}

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: itemsData } = await supabase
    .from('onboarding_checklists')
    .select('*')
    .order('sort_order', { ascending: true })

  const items = (itemsData || []) as ChecklistItem[]
  const completedCount = items.filter((i) => i.is_completed).length
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Rocket className="h-6 w-6" />
          Getting Started
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete these steps to get the most out of RossOS
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Setup Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount} of {items.length} steps completed
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className={item.is_completed ? 'opacity-60' : ''}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                {item.is_completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${item.is_completed ? 'line-through' : ''}`}>
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Rocket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No onboarding steps configured</p>
              <p className="text-sm text-muted-foreground mt-1">Your setup is complete</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
