import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Plus, Users, Search } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ListPagination } from '@/components/ui/list-pagination'
import { createClient } from '@/lib/supabase/server'
import { escapeLike, formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Team' }

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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const { id: jobId } = await params
  const sp = await searchParams
  const page = Number(sp.page) || 1
  const pageSize = 25
  const offset = (page - 1) * pageSize
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: jobCheck } = await supabase.from('jobs').select('id').eq('id', jobId).eq('company_id', companyId).single()
  if (!jobCheck) { notFound() }

  let rolesQuery = supabase
    .from('project_user_roles')
    .select('*', { count: 'exact' })
    .eq('job_id', jobId)
    .is('deleted_at', null)

  if (sp.search) {
    rolesQuery = rolesQuery.ilike('role_override', `%${escapeLike(sp.search)}%`)
  }

  const { data: rolesData, count } = await rolesQuery
    .range(offset, offset + pageSize - 1)

  const roles = (rolesData || []) as ProjectUserRole[]
  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Job Team</h1>
          <p className="text-muted-foreground">{roles.length} team members assigned</p>
        </div>
        <Link href={`/jobs/${jobId}/team/new`}><Button><Plus className="h-4 w-4 mr-2" />Add Member</Button></Link>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search team members..." aria-label="Search team members" defaultValue={sp.search} className="pl-10" /></form>
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

      <ListPagination currentPage={page} totalPages={totalPages} basePath={`/jobs/${jobId}/team`} searchParams={sp as Record<string, string | undefined>} />
    </div>
  )
}
