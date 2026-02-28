'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateSupportTicket } from '@/hooks/use-support'
import { toast } from 'sonner'

export default function NewSupportTicketPage() {
  const router = useRouter()
  const createTicket = useCreateSupportTicket()

  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'normal',
    category: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createTicket.isPending) return
    setError(null)

    if (!formData.subject.trim()) { setError('Subject is required'); return }
    if (!formData.description.trim()) { setError('Description is required'); return }

    try {
      await createTicket.mutateAsync({
        subject: formData.subject,
        description: formData.description || null,
        priority: formData.priority,
        status: 'open',
        channel: 'web',
        category: formData.category || null,
      })

      toast.success('Support ticket created')
      router.push('/support')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create ticket'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/support" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Support
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Support Ticket</h1>
        <p className="text-muted-foreground">Submit a new support request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Ticket Details</CardTitle>
            <CardDescription>Describe your issue or request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">Subject <span className="text-red-500">*</span></label>
              <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="Brief summary of the issue" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description <span className="text-red-500">*</span></label>
              <textarea
                id="description" aria-label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the issue in detail..."
                required
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Billing, Bug, Feature Request" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/support"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createTicket.isPending}>
            {createTicket.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : 'Submit Ticket'}
          </Button>
        </div>
      </form>
    </div>
  )
}
