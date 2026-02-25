import Link from 'next/link'

import { Plus, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface ProjectUserRole {
  id: string
  user_id: string
  role_id: string | null
  role_override: string | null
  granted_by: string
  created_at: string | null
}

export default async function JobTeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: rolesData } = await supabase
    .from('project_user_roles')
    .select('*')
    .eq('job_id', jobId)

  const roles = (rolesData || []) as ProjectUserRole[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Team</h1>
          <p className="text-muted-foreground">{roles.length} team members assigned</p>
        </div>
        <Link href={`/jobs/${jobId}/team/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Member</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roles.length > 0 ? (
            <div className="divide-y divide-border">
              {roles.map((role) => (
                <div key={role.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm font-mono">{role.user_id.slice(0, 8)}...</span>
                      {role.role_override && <Badge variant="outline" className="text-xs">{role.role_override}</Badge>}
                    </div>
                    {role.created_at && <span className="text-xs text-muted-foreground">Added {formatDate(role.created_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No team members assigned to this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
