import Link from 'next/link'

import { Plus, MessageSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface Message {
  id: string
  subject: string | null
  message_text: string
  sender_type: string
  status: string
  category: string | null
  topic: string | null
  read_at: string | null
  created_at: string | null
}

export default async function JobCommunicationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: jobId } = await params
  const supabase = await createClient()

  const { data: messagesData } = await supabase
    .from('client_messages')
    .select('*')
    .eq('job_id', jobId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  const messages = (messagesData || []) as Message[]

  const unread = messages.filter((m) => !m.read_at).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communications</h1>
          <p className="text-muted-foreground">{messages.length} messages &bull; {unread} unread</p>
        </div>
        <Link href={`/jobs/${jobId}/communications/new`}><Button><Plus className="h-4 w-4 mr-2" />New Message</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="divide-y divide-border">
              {messages.map((msg) => (
                <div key={msg.id} className={`py-3 first:pt-0 last:pb-0 ${!msg.read_at ? 'bg-blue-50/50 -mx-2 px-2 rounded-lg' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {msg.subject && <span className="font-medium">{msg.subject}</span>}
                        <Badge variant="outline" className="text-xs">{msg.sender_type}</Badge>
                        {msg.category && <Badge variant="outline" className="text-xs">{msg.category}</Badge>}
                        {!msg.read_at && <Badge className="text-blue-700 bg-blue-100">Unread</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{msg.message_text}</p>
                    </div>
                    {msg.created_at && <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{formatDate(msg.created_at)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No messages for this job</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
