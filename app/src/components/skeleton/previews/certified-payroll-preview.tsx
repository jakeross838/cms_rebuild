'use client'

import { useState } from 'react'

import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calendar,
  Users,
  Building,
  Shield,
  FileWarning,
  ClipboardCheck,
  ExternalLink,
  Eye,
  Edit,
  Upload,
  HardHat,
  Calculator,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'


// Mock data for certified payroll
const mockWageDeterminations = [
  {
    id: 1,
    decisionNumber: 'CA20240001',
    state: 'California',
    county: 'Los Angeles',
    constructionType: 'Building',
    effectiveDate: '2024-03-01',
    modifications: 3,
    lastModified: '2024-09-15',
  },
]

const mockClassifications = [
  { id: 1, trade: 'Carpenter', rate: 52.75, fringes: 28.45, total: 81.20, group: 1 },
  { id: 2, trade: 'Cement Mason/Finisher', rate: 48.50, fringes: 26.80, total: 75.30, group: 1 },
  { id: 3, trade: 'Electrician', rate: 58.25, fringes: 32.15, total: 90.40, group: 'Inside Wireman' },
  { id: 4, trade: 'Iron Worker (Structural)', rate: 54.80, fringes: 30.25, total: 85.05, group: 1 },
  { id: 5, trade: 'Laborer', rate: 38.25, fringes: 22.40, total: 60.65, group: 'General' },
  { id: 6, trade: 'Operating Engineer', rate: 56.50, fringes: 31.85, total: 88.35, group: 1 },
  { id: 7, trade: 'Plumber/Pipefitter', rate: 59.75, fringes: 33.50, total: 93.25, group: 'Journeyman' },
]

const mockPayrollReports = [
  {
    id: 1,
    weekEnding: '2025-01-25',
    weekNumber: 4,
    totalEmployees: 18,
    totalHours: 692,
    totalGross: 48440,
    status: 'submitted',
    submittedDate: '2025-01-27',
  },
  {
    id: 2,
    weekEnding: '2025-01-18',
    weekNumber: 3,
    totalEmployees: 16,
    totalHours: 624,
    totalGross: 43680,
    status: 'submitted',
    submittedDate: '2025-01-20',
  },
  {
    id: 3,
    weekEnding: '2025-01-11',
    weekNumber: 2,
    totalEmployees: 14,
    totalHours: 548,
    totalGross: 38360,
    status: 'submitted',
    submittedDate: '2025-01-13',
  },
  {
    id: 4,
    weekEnding: '2025-02-01',
    weekNumber: 5,
    totalEmployees: 20,
    totalHours: 756,
    totalGross: 52920,
    status: 'draft',
    submittedDate: null,
  },
]

const mockEmployeeEntries = [
  {
    id: 1,
    name: 'Rodriguez, Miguel',
    last4SSN: '4521',
    classification: 'Carpenter',
    hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
    totalHours: 40,
    rate: 52.75,
    gross: 2110.00,
    fringes: 1138.00,
    deductions: 422.00,
    netPay: 1688.00,
    compliant: true,
  },
  {
    id: 2,
    name: 'Johnson, Marcus',
    last4SSN: '8834',
    classification: 'Iron Worker (Structural)',
    hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 4, sun: 0 },
    totalHours: 44,
    rate: 54.80,
    gross: 2521.20,
    fringes: 1331.00,
    deductions: 504.24,
    netPay: 2016.96,
    compliant: true,
  },
  {
    id: 3,
    name: 'Williams, David',
    last4SSN: '2267',
    classification: 'Electrician',
    hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
    totalHours: 40,
    rate: 58.25,
    gross: 2330.00,
    fringes: 1286.00,
    deductions: 466.00,
    netPay: 1864.00,
    compliant: true,
  },
  {
    id: 4,
    name: 'Garcia, Jose',
    last4SSN: '9912',
    classification: 'Laborer',
    hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 6, sat: 0, sun: 0 },
    totalHours: 38,
    rate: 38.25,
    gross: 1453.50,
    fringes: 851.20,
    deductions: 290.70,
    netPay: 1162.80,
    compliant: true,
  },
  {
    id: 5,
    name: 'Thompson, Robert',
    last4SSN: '5543',
    classification: 'Operating Engineer',
    hours: { mon: 10, tue: 10, wed: 10, thu: 10, fri: 10, sat: 0, sun: 0 },
    totalHours: 50,
    rate: 56.50,
    gross: 3107.50,
    fringes: 1592.50,
    deductions: 621.50,
    netPay: 2486.00,
    compliant: true,
  },
]

