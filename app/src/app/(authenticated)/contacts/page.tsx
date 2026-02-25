import Link from 'next/link'

import { Plus, Search, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/server'

interface VendorContact {
  id: string
  name: string
  email: string | null
  phone: string | null
  title: string | null
  is_primary: boolean
  vendor_id: string
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('vendor_contacts')
    .select('*')
    .order('name', { ascending: true })

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%`)
  }

  const { data: contactsData } = await query
  const contacts = (contactsData || []) as VendorContact[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">{contacts.length} contacts</p>
        </div>
        <Link href="/contacts/new"><Button><Plus className="h-4 w-4 mr-2" />Add Contact</Button></Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form><Input type="search" name="search" placeholder="Search contacts..." defaultValue={params.search} className="pl-10" /></form>
      </div>

      {contacts.length > 0 ? (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <Link key={contact.id} href={`/contacts/${contact.id}`} className="block">
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contact.name}</span>
                        {contact.is_primary && <Badge className="text-blue-700 bg-blue-100">Primary</Badge>}
                        {contact.title && <Badge variant="outline" className="text-xs">{contact.title}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 ml-6">
                        {contact.email && <span>{contact.email}</span>}
                        {contact.phone && <span> &bull; {contact.phone}</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No contacts found</h3>
          <p className="text-muted-foreground">{params.search ? 'Try adjusting your search' : 'Add vendor contacts and team members'}</p>
        </div>
      )}
    </div>
  )
}
