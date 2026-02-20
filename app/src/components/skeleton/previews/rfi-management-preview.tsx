'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
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
  FileQuestion,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Users,
  Building,
  MessageSquare,
  Paperclip,
  ArrowUp,
  Eye,
  Plus,
  Filter,
  Search,
  Timer,
  TrendingUp,
  BarChart3,
  Bell,
} from 'lucide-react'

// Mock data for RFIs
const mockRFIs = [
  {
    id: 1,
    number: 'RFI-047',
    subject: 'Structural steel connection detail at grid B-4',
    discipline: 'structural',
    priority: 'high',
    status: 'open',
    assignedTo: 'Martinez & Associates',
    submittedDate: '2025-01-28',
    dueDate: '2025-02-04',
    daysOpen: 3,
    slaStatus: 'on_track',
    costImpact: true,
    scheduleImpact: false,
  },
  {
    id: 2,
    number: 'RFI-046',
    subject: 'Clarification on HVAC diffuser locations in open office',
    discipline: 'mechanical',
    priority: 'normal',
    status: 'in_review',
    assignedTo: 'MEP Engineers Inc.',
    submittedDate: '2025-01-25',
    dueDate: '2025-02-01',
    daysOpen: 6,
    slaStatus: 'at_risk',
    costImpact: false,
    scheduleImpact: true,
  },
  {
    id: 3,
    number: 'RFI-045',
    subject: 'Exterior finish at main entrance canopy',
    discipline: 'architectural',
    priority: 'urgent',
    status: 'overdue',
    assignedTo: 'Smith Architecture Group',
    submittedDate: '2025-01-18',
    dueDate: '2025-01-25',
    daysOpen: 13,
    slaStatus: 'overdue',
    costImpact: true,
    scheduleImpact: true,
  },
  {
    id: 4,
    number: 'RFI-044',
    subject: 'Electrical panel schedule revision for floor 3',
    discipline: 'electrical',
    priority: 'normal',
    status: 'responded',
    assignedTo: 'MEP Engineers Inc.',
    submittedDate: '2025-01-20',
    dueDate: '2025-01-27',
    daysOpen: 5,
    slaStatus: 'met',
    respondedDate: '2025-01-25',
    costImpact: false,
    scheduleImpact: false,
  },
  {
    id: 5,
    number: 'RFI-043',
    subject: 'Fire-rated wall assembly at stair tower',
    discipline: 'architectural',
    priority: 'high',
    status: 'closed',
    assignedTo: 'Smith Architecture Group',
    submittedDate: '2025-01-15',
    dueDate: '2025-01-22',
    daysOpen: 4,
    slaStatus: 'met',
    respondedDate: '2025-01-19',
    closedDate: '2025-01-20',
    costImpact: false,
    scheduleImpact: false,
  },
]

const mockSLAMetrics = {
  totalRFIs: 47,
  openRFIs: 12,
  avgResponseDays: 5.2,
  slaComplianceRate: 87,
  overdueCount: 2,
  byDiscipline: [
    { name: 'Architectural', open: 4, avgDays: 4.8 },
    { name: 'Structural', open: 3, avgDays: 5.5 },
    { name: 'Mechanical', open: 2, avgDays: 6.2 },
    { name: 'Electrical', open: 2, avgDays: 4.1 },
    { name: 'Plumbing', open: 1, avgDays: 3.9 },
  ],
  byResponder: [
    { name: 'Smith Architecture Group', pending: 3, avgDays: 5.8, compliance: 82 },
    { name: 'Martinez & Associates', pending: 2, avgDays: 4.2, compliance: 95 },
    { name: 'MEP Engineers Inc.', pending: 4, avgDays: 5.5, compliance: 88 },
  ],
}

