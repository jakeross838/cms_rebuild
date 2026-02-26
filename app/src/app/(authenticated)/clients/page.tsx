import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Plus, Search, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'

interface ClientRow {
  id: string
  name: string
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  created_at: string | null
  jobs: { id: string }[]
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }


  let query = supabase
    .from('clients')
    .select('*, jobs(id)')
    .is('deleted_at', null)
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }

  // lead_source filter deferred until column added to clients table

  const { data: clientsData } = await query
  const clients = (clientsData || []) as ClientRow[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage your client directory</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Client
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search clients..."
              defaultValue={params.search}
              className="pl-10"
            />
          </form>
        </div>
      </div>

      {/* Clients list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {clients.length > 0 ? (
          <div className="divide-y divide-border">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Users className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">
                            {client.name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {client.email || 'No email'} {client.city ? `• ${client.city}, ${client.state}` : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-foreground">
                      {client.jobs?.length || 0} job{client.jobs?.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Since {formatDate(client.created_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No clients found</h3>
            <p className="text-muted-foreground mb-4">
              {params.search
                ? 'Try adjusting your search'
                : 'Get started by adding your first client'}
            </p>
            <Link href="/clients/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
