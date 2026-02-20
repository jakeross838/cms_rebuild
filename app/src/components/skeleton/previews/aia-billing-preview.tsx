'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Calculator,
  FileSignature,
  Building,
  Calendar,
  Printer,
  Eye,
  Plus,
  ArrowRight,
  Lock,
  Unlock,
  History,
  Shield,
} from 'lucide-react'

// Mock data for AIA billing
const mockPayApplications = [
  {
    id: 1,
    number: 12,
    periodTo: '2025-01-31',
    scheduledValue: 4850000,
    previousBilled: 2425000,
    thisPeriod: 485000,
    totalCompleted: 2910000,
    percentComplete: 60,
    retainage: 145500,
    status: 'draft',
    dueDate: '2025-02-05',
  },
  {
    id: 2,
    number: 11,
    periodTo: '2024-12-31',
    scheduledValue: 4850000,
    previousBilled: 1940000,
    thisPeriod: 485000,
    totalCompleted: 2425000,
    percentComplete: 50,
    retainage: 121250,
    status: 'paid',
    paidDate: '2025-01-15',
  },
  {
    id: 3,
    number: 10,
    periodTo: '2024-11-30',
    scheduledValue: 4850000,
    previousBilled: 1455000,
    thisPeriod: 485000,
    totalCompleted: 1940000,
    percentComplete: 40,
    retainage: 97000,
    status: 'paid',
    paidDate: '2024-12-18',
  },
]

const mockSOVItems = [
  {
    id: 1,
    number: '01',
    description: 'General Conditions',
    scheduledValue: 350000,
    previousBilled: 175000,
    thisPeriod: 35000,
    percentComplete: 60,
    balanceToFinish: 140000,
    retainage: 10500,
  },
  {
    id: 2,
    number: '02',
    description: 'Sitework & Earthwork',
    scheduledValue: 425000,
    previousBilled: 382500,
    thisPeriod: 21250,
    percentComplete: 95,
    balanceToFinish: 21250,
    retainage: 20188,
  },
  {
    id: 3,
    number: '03',
    description: 'Concrete',
    scheduledValue: 680000,
    previousBilled: 476000,
    thisPeriod: 68000,
    percentComplete: 80,
    balanceToFinish: 136000,
    retainage: 27200,
  },
  {
    id: 4,
    number: '04',
    description: 'Masonry',
    scheduledValue: 285000,
    previousBilled: 114000,
    thisPeriod: 42750,
    percentComplete: 55,
    balanceToFinish: 128250,
    retainage: 7838,
  },
  {
    id: 5,
    number: '05',
    description: 'Structural Steel',
    scheduledValue: 520000,
    previousBilled: 390000,
    thisPeriod: 52000,
    percentComplete: 85,
    balanceToFinish: 78000,
    retainage: 22100,
  },
  {
    id: 6,
    number: '06',
    description: 'Rough Carpentry',
    scheduledValue: 195000,
    previousBilled: 78000,
    thisPeriod: 29250,
    percentComplete: 55,
    balanceToFinish: 87750,
    retainage: 5363,
  },
  {
    id: 7,
    number: '07',
    description: 'Roofing & Waterproofing',
    scheduledValue: 310000,
    previousBilled: 0,
    thisPeriod: 0,
    percentComplete: 0,
    balanceToFinish: 310000,
    retainage: 0,
  },
]

const mockLienWaivers = [
  {
    id: 1,
    vendor: 'ABC Concrete Co.',
    type: 'conditional_progress',
    amount: 68000,
    throughDate: '2025-01-31',
    status: 'pending',
    requiredFor: 'Pay App #12',
  },
  {
    id: 2,
    vendor: 'Steel Solutions Inc.',
    type: 'conditional_progress',
    amount: 52000,
    throughDate: '2025-01-31',
    status: 'received',
    requiredFor: 'Pay App #12',
  },
  {
    id: 3,
    vendor: 'Metro Masonry',
    type: 'unconditional_progress',
    amount: 35000,
    throughDate: '2024-12-31',
    status: 'received',
    requiredFor: 'Pay App #11',
  },
]

const lienWaiverTypes = {
  conditional_progress: { label: 'Conditional Progress', color: 'bg-yellow-100 text-yellow-800' },
  unconditional_progress: { label: 'Unconditional Progress', color: 'bg-blue-100 text-blue-800' },
  conditional_final: { label: 'Conditional Final', color: 'bg-orange-100 text-orange-800' },
  unconditional_final: { label: 'Unconditional Final', color: 'bg-green-100 text-green-800' },
}

