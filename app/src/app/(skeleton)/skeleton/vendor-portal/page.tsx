'use client'

import { useState } from 'react'
import { PageSpec } from '@/components/skeleton/page-spec'
import { VendorPortalPreview } from '@/components/skeleton/previews/vendor-portal-preview'

const constructionWorkflow = [
  'Portal Login', 'Dashboard', 'Active Jobs', 'POs/Invoices', 'Bids', 'Documents'
]

export default function VendorPortalSkeleton() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-warm-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-b-2 border-stone-600 text-stone-600'
              : 'text-warm-600 hover:text-warm-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'preview'
              ? 'border-b-2 border-stone-600 text-stone-600'
              : 'text-warm-600 hover:text-warm-900'
          }`}
        >
          UI Preview
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <PageSpec
          title="Vendor Portal"
          phase="Phase 2 - Vendor Collaboration"
          planFile="views/vendor-portal/VENDOR_PORTAL.md"
          description="Self-service portal for subcontractors and suppliers. View POs, submit invoices, respond to bids, upload compliance documents, and track payments."
          workflow={constructionWorkflow}
          features={[
            'Vendor self-registration with builder approval gate',
            'Multi-builder dashboard with builder-scoped data isolation',
            'View and acknowledge Purchase Orders with line items',
            'Submit invoices against POs with retainage auto-calc',
            'Respond to bid invitations with structured forms and rate sheet auto-fill',
            'Pre-bid Q&A threads per bid package',
            'Upload compliance documents (COI, W-9, licenses, bonds, workers comp)',
            'Green/yellow/red compliance status per builder',
            'Payment history with check/ACH references and retainage tracking',
            'Lien waiver digital signature (conditional/unconditional, progress/final)',
            'Schedule visibility with two-week look-ahead across all projects',
            'Task acknowledgment or reschedule request with reason',
            'Availability calendar updates and conflict detection',
            'Daily work log submission with photos and crew tracking',
            'Assigned punch items with photo upload and completion workflow',
            'Team management (foreman, office staff, field) with role-based access',
            'Onboarding wizard (profile, trades, compliance, preferences)',
            'Notification preference center (email, push, portal, SMS)',
            'English and Spanish language support',
            'Mobile-responsive for field access',
          ]}
          connections={[
            { name: 'Vendor Management (M10)', type: 'input', description: 'Vendor records and builder-vendor relationships' },
            { name: 'Purchase Orders (M18)', type: 'input', description: 'POs with line items, delivery dates, change orders' },
            { name: 'Invoices (M11)', type: 'bidirectional', description: 'Vendor submits invoices against POs/contracts' },
            { name: 'Bid Management (M26)', type: 'bidirectional', description: 'Vendor reviews bid packages and submits responses' },
            { name: 'Lien Waivers (M14)', type: 'bidirectional', description: 'Digital lien waiver signing tied to payment workflow' },
            { name: 'Scheduling (M7)', type: 'input', description: 'Task visibility, acknowledgment, conflict flagging' },
            { name: 'Daily Logs (M8)', type: 'output', description: 'Vendor submits daily logs with photos and crew data' },
            { name: 'Punch List (M28)', type: 'bidirectional', description: 'Vendor views and completes assigned punch items' },
            { name: 'Document Storage (M6)', type: 'bidirectional', description: 'Compliance doc upload and scope document access' },
            { name: 'Auth & Access (M1)', type: 'input', description: 'Multi-builder authentication and role management' },
            { name: 'Notification Engine (M5)', type: 'output', description: 'Multi-channel notifications (email, push, SMS, portal)' },
            { name: 'Contracts (M38)', type: 'input', description: 'Contract review and e-signature through portal' },
          ]}
          dataFields={[
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'company_name', type: 'string', required: true, description: 'Vendor company name' },
            { name: 'primary_email', type: 'string', required: true, description: 'Login email' },
            { name: 'trades', type: 'jsonb', required: true, description: 'Array of trade categories' },
            { name: 'service_area', type: 'jsonb', description: 'Geographic service area' },
            { name: 'registration_status', type: 'string', required: true, description: 'pending, active, suspended' },
            { name: 'onboarding_completed', type: 'boolean', description: 'Whether onboarding wizard is done' },
            { name: 'builder_relationship_status', type: 'string', description: 'pending_approval, approved, suspended, blacklisted' },
            { name: 'compliance_status', type: 'string', description: 'green, yellow, red per builder' },
            { name: 'prequalification_status', type: 'string', description: 'not_required, pending, approved, expired' },
            { name: 'payment_terms', type: 'string', description: 'Negotiated terms per builder' },
            { name: 'portal_user_role', type: 'string', required: true, description: 'admin, office_staff, foreman, field' },
            { name: 'notification_preferences', type: 'jsonb', description: 'Per-event channel selection' },
          ]}
          aiFeatures={[
            { name: 'Invoice Assistance', description: 'AI auto-fills invoice details from PO data, validates amounts against contract, calculates retainage', trigger: 'On invoice creation' },
            { name: 'Document Extraction', description: 'Extracts insurance expiration dates, coverage amounts, and policy numbers from uploaded COIs', trigger: 'On document upload' },
            { name: 'Bid Guidance', description: 'Provides scope interpretation, rate sheet auto-fill, and line-item suggestions for bid responses', trigger: 'On bid review' },
            { name: 'Schedule Conflict Detection', description: 'Detects overlapping tasks from different builders and suggests notification to affected parties', trigger: 'On task scheduling' },
            { name: 'Compliance Monitoring', description: 'Tracks document expirations, auto-alerts vendor 60/30/7 days before, notifies connected builders', trigger: 'Periodic check' },
            { name: 'Performance Insights', description: 'Opt-in benchmarks showing vendor response time rankings and quality metrics', trigger: 'Dashboard view' },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ [Builder Logo]  Vendor Portal                   Welcome, ABC Electric│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ACTION REQUIRED                                              │  │
│  │  • 2 Purchase Orders to acknowledge                           │  │
│  │  • 1 Bid Request due Dec 15                                   │  │
│  │  • Insurance expires in 14 days - Upload renewal              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │ 📋 POs       │  │ 🧾 Invoices  │  │ 📨 Bids      │               │
│  │ 3 active     │  │ 2 pending    │  │ 1 open       │               │
│  │ [View All]   │  │ [Submit New] │  │ [Respond]    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │ 💰 Payments  │  │ 📁 Documents │                                 │
│  │ $8,200 due   │  │ 4 files      │                                 │
│  │ [View]       │  │ [Manage]     │                                 │
│  └──────────────┘  └──────────────┘                                 │
│                                                                     │
│  PAYMENT HISTORY                                                    │
│  ─────────────────────────────────────────────────────────────────  │
│  Nov 15: $12,450 - Smith Residence - Paid ✓                        │
│  Oct 28: $8,900 - Johnson Project - Paid ✓                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <h3 className="font-semibold text-stone-900 mb-1">Vendor Portal UI Preview</h3>
            <p className="text-sm text-stone-700">
              Interactive mockup showing the vendor dashboard with active POs, bid requests, invoice submissions, document uploads, and payment tracking.
            </p>
          </div>
          <VendorPortalPreview />
        </div>
      )}
    </div>
  )
}