export default function RFIManagementPreview() {
  const [activeTab, setActiveTab] = useState('active')
  const [selectedRFI, setSelectedRFI] = useState(mockRFIs[0])
  const [showNewRFI, setShowNewRFI] = useState(false)

  const getSLABadge = (slaStatus: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      on_track: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="mr-1 h-3 w-3" />, label: 'On Track' },
      at_risk: { color: 'bg-yellow-100 text-yellow-800', icon: <AlertTriangle className="mr-1 h-3 w-3" />, label: 'At Risk' },
      overdue: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="mr-1 h-3 w-3" />, label: 'Overdue' },
      met: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="mr-1 h-3 w-3" />, label: 'SLA Met' },
      missed: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="mr-1 h-3 w-3" />, label: 'SLA Missed' },
    }
    const c = config[slaStatus] || config.on_track
    return <Badge className={c.color}>{c.icon}{c.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      open: { variant: 'outline', label: 'Open' },
      acknowledged: { variant: 'secondary', label: 'Acknowledged' },
      in_review: { variant: 'secondary', label: 'In Review' },
      responded: { variant: 'default', label: 'Responded' },
      closed: { variant: 'default', label: 'Closed' },
      overdue: { variant: 'destructive', label: 'Overdue' },
    }
    const c = config[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      normal: 'bg-blue-100 text-blue-800',
      low: 'bg-gray-100 text-gray-800',
    }
    return <Badge className={config[priority]}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>
  }

  const getDisciplineIcon = (discipline: string) => {
    const icons: Record<string, string> = {
      architectural: 'A',
      structural: 'S',
      mechanical: 'M',
      electrical: 'E',
      plumbing: 'P',
      civil: 'C',
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-muted text-xs font-medium">
        {icons[discipline] || '?'}
      </span>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RFI Management</h1>
          <p className="text-muted-foreground">
            Request for Information with SLA Tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => setShowNewRFI(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New RFI
          </Button>
        </div>
      </div>

      {/* SLA Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open RFIs</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSLAMetrics.openRFIs}</div>
            <p className="text-xs text-muted-foreground">
              of {mockSLAMetrics.totalRFIs} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSLAMetrics.avgResponseDays} days</div>
            <p className="text-xs text-muted-foreground">
              Target: 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSLAMetrics.slaComplianceRate}%</div>
            <Progress value={mockSLAMetrics.slaComplianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{mockSLAMetrics.overdueCount}</div>
            <p className="text-xs text-red-600">
              Requires escalation
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">3</div>
            <p className="text-xs text-yellow-600">
              Due within 2 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* RFI List */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active RFIs</CardTitle>
                  <CardDescription>
                    Track and manage project RFIs
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-8 w-[200px]" placeholder="Search RFIs..." />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">Open</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  <TabsTrigger value="responded">Responded</TabsTrigger>
                </TabsList>

                <div className="space-y-3">
                  {mockRFIs.map((rfi) => (
                    <div
                      key={rfi.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedRFI.id === rfi.id ? 'border-primary bg-muted/50' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => setSelectedRFI(rfi)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {getDisciplineIcon(rfi.discipline)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rfi.number}</span>
                              {getPriorityBadge(rfi.priority)}
                              {rfi.costImpact && (
                                <Badge variant="outline" className="text-xs">$</Badge>
                              )}
                              {rfi.scheduleImpact && (
                                <Badge variant="outline" className="text-xs">
                                  <Calendar className="h-3 w-3" />
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mt-1">{rfi.subject}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {rfi.assignedTo}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {rfi.daysOpen} days open
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(rfi.status)}
                          {getSLABadge(rfi.slaStatus)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* RFI Detail / SLA Metrics */}
        <div className="space-y-6">
          {/* Selected RFI Detail */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedRFI.number}</CardTitle>
                {getSLABadge(selectedRFI.slaStatus)}
              </div>
              <CardDescription>{selectedRFI.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* SLA Timer */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Response Due</span>
                    <span className="text-sm">{selectedRFI.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-bold">
                      {selectedRFI.slaStatus === 'overdue'
                        ? `${selectedRFI.daysOpen - 7} days overdue`
                        : `${7 - selectedRFI.daysOpen} days remaining`}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((selectedRFI.daysOpen / 7) * 100, 100)}
                    className={`mt-2 ${selectedRFI.slaStatus === 'overdue' ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>

                {/* Details */}
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discipline</span>
                    <span className="font-medium capitalize">{selectedRFI.discipline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned To</span>
                    <span className="font-medium">{selectedRFI.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted</span>
                    <span className="font-medium">{selectedRFI.submittedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(selectedRFI.status)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comment
                  </Button>
                  {selectedRFI.slaStatus === 'overdue' && (
                    <Button size="sm" variant="destructive" className="flex-1">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Escalate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Metrics by Party */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response by Party</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSLAMetrics.byResponder.map((responder, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{responder.name}</span>
                      <Badge variant={responder.compliance >= 90 ? 'default' : 'outline'}>
                        {responder.compliance}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{responder.pending} pending</span>
                      <span>•</span>
                      <span>Avg: {responder.avgDays} days</span>
                    </div>
                    <Progress value={responder.compliance} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New RFI Modal would go here */}
      {showNewRFI && (
        <Card className="fixed inset-x-4 top-20 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-50 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New RFI</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowNewRFI(false)}>×</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Select defaultValue="architectural">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="architectural">Architectural</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="mechanical">Mechanical</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (1 day)</SelectItem>
                      <SelectItem value="high">High (3 days)</SelectItem>
                      <SelectItem value="normal">Normal (7 days)</SelectItem>
                      <SelectItem value="low">Low (10 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Brief description of the question..." />
              </div>

              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  placeholder="Detailed question or clarification needed..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Drawing Reference</Label>
                  <Input placeholder="e.g., A-201, S-102" />
                </div>
                <div className="space-y-2">
                  <Label>Specification Section</Label>
                  <Input placeholder="e.g., 03 30 00" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Potential Cost Impact</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Potential Schedule Impact</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach Files
                </Button>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewRFI(false)}>
                  Cancel
                </Button>
                <Button className="flex-1">
                  <Send className="mr-2 h-4 w-4" />
                  Submit RFI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
