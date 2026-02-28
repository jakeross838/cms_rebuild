'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreateAssembly } from '@/hooks/use-estimating'
import { toast } from 'sonner'

export default function NewAssemblyPage() {
  const router = useRouter()
  const createAssembly = useCreateAssembly()

  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    parameter_unit: '',
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createAssembly.isPending) return
    setError(null)

    if (!formData.name.trim()) { setError('Assembly name is required'); return }

    try {
      await createAssembly.mutateAsync({
        name: formData.name,
        category: formData.category || null,
        parameter_unit: formData.parameter_unit || null,
        description: formData.description || null,
        is_active: true,
      })

      toast.success('Assembly created')
      router.push('/library/assemblies')
      router.refresh()
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to create assembly'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/library/assemblies" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to Assemblies
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Assembly</h1>
        <p className="text-muted-foreground">Create a reusable cost assembly</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Assembly Details</CardTitle>
            <CardDescription>Name and categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Assembly Name <span className="text-red-500">*</span></label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Interior Wall Assembly" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="Framing, Electrical, Plumbing..." />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="parameter_unit" className="text-sm font-medium">Parameter Unit</label>
              <Input id="parameter_unit" name="parameter_unit" value={formData.parameter_unit} onChange={handleChange} placeholder="e.g., linear ft, sq ft, each" />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea id="description" aria-label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="What this assembly includes..." className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/library/assemblies"><Button type="button" variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={createAssembly.isPending}>
            {createAssembly.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : 'Create Assembly'}
          </Button>
        </div>
      </form>
    </div>
  )
}
