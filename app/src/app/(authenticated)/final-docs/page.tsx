import Link from 'next/link'

import { FileCheck, FolderOpen } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FinalDocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Final Documents</h1>
        <p className="text-muted-foreground">Closeout documents, as-builts, and final deliverables</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/warranties">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Warranties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Warranty documents and coverage details for completed jobs
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/files">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                As-Built Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Final plans, specifications, and as-built drawings
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
