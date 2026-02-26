import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FileText, Clock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getStatusColor } from '@/lib/utils'

interface PayrollExportRow {
  id: string
  payroll_period_id: string | null
  export_format: string
  file_path: string | null
  total_hours: number | null
  total_amount: number | null
  employee_count: number | null
  exported_by: string | null
  created_at: string
}

export default async function CertifiedPayrollPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }
  const { data: profile } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  const companyId = profile?.company_id
  if (!companyId) { redirect('/login') }

  const { data: exportsData } = await supabase
    .from('payroll_exports')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(50)

  const exports = (exportsData || []) as PayrollExportRow[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certified Payroll</h1>
        <p className="text-muted-foreground">{exports.length} payroll exports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payroll Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exports.length > 0 ? (
            <div className="divide-y divide-border">
              {exports.map((exp) => (
                <div key={exp.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Payroll Export &mdash; {exp.export_format}
                        </span>
                        {exp.employee_count != null && (
                          <Badge variant="outline" className="text-xs">{exp.employee_count} employees</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {exp.total_hours != null && <span>{exp.total_hours}h total</span>}
                        {exp.export_format && <span>Format: {exp.export_format}</span>}
                        <span>{formatDate(exp.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">No payroll exports yet</p>
              <p className="text-sm text-muted-foreground mt-1">Payroll data will appear here when time entries are exported</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