export default function CertifiedPayrollPreview() {
  const [activeTab, setActiveTab] = useState('reports')
  const [selectedWeek, setSelectedWeek] = useState(mockPayrollReports[3])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
      draft: { variant: 'secondary', icon: <Edit className="mr-1 h-3 w-3" />, label: 'Draft' },
      pending_review: { variant: 'outline', icon: <Clock className="mr-1 h-3 w-3" />, label: 'Pending Review' },
      submitted: { variant: 'default', icon: <CheckCircle className="mr-1 h-3 w-3" />, label: 'Submitted' },
      rejected: { variant: 'destructive', icon: <AlertTriangle className="mr-1 h-3 w-3" />, label: 'Rejected' },
    }
    const config = statusConfig[status] || { variant: 'secondary' as const, icon: null, label: status }
    return (
      <Badge variant={config.variant}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certified Payroll</h1>
          <p className="text-muted-foreground">
            Davis-Bacon WH-347 Compliance & Prevailing Wage Tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            SAM.gov Lookup
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Import Timesheet
          </Button>
        </div>
      </div>

      {/* Compliance Alert */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-blue-900">Federal Project: Davis-Bacon Act Applies</h4>
              <Badge className="bg-blue-100 text-blue-800">Active Wage Determination</Badge>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Decision Number: CA20240001 | Modification 3 | Building Construction | Los Angeles County
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Weekly payroll reports (WH-347) must be submitted within 7 days of pay period end.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Week 5</div>
            <p className="text-xs text-muted-foreground">
              Ending Feb 1, 2025
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers on Site</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">
              Across 7 classifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">756</div>
            <p className="text-xs text-muted-foreground">
              Including 56 overtime hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$52,920</div>
            <p className="text-xs text-muted-foreground">
              Gross wages + fringes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
          <TabsTrigger value="wh347">WH-347 Form</TabsTrigger>
          <TabsTrigger value="wage-rates">Wage Determinations</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Payroll Reports</CardTitle>
                  <CardDescription>
                    Certified payroll submissions for this project
                  </CardDescription>
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Week #</TableHead>
                    <TableHead>Week Ending</TableHead>
                    <TableHead className="text-right">Employees</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Gross Payroll</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayrollReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className={selectedWeek.id === report.id ? 'bg-muted/50' : ''}
                      onClick={() => setSelectedWeek(report)}
                    >
                      <TableCell className="font-medium">{report.weekNumber}</TableCell>
                      <TableCell>{report.weekEnding}</TableCell>
                      <TableCell className="text-right">{report.totalEmployees}</TableCell>
                      <TableCell className="text-right">{report.totalHours}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.totalGross)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.submittedDate || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {report.status === 'draft' && (
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wh347" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WH-347 - Week {selectedWeek.weekNumber}</CardTitle>
                  <CardDescription>
                    Payroll week ending {selectedWeek.weekEnding}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Compliance
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
                  {selectedWeek.status === 'draft' && (
                    <Button size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Submit Report
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* WH-347 Header */}
              <div className="grid gap-4 md:grid-cols-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Contractor</Label>
                  <p className="font-medium">BuildDesk Construction LLC</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Project & Location</Label>
                  <p className="font-medium">Metro Office Complex - Los Angeles, CA</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Contract Number</Label>
                  <p className="font-medium">GS-07F-1234X</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Payroll Number</Label>
                  <p className="font-medium">{selectedWeek.weekNumber} for Week Ending {selectedWeek.weekEnding}</p>
                </div>
              </div>

              {/* Employee Payroll Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Name & Last 4 SSN</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead className="text-center">M</TableHead>
                      <TableHead className="text-center">T</TableHead>
                      <TableHead className="text-center">W</TableHead>
                      <TableHead className="text-center">T</TableHead>
                      <TableHead className="text-center">F</TableHead>
                      <TableHead className="text-center">S</TableHead>
                      <TableHead className="text-center">S</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Fringes</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="text-center">
                        <Shield className="h-4 w-4" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEmployeeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">XXX-XX-{entry.last4SSN}</p>
                          </div>
                        </TableCell>
                        <TableCell>{entry.classification}</TableCell>
                        <TableCell className="text-center">{entry.hours.mon || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.tue || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.wed || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.thu || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.fri || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.sat || '-'}</TableCell>
                        <TableCell className="text-center">{entry.hours.sun || '-'}</TableCell>
                        <TableCell className="text-right font-medium">{entry.totalHours}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.gross)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.fringes)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(entry.deductions)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(entry.netPay)}</TableCell>
                        <TableCell className="text-center">
                          {entry.compliant ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Statement of Compliance */}
              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Statement of Compliance</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  I, the undersigned, certify that the payroll for the payroll period commencing on the
                  {' '}<span className="font-medium">25th day of January 2025</span>, and ending the
                  {' '}<span className="font-medium">1st day of February 2025</span>, contains all
                  required information as set forth in Regulations, Parts 3 and 5.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Signature</span>
                      {selectedWeek.status === 'submitted' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedWeek.status === 'submitted'
                        ? 'Electronically signed: John Smith, CFO'
                        : 'Pending signature'}
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Title</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Chief Financial Officer
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedWeek.submittedDate || 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wage-rates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Wage Determination</CardTitle>
                  <CardDescription>
                    Prevailing wage rates from SAM.gov
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Check for Updates
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Wage Determination Info */}
              <div className="p-4 bg-muted/50 rounded-lg mb-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Decision Number</Label>
                    <p className="font-medium">CA20240001</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">State / County</Label>
                    <p className="font-medium">California / Los Angeles</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Construction Type</Label>
                    <p className="font-medium">Building</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Modification</Label>
                    <p className="font-medium">3 (Sep 15, 2024)</p>
                  </div>
                </div>
              </div>

              {/* Classifications Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade Classification</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Basic Hourly Rate</TableHead>
                    <TableHead className="text-right">Fringe Benefits</TableHead>
                    <TableHead className="text-right">Total Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockClassifications.map((classification) => (
                    <TableRow key={classification.id}>
                      <TableCell className="font-medium">{classification.trade}</TableCell>
                      <TableCell>{classification.group}</TableCell>
                      <TableCell className="text-right">{formatCurrency(classification.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(classification.fringes)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(classification.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Apprentice Rates Note */}
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Apprentice Rates</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Apprentices must be registered in a bona fide apprenticeship program.
                      Rates are calculated as a percentage of journeyman rate based on period of apprenticeship.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>
                Davis-Bacon and prevailing wage compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Score */}
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600">100%</div>
                    <p className="text-lg text-muted-foreground mt-2">Compliance Score</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      All Requirements Met
                    </Badge>
                  </div>
                </div>

                {/* Compliance Checklist */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Wage Rate Compliance</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        All workers paid at or above prevailing wage
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Fringe benefits properly calculated
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Overtime rates correctly applied (1.5x)
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Reporting Compliance</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        WH-347 forms submitted on time
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        All required fields completed
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Statement of compliance signed
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Classification Accuracy</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Workers properly classified
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Apprentice ratios maintained
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        No misclassification detected
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h4 className="font-medium">Subcontractor Compliance</h4>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        All sub payrolls received
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Sub wage rates verified
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Sub certifications on file
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Recent Audit Log */}
                <div>
                  <h4 className="font-medium mb-3">Recent Compliance Checks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Automated wage rate verification</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Today, 9:00 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Classification match check</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Today, 8:45 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Week 4 payroll submitted</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Jan 27, 2025</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