export default function AIABillingPreview() {
  const [activeTab, setActiveTab] = useState('pay-applications')
  const [selectedApplication, setSelectedApplication] = useState(mockPayApplications[0])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      pending_approval: { variant: 'outline', label: 'Pending Approval' },
      submitted: { variant: 'default', label: 'Submitted' },
      approved: { variant: 'default', label: 'Approved' },
      paid: { variant: 'default', label: 'Paid' },
      rejected: { variant: 'destructive', label: 'Rejected' },
    }
    const config = statusConfig[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AIA Billing</h1>
          <p className="text-muted-foreground">
            G702/G703 Pay Applications & Lien Waivers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            Billing History
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Pay Application
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,850,000</div>
            <p className="text-xs text-muted-foreground">
              Original: $4,500,000 + COs: $350,000
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billed to Date</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,910,000</div>
            <Progress value={60} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">60% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retainage Held</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145,500</div>
            <p className="text-xs text-muted-foreground">
              5% retention rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Waivers</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Required for Pay App #12
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pay-applications">Pay Applications</TabsTrigger>
          <TabsTrigger value="schedule-of-values">Schedule of Values</TabsTrigger>
          <TabsTrigger value="lien-waivers">Lien Waivers</TabsTrigger>
          <TabsTrigger value="retainage">Retainage</TabsTrigger>
        </TabsList>

        <TabsContent value="pay-applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pay Application History</CardTitle>
              <CardDescription>
                AIA G702 Application and Certificate for Payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App #</TableHead>
                    <TableHead>Period To</TableHead>
                    <TableHead className="text-right">This Period</TableHead>
                    <TableHead className="text-right">Total Completed</TableHead>
                    <TableHead className="text-right">% Complete</TableHead>
                    <TableHead className="text-right">Retainage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayApplications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">#{app.number}</TableCell>
                      <TableCell>{app.periodTo}</TableCell>
                      <TableCell className="text-right">{formatCurrency(app.thisPeriod)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(app.totalCompleted)}</TableCell>
                      <TableCell className="text-right">{app.percentComplete}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(app.retainage)}</TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {app.status === 'draft' && (
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

          {/* Current Pay Application Detail */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pay Application #{selectedApplication.number}</CardTitle>
                  <CardDescription>
                    Period ending {selectedApplication.periodTo}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export G702
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export G703
                  </Button>
                  <Button size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Approval
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                {/* G702 Summary */}
                <div className="space-y-4 col-span-2">
                  <h4 className="font-semibold">Application Summary (G702)</h4>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span>1. Original Contract Sum</span>
                      <span className="font-medium">$4,500,000.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>2. Net Change by Change Orders</span>
                      <span className="font-medium">$350,000.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>3. Contract Sum to Date (1 + 2)</span>
                      <span className="font-medium">$4,850,000.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>4. Total Completed & Stored to Date</span>
                      <span className="font-medium">$2,910,000.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>5. Retainage (5% of Line 4)</span>
                      <span className="font-medium">$145,500.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>6. Total Earned Less Retainage (4 - 5)</span>
                      <span className="font-medium">$2,764,500.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span>7. Less Previous Certificates for Payment</span>
                      <span className="font-medium">$2,303,750.00</span>
                    </div>
                    <div className="flex justify-between py-2 border-b bg-muted/50 font-semibold">
                      <span>8. Current Payment Due</span>
                      <span>$460,750.00</span>
                    </div>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Signatures</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Contractor</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Signed by: John Smith, PM
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Date: Jan 28, 2025
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Architect</span>
                        <Clock className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Pending signature
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Owner</span>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting architect approval
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Notarization</span>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Required before submission
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule-of-values" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Schedule of Values (G703)</CardTitle>
                  <CardDescription>
                    Continuation Sheet for Pay Application #12
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calculator className="mr-2 h-4 w-4" />
                    Auto-Calculate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Description of Work</TableHead>
                    <TableHead className="text-right">Scheduled Value</TableHead>
                    <TableHead className="text-right">Previous</TableHead>
                    <TableHead className="text-right">This Period</TableHead>
                    <TableHead className="text-right">% Complete</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Retainage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSOVItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.number}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.scheduledValue)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.previousBilled)}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="text"
                          defaultValue={formatCurrency(item.thisPeriod)}
                          className="w-24 text-right h-8"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress value={item.percentComplete} className="w-16 h-2" />
                          <span className="text-sm w-10">{item.percentComplete}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.balanceToFinish)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.retainage)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>Grand Totals</TableCell>
                    <TableCell className="text-right">$2,765,000</TableCell>
                    <TableCell className="text-right">$1,615,500</TableCell>
                    <TableCell className="text-right">$248,250</TableCell>
                    <TableCell className="text-right">67%</TableCell>
                    <TableCell className="text-right">$901,250</TableCell>
                    <TableCell className="text-right">$93,189</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lien-waivers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lien Waiver Tracking</CardTitle>
                  <CardDescription>
                    Conditional and unconditional waivers for subs and suppliers
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Waiver
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Waiver Types Legend */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">Waiver Types:</span>
                  {Object.entries(lienWaiverTypes).map(([key, value]) => (
                    <Badge key={key} className={value.color}>
                      {value.label}
                    </Badge>
                  ))}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Waiver Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Through Date</TableHead>
                      <TableHead>Required For</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLienWaivers.map((waiver) => (
                      <TableRow key={waiver.id}>
                        <TableCell className="font-medium">{waiver.vendor}</TableCell>
                        <TableCell>
                          <Badge className={lienWaiverTypes[waiver.type as keyof typeof lienWaiverTypes].color}>
                            {lienWaiverTypes[waiver.type as keyof typeof lienWaiverTypes].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(waiver.amount)}</TableCell>
                        <TableCell>{waiver.throughDate}</TableCell>
                        <TableCell>{waiver.requiredFor}</TableCell>
                        <TableCell>
                          {waiver.status === 'received' ? (
                            <Badge variant="default">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Received
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            {waiver.status === 'pending' && (
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

                {/* State Form Notice */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">State-Specific Forms</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        This project is in California. All lien waivers will use CA Civil Code Section 8132-8138
                        compliant forms. Conditional waivers become unconditional upon payment receipt.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retainage" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Retainage Management</CardTitle>
                  <CardDescription>
                    Track and release retained amounts per state requirements
                  </CardDescription>
                </div>
                <Button>
                  <Unlock className="mr-2 h-4 w-4" />
                  Request Release
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Retainage Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Retained</div>
                    <div className="text-2xl font-bold mt-1">$145,500</div>
                    <div className="text-xs text-muted-foreground mt-1">5% of $2,910,000</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Released</div>
                    <div className="text-2xl font-bold mt-1">$0</div>
                    <div className="text-xs text-muted-foreground mt-1">0% released</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Remaining</div>
                    <div className="text-2xl font-bold mt-1">$145,500</div>
                    <div className="text-xs text-muted-foreground mt-1">Est. release: May 2025</div>
                  </div>
                </div>

                {/* State Rules Notice */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-900">California Retainage Rules</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Effective January 1, 2026, California limits retention to 5% (previously 10%).
                        Retainage must be released within 60 days of substantial completion or as
                        specified in the contract.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Retainage by Trade */}
                <div>
                  <h4 className="font-medium mb-3">Retainage by Trade</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Trade/Subcontractor</TableHead>
                        <TableHead className="text-right">Billed to Date</TableHead>
                        <TableHead className="text-right">Retention Rate</TableHead>
                        <TableHead className="text-right">Retained</TableHead>
                        <TableHead className="text-right">Released</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">ABC Concrete Co.</TableCell>
                        <TableCell className="text-right">$544,000</TableCell>
                        <TableCell className="text-right">5%</TableCell>
                        <TableCell className="text-right">$27,200</TableCell>
                        <TableCell className="text-right">$0</TableCell>
                        <TableCell className="text-right">$27,200</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Lock className="mr-1 h-3 w-3" />
                            Held
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Steel Solutions Inc.</TableCell>
                        <TableCell className="text-right">$442,000</TableCell>
                        <TableCell className="text-right">5%</TableCell>
                        <TableCell className="text-right">$22,100</TableCell>
                        <TableCell className="text-right">$0</TableCell>
                        <TableCell className="text-right">$22,100</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Lock className="mr-1 h-3 w-3" />
                            Held
                          </Badge>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Metro Masonry</TableCell>
                        <TableCell className="text-right">$156,750</TableCell>
                        <TableCell className="text-right">5%</TableCell>
                        <TableCell className="text-right">$7,838</TableCell>
                        <TableCell className="text-right">$0</TableCell>
                        <TableCell className="text-right">$7,838</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Lock className="mr-1 h-3 w-3" />
                            Held
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
