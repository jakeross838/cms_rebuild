'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { ArrowLeft, Loader2, Save } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Input } from '@/components/ui/input'
import { useContactFlat, useUpdateContactFlat } from '@/hooks/use-vendor-management'
import { fetchJson } from '@/lib/api/fetch'
import { toast } from 'sonner'

interface ContactData {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  is_primary: boolean
  vendor_id: string
  created_at: string | null
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string

  const { data: response, isLoading, error: fetchError } = useContactFlat(contactId)
  const updateMutation = useUpdateContactFlat(contactId)

  const contact = (response as { data: ContactData } | undefined)?.data ?? null

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    is_primary: 'false',
  })

  // ── Sync form data from hook response ─────────────────────────
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        title: contact.title || '',
        email: contact.email || '',
        phone: contact.phone || '',
        is_primary: contact.is_primary ? 'true' : 'false',
      })
    }
  }, [contact])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleConfirmArchive = async () => {
    setArchiving(true)
    try {
      await fetchJson(`/api/v2/contacts/${contactId}`, { method: 'DELETE' })
      toast.success('Archived')
      router.push('/contacts')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to archive'
      setError(errorMessage)
      toast.error(errorMessage)
      setArchiving(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    setError(null)

    try {
      await updateMutation.mutateAsync({
        name: formData.name,
        title: formData.title || null,
        email: formData.email || null,
        phone: formData.phone || null,
        is_primary: formData.is_primary === 'true',
      })

      toast.success('Saved')
      setEditing(false)
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to save'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/contacts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contacts
        </Link>
        <p className="text-destructive">{fetchError?.message || error || 'Contact not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/contacts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Contacts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{contact.name}</h1>
              {contact.is_primary && <Badge className="text-blue-700 bg-blue-100">Primary</Badge>}
            </div>
            <p className="text-muted-foreground">
              {contact.title || 'No title'}
              {' — Vendor ID: '}{contact.vendor_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
              <Button onClick={() => setEditing(true)} variant="outline">Edit</Button>
              <Button onClick={() => setShowArchiveDialog(true)} disabled={archiving} variant="outline" className="text-destructive hover:text-destructive">{archiving ? 'Archiving...' : 'Archive'}</Button>
              </>
            ) : (
              <>
                <Button onClick={() => { setEditing(false); setError(null) }} variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

      <div className="space-y-6">
        {!editing ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2">{contact.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <span className="ml-2">{contact.title || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{contact.email || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{contact.phone || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Primary Contact:</span>
                    <span className="ml-2">{contact.is_primary ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vendor ID:</span>
                    <span className="ml-2 font-mono text-xs">{contact.vendor_id}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Update contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Project Manager, Foreman" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="is_primary" className="text-sm font-medium">Primary Contact</label>
                  <select id="is_primary" name="is_primary" value={formData.is_primary} onChange={handleChange} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ConfirmDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        title="Archive this contact?"
        description="This contact will be archived. It can be restored later."
        confirmLabel="Archive"
        onConfirm={handleConfirmArchive}
      />
    </div>
  )
}
