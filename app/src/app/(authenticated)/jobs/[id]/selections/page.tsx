import { Plus, Palette } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Selection {
  id: string
  status: string
  room: string | null
  selected_at: string | null
  confirmed_at: string | null
  category_id: string
  option_id: string
  created_at: string
}

export default async function JobSelectionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: selectionsData } = await supabase
    .from('selections')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const selections = (selectionsData || []) as Selection[]

  const confirmed = selections.filter((s) => s.status === 'confirmed').length
  const pending = selections.filter((s) => s.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Selections</h1>
          <p className="text-muted-foreground">{selections.length} selections &bull; {confirmed} confirmed &bull; {pending} pending</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Selection</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Product Selections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selections.length > 0 ? (
            <div className="divide-y divide-border">
              {selections.map((sel) => (
                <div key={sel.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(sel.status)}>{sel.status}</Badge>
                        {sel.room && <Badge variant="outline" className="text-xs">{sel.room}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sel.selected_at && `Selected ${formatDate(sel.selected_at)}`}
                        {sel.confirmed_at && ` • Confirmed ${formatDate(sel.confirmed_at)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Palette className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No selections made for this job yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
