import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  FileSearch,
  ArrowRight,
  FileText,
  FolderOpen,
  Image,
  File,
  FileSpreadsheet,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

// ── Helpers ──────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ── Page ─────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Plan Analysis' }

export default async function PlanAnalysisPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  // ── Parallel data fetching ──
  const [
    totalDocsRes,
    classifiedDocsRes,
    docsWithSizeRes,
    recentDocsRes,
  ] = await Promise.all([
    supabase.from('documents').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('documents').select('*', { count: 'exact', head: true })
      .eq('company_id', companyId).is('deleted_at', null)
      .not('ai_classification', 'is', null),
    supabase.from('documents').select('file_size, mime_type, document_type')
      .eq('company_id', companyId).is('deleted_at', null),
    supabase.from('documents').select('id, filename, mime_type, file_size, document_type, ai_classification, created_at')
      .eq('company_id', companyId).is('deleted_at', null)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const totalDocs = totalDocsRes.count || 0
  const classifiedDocs = classifiedDocsRes.count || 0

  const allDocs = (docsWithSizeRes.data || []) as {
    file_size: number; mime_type: string; document_type: string | null
  }[]

  const totalStorageBytes = allDocs.reduce((sum, d) => sum + (d.file_size || 0), 0)

  // ── Count by mime type category ──
  let pdfCount = 0
  let imageCount = 0
  let spreadsheetCount = 0
  let otherCount = 0

  for (const doc of allDocs) {
    const mime = doc.mime_type || ''
    if (mime.includes('pdf')) pdfCount++
    else if (mime.startsWith('image/')) imageCount++
    else if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('csv')) spreadsheetCount++
    else otherCount++
  }

  const recentDocs = (recentDocsRes.data || []) as {
    id: string; filename: string; mime_type: string; file_size: number
    document_type: string | null; ai_classification: string | null; created_at: string | null
  }[]

  function getFileIcon(mime: string) {
    if (mime.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />
    if (mime.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />
    if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    return <File className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileSearch className="h-6 w-6" />
          Plan Analysis
        </h1>
        <p className="text-muted-foreground mt-1">AI analysis of construction plans and documents</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{totalDocs}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">AI Classified</p>
                <p className="text-2xl font-bold">{classifiedDocs}</p>
              </div>
              <FileSearch className="h-8 w-8 text-purple-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Storage</p>
                <p className="text-2xl font-bold">{formatFileSize(totalStorageBytes)}</p>
              </div>
              <File className="h-8 w-8 text-green-500/70" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Classification Rate</p>
                <p className="text-2xl font-bold">
                  {totalDocs > 0 ? Math.round((classifiedDocs / totalDocs) * 100) : 0}%
                </p>
              </div>
              <FileSearch className="h-8 w-8 text-amber-500/70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Type Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document Type Breakdown</CardTitle>
          <CardDescription>Files by format category</CardDescription>
        </CardHeader>
        <CardContent>
          {totalDocs > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-red-50">
                <FileText className="h-6 w-6 text-red-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-700">{pdfCount}</p>
                <p className="text-xs text-muted-foreground">PDFs</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <Image className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-blue-700">{imageCount}</p>
                <p className="text-xs text-muted-foreground">Images</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <FileSpreadsheet className="h-6 w-6 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-green-700">{spreadsheetCount}</p>
                <p className="text-xs text-muted-foreground">Spreadsheets</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50">
                <File className="h-6 w-6 text-slate-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-700">{otherCount}</p>
                <p className="text-xs text-muted-foreground">Other</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents uploaded yet. Upload files to start AI analysis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Documents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Recent Documents
            </CardTitle>
            <Link href="/files" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentDocs.length > 0 ? (
            <div className="divide-y divide-border">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {getFileIcon(doc.mime_type)}
                      <span className="text-sm font-medium truncate">{doc.filename}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {doc.ai_classification && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          {doc.ai_classification}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No documents yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Link */}
      <Link href="/files">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-indigo-100">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium">Document Library</p>
              <p className="text-xs text-muted-foreground">Browse all uploaded documents and files</p>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
