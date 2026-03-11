import type { Metadata } from 'next'
import Link from 'next/link'

import {
  Mail,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Image,
  FileType,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { getServerAuth } from '@/lib/supabase/get-auth'
import { createServiceClient } from '@/lib/supabase/service'
import { formatDate, cn } from '@/lib/utils'
import { CopyEmailButton } from '@/components/invoices/copy-email-button'

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = { title: 'Email Forwarding Setup' }

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EmailSetupPage() {
  const { companyId } = await getServerAuth()

  const forwardingEmail = `invoices-${companyId.slice(0, 8)}@inbox.rossos.com`

  // Fetch recent email-sourced extractions
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('invoice_extractions' as any)
    .select('id, status, confidence_score, extracted_data, created_at, reviewed_by')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Filter for email-sourced extractions
  const emailExtractions = ((data ?? []) as Array<{
    id: string
    status: string
    confidence_score: number | null
    extracted_data: Record<string, unknown>
    created_at: string
    reviewed_by: string | null
  }>).filter((row) => {
    const meta = (row.extracted_data?._meta ?? {}) as Record<string, unknown>
    return meta.source_type === 'email'
  }).slice(0, 10)

  const steps = [
    { number: 1, text: 'Copy the forwarding address above' },
    { number: 2, text: 'In your email client, create a forwarding rule for invoices' },
    { number: 3, text: 'Forward vendor invoices to this address' },
    { number: 4, text: 'Invoices appear in your extraction queue within minutes' },
  ]

  const supportedFormats = [
    { icon: FileType, label: 'PDF', description: 'Invoice PDFs with text or scanned' },
    { icon: Image, label: 'PNG / JPG', description: 'Photos or screenshots of invoices' },
    { icon: FileText, label: 'TIFF', description: 'Multi-page scanned documents' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/invoices/extractions"
            className="mt-1 p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email Forwarding Setup
            </h1>
            <p className="text-muted-foreground">
              Forward invoices to your dedicated email address for automatic AI processing
            </p>
          </div>
        </div>
        <Link href="/invoices/extractions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </Link>
      </div>

      {/* Email Address Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-5 w-5 text-primary" />
            Your Forwarding Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 bg-accent/50 border border-border rounded-lg px-4 py-3">
              <code className="text-sm font-mono font-medium text-foreground">
                {forwardingEmail}
              </code>
            </div>
            <CopyEmailButton email={forwardingEmail} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Forward invoices from any email client to this address. They will be automatically
            queued for AI extraction.
          </p>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Setup Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Setup Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {steps.map((step) => (
                <li key={step.number} className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step.number}
                  </span>
                  <span className="text-sm text-foreground pt-0.5">{step.text}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Supported Formats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-blue-500" />
              Supported Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supportedFormats.map((format) => {
                const Icon = format.icon
                return (
                  <div key={format.label} className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{format.label}</p>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Limits:</strong> Max 25MB per email. Multiple attachments are processed individually.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Forwarded Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-5 w-5 text-amber-500" />
            Recent Email-Forwarded Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailExtractions.length === 0 ? (
            <div className="py-8 text-center">
              <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No email-forwarded invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Forward an invoice to the address above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 font-medium text-muted-foreground">Document</th>
                    <th className="pb-2 font-medium text-muted-foreground">Vendor</th>
                    <th className="pb-2 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Confidence</th>
                    <th className="pb-2 font-medium text-muted-foreground text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {emailExtractions.map((row) => {
                    const meta = (row.extracted_data?._meta ?? {}) as Record<string, unknown>
                    const filename = (meta.original_filename as string) ?? 'Unknown file'
                    const vendorName = (row.extracted_data?.vendor_name as string) ?? '—'
                    const confidence = typeof row.confidence_score === 'number' ? row.confidence_score : null

                    let statusLabel = 'Processing'
                    let statusClass = 'bg-amber-100 text-amber-700'
                    if (row.status === 'completed' && row.reviewed_by) {
                      statusLabel = 'Confirmed'
                      statusClass = 'bg-emerald-100 text-emerald-700'
                    } else if (row.status === 'completed') {
                      statusLabel = 'Ready'
                      statusClass = 'bg-blue-100 text-blue-700'
                    } else if (row.status === 'needs_review') {
                      statusLabel = 'Needs Review'
                      statusClass = 'bg-amber-100 text-amber-700'
                    } else if (row.status === 'failed') {
                      statusLabel = 'Failed'
                      statusClass = 'bg-red-100 text-red-700'
                    }

                    return (
                      <tr key={row.id}>
                        <td className="py-2">
                          <Link
                            href={`/invoices/extractions/${row.id}`}
                            className="text-foreground hover:text-primary transition-colors font-medium"
                          >
                            {filename}
                          </Link>
                        </td>
                        <td className="py-2 text-muted-foreground">{vendorName}</td>
                        <td className="py-2">
                          <span className={cn(
                            'inline-flex items-center text-xs px-2 py-0.5 rounded font-medium',
                            statusClass,
                          )}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          {confidence != null ? (
                            <span className={cn(
                              'font-mono text-xs font-medium',
                              confidence >= 80 ? 'text-emerald-600' :
                              confidence >= 60 ? 'text-amber-600' : 'text-red-600',
                            )}>
                              {confidence}%
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60">—</span>
                          )}
                        </td>
                        <td className="py-2 text-right text-muted-foreground">
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
