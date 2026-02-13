'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { SubmittalsPreview } from '@/components/skeleton/previews/submittals-preview'
import { Eye, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function JobSubmittalsPage() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button onClick={() => setActiveTab('preview')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'preview' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <Eye className="h-4 w-4" />UI Preview
        </button>
        <button onClick={() => setActiveTab('spec')} className={cn('flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors', activeTab === 'spec' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent')}>
          <BookOpen className="h-4 w-4" />Specification
        </button>
      </div>
      {activeTab === 'preview' ? <SubmittalsPreview /> : <PageSpec
      title="Submittals"
      phase="Phase 4 - Intelligence"
      planFile="docs/modules/27-rfi-management.md"
      description="Track product submittals through the full approval lifecycle: from vendor submission through internal review, architect/engineer routing, stamp workflow (approved, approved as noted, revise and resubmit, rejected), and revision management. Integrates with purchase orders (hold until approved), selections (linked product choices), schedule (lead time and dependency tracking), and permitting (structural submittals require engineer stamp). AI predicts approval timelines and flags overdue reviews."
      workflow={['Request from Vendor', 'Receive Documents', 'Internal Review', 'Route to A/E', 'Engineer Review + Stamp', 'Revise if Needed', 'Approved — Release PO']}
      features={[
        'Submittal log with sequential numbering',
        'Submittal schedule with required dates and lead times',
        'Vendor submittal requests and document receipt tracking',
        'Internal review before routing to design team',
        'Route to architect, engineer, or owner with distribution tracking',
        'Distribution status (sent, viewed, responded) per recipient',
        'Ball-in-court indicator showing current responsible party',
        'Review stamp workflow (Approved, Approved as Noted, No Exceptions, Revise & Resubmit, Rejected)',
        'Engineer license number tracking on stamps',
        'Revision management with full version history',
        'Spec section reference linking',
        'Trade category classification',
        'Document attachment count and management',
        'Selection link — connects submittal to product selection',
        'Schedule dependency — warns when submittal delays impact schedule tasks',
        'Lead time tracking (days from approval to delivery)',
        'PO hold integration — PO on hold until submittal approved, auto-release on approval',
        'Permit requirement flag for structural submittals needing engineer stamp',
        'Due date tracking with overdue alerts',
        'Bulk approval for simple submittals',
        'Digital stamps with reviewer signature',
        'Submittal packages for grouped items',
        'Export submittal log with stamp history',
        'AI-predicted approval timeline per submittal',
      ]}
      connections={[
        { name: 'Vendors (M10)', type: 'input', description: 'Vendor provides submittal documents' },
        { name: 'Specifications (M6)', type: 'input', description: 'Spec section requirements drive submittal list' },
        { name: 'Purchase Orders (M18)', type: 'bidirectional', description: 'PO held until submittal approved; approval releases PO' },
        { name: 'Schedule (M7)', type: 'bidirectional', description: 'Lead time planning and schedule dependency warnings' },
        { name: 'Architect/Engineer', type: 'bidirectional', description: 'Route for review and stamp; engineer tracking with license numbers' },
        { name: 'Selections (M21)', type: 'input', description: 'Product selections drive submittal requirements' },
        { name: 'Permitting (M32)', type: 'output', description: 'Structural submittals link to permit applications requiring stamped docs' },
        { name: 'RFIs (M27)', type: 'bidirectional', description: 'Submittal reviews may generate RFIs; RFIs may reference submittals' },
        { name: 'Budget (M9)', type: 'input', description: 'Budget context for lead time and ordering decisions' },
        { name: 'Notifications (M5)', type: 'output', description: 'Overdue alerts, distribution notifications, stamp notifications' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs' },
        { name: 'submittal_number', type: 'string', required: true, description: 'Sequential submittal ID (SUB-NNN)' },
        { name: 'spec_section', type: 'string', description: 'Specification section reference' },
        { name: 'trade_category', type: 'string', description: 'Trade classification' },
        { name: 'description', type: 'string', required: true, description: 'Item description' },
        { name: 'vendor_id', type: 'uuid', description: 'Providing vendor' },
        { name: 'submitted_date', type: 'date', description: 'When submittal documents received' },
        { name: 'required_date', type: 'date', description: 'Approval needed by this date' },
        { name: 'lead_time_days', type: 'integer', description: 'Days from approval to delivery' },
        { name: 'status', type: 'string', required: true, description: 'pending, submitted, under_review, approved, approved_as_noted, revise_resubmit, rejected' },
        { name: 'revision', type: 'integer', description: 'Current revision number' },
        { name: 'document_count', type: 'integer', description: 'Number of attached documents' },
        { name: 'distribution', type: 'jsonb', description: 'Routing list with sent/viewed/responded tracking' },
        { name: 'stamps', type: 'jsonb', description: 'Review stamps with action, reviewer, license number, comments, timestamp' },
        { name: 'selection_link', type: 'jsonb', description: 'Link to selections module (selection name, room)' },
        { name: 'schedule_dependency', type: 'jsonb', description: 'Linked schedule task with impact days and critical flag' },
        { name: 'linked_po', type: 'jsonb', description: 'Linked PO with hold status (on_hold or released)' },
        { name: 'permit_required', type: 'boolean', description: 'Requires engineer stamp for permitting' },
        { name: 'ai_predicted_approval_days', type: 'integer', description: 'AI-predicted days to approval' },
        { name: 'comments', type: 'text', description: 'General notes and review comments' },
      ]}
      aiFeatures={[
        {
          name: 'Approval Timeline Prediction',
          description: 'Predicts days to approval based on reviewer response patterns, submittal complexity, vendor revision history, and trade-specific approval rates.',
          trigger: 'On submission and daily recalculation'
        },
        {
          name: 'Schedule Impact Analysis',
          description: 'Calculates downstream schedule impact when submittal reviews are delayed. Alerts PM when lead time plus remaining review time threatens installation dates.',
          trigger: 'On schedule update and daily check'
        },
        {
          name: 'Vendor Follow-up Intelligence',
          description: 'Tracks vendor resubmission patterns. Predicts how many revision cycles each vendor typically needs. Auto-generates follow-up reminders for overdue resubmissions.',
          trigger: 'Daily check'
        },
        {
          name: 'Distribution Monitoring',
          description: 'Monitors reviewer engagement: flags submittals that have been sent but not viewed, or viewed but not responded to beyond typical response window.',
          trigger: 'Real-time tracking'
        },
        {
          name: 'PO Release Automation',
          description: 'Automatically triggers PO release notification when submittal is approved. Alerts PM if lead time means ordering deadline has passed.',
          trigger: 'On stamp action'
        },
        {
          name: 'Permit Coordination',
          description: 'Identifies submittals requiring engineer stamps for permit applications. Coordinates submittal approval with permit submission timeline.',
          trigger: 'On permit-required submittal creation'
        },
      ]}
      mockupAscii=""
    />}
    </div>
  )
}
