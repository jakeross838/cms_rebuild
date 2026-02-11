'use client'

import { PageSpec } from '@/components/skeleton/page-spec'

const constructionWorkflow = [
  'Leads', 'Estimates', 'Proposals', 'Contracts',
  'Jobs List', 'Budget', 'POs', 'Invoices',
  'Draws', 'Closeout'
]

export default function InvoicesListSkeleton() {
  return (
    <PageSpec
      title="Invoices"
      phase="Phase 0 - Foundation"
      planFile="views/financial/INVOICES.md"
      description="AI-powered invoice processing (Adaptive.build-style). Drop a PDF, and AI extracts vendor, amount, line items, matches to PO and budget, suggests cost codes—all in seconds. Every invoice feeds the Cost Intelligence database for future pricing accuracy."
      workflow={constructionWorkflow}
      features={[
        'AI-powered invoice upload with OCR extraction',
        'Drag-and-drop PDF or camera capture on mobile',
        'Auto-match to vendor and job based on AI analysis',
        'Multi-level approval workflow: PM → Accountant → Owner (threshold-based)',
        'Cost code allocation with 100% balance requirement',
        'PDF viewer with zoom and download',
        'Status tabs: Needs Matching, Pending, Approved, In Draw, Paid',
        'Link to Purchase Orders for verification and variance tracking',
        'Bulk actions: Approve, Add to Draw, Assign to job',
        'Two-stage approval: Field verify → Office approve',
        'Retainage tracking and calculation',
        'Lien waiver requirement enforcement',
        'Partial payment support with balance tracking',
        'Sales tax verification (Florida-specific)',
      ]}
      connections={[
        { name: 'AI Processing', type: 'input', description: 'Claude extracts vendor, amount, invoice #, line items from PDF' },
        { name: 'Vendors', type: 'bidirectional', description: 'Auto-match vendor or create new; learns name variations' },
        { name: 'Jobs', type: 'input', description: 'Invoice assignment to jobs' },
        { name: 'Cost Codes', type: 'input', description: 'Allocation of invoice amounts by cost code' },
        { name: 'Purchase Orders', type: 'input', description: 'PO matching and verification' },
        { name: 'Users', type: 'input', description: 'Approval chain based on roles and thresholds' },
        { name: 'Budget', type: 'output', description: 'Actuals updated on approval; feeds variance tracking' },
        { name: 'Draws', type: 'output', description: 'Approved invoices included in draws' },
        { name: 'QuickBooks', type: 'output', description: 'Synced as bills with cost code mapping' },
        { name: 'Cost Intelligence', type: 'output', description: 'Every line item feeds pricing database' },
        { name: 'Vendor Intelligence', type: 'output', description: 'Payment patterns, pricing trends tracked per vendor' },
        { name: 'Lien Waivers', type: 'input', description: 'Waiver status checked before payment' },
      ]}
      dataFields={[
        { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
        { name: 'vendor_id', type: 'uuid', description: 'FK to vendors' },
        { name: 'job_id', type: 'uuid', description: 'FK to jobs' },
        { name: 'invoice_number', type: 'string', required: true, description: 'Vendor invoice number' },
        { name: 'invoice_date', type: 'date', required: true, description: 'Date on invoice' },
        { name: 'due_date', type: 'date', description: 'Payment due date' },
        { name: 'amount', type: 'decimal', required: true, description: 'Total invoice amount' },
        { name: 'tax_amount', type: 'decimal', description: 'Sales tax' },
        { name: 'status', type: 'string', required: true, description: 'Needs Matching, Draft, PM Pending, Accountant Pending, Owner Pending, Approved, In Draw, Paid' },
        { name: 'pdf_url', type: 'string', description: 'Uploaded invoice PDF' },
        { name: 'match_confidence', type: 'decimal', description: 'AI matching confidence score' },
        { name: 'po_id', type: 'uuid', description: 'Linked Purchase Order' },
        { name: 'po_variance', type: 'decimal', description: 'Difference from PO amount' },
        { name: 'retainage_amount', type: 'decimal', description: 'Retainage held' },
        { name: 'lien_waiver_status', type: 'string', description: 'Not Required, Required, Received' },
        { name: 'approved_by_pm_id', type: 'uuid', description: 'PM who approved' },
        { name: 'approved_by_accountant_id', type: 'uuid', description: 'Accountant who approved' },
        { name: 'approved_by_owner_id', type: 'uuid', description: 'Owner who approved (if over threshold)' },
        { name: 'ai_extracted_data', type: 'jsonb', description: 'Raw AI extraction results' },
        { name: 'ai_line_items', type: 'jsonb', description: 'AI-extracted line items' },
      ]}
      aiFeatures={[
        {
          name: 'Invoice OCR & Extraction',
          description: 'Drop PDF or snap photo—AI extracts: vendor name, invoice number, date, due date, amount, tax, and individual line items with quantities and descriptions. Handles multiple formats from different vendors.',
          trigger: 'On file upload'
        },
        {
          name: 'Vendor Name Matching',
          description: 'Matches invoice to existing vendors using fuzzy matching. Learns variations: "ABC Electric LLC" = "ABC Electrical" = "A.B.C. Electric". Confidence score shows match quality. Creates new vendor if no match found.',
          trigger: 'After OCR extraction'
        },
        {
          name: 'Job & PO Matching',
          description: 'Suggests job assignment based on: vendor job history, PO references in invoice, address mentions, recent PO amounts matching invoice. "Invoice matches PO-089 for Smith Residence (98% confidence)."',
          trigger: 'After vendor match'
        },
        {
          name: 'Cost Code Auto-Suggestion',
          description: 'Recommends cost code allocations based on vendor trade, line item descriptions, and historical patterns: "ABC Electric invoices typically code 95% to 16000-Electrical, 5% to 01000-General Conditions."',
          trigger: 'On allocation screen'
        },
        {
          name: 'Duplicate Detection',
          description: 'Flags potential duplicates based on vendor, amount, date proximity, and invoice number patterns. "Similar invoice from ABC Electric for $12,450 processed 3 days ago—verify this is not a duplicate."',
          trigger: 'Before save'
        },
        {
          name: 'PO Variance Analysis',
          description: 'Compares invoice to linked PO and explains differences: "Invoice $850 over PO. Line item \'Additional 12 outlets\' not on original PO—verify change order or update PO."',
          trigger: 'On PO match'
        },
        {
          name: 'Budget Impact Preview',
          description: 'Shows budget impact before approval: "This invoice will put 16000-Electrical at 92% of budget ($45,200 of $49,000). 2 invoices remaining expected for this category."',
          trigger: 'On approval review'
        },
        {
          name: 'Price Intelligence Capture',
          description: 'Extracts unit pricing from line items and feeds Cost Intelligence: "Extracted: 12 outlets @ $185/ea (ABC Electric, Smith Residence). Previous average: $172/ea. Price trend: ↑ 7.5%."',
          trigger: 'On invoice approval'
        },
        {
          name: 'Lien Waiver Enforcement',
          description: 'Blocks payment if lien waiver required but not received: "Vendor owes lien waiver for previous draw. Amount: $24,500. Block payment until waiver received."',
          trigger: 'Before payment approval'
        },
        {
          name: 'Payment Optimization',
          description: 'Suggests optimal payment timing: "ABC Electric offers 2% discount for payment within 10 days. Invoice due Dec 15. Pay by Dec 10 to save $249." Tracks early payment discount utilization.',
          trigger: 'On payment scheduling'
        },
      ]}
      mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Invoices                         [Upload] [Filters]    [+ Manual]    │
├─────────────────────────────────────────────────────────────────────┤
│ ⚡ AI Processing: 3 invoices extracted, ready for review             │
├─────────────────────────────────────────────────────────────────────┤
│ Status Tabs: All | Needs Match(3) | Pending(5) | Approved | Paid    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────┬────────────┬─────────┬────────┬────────┬──────┬──────────┐ │
│ │ □   │ Vendor     │ Invoice#│ Amount │ Job    │Status│ Due Date │ │
│ ├─────┼────────────┼─────────┼────────┼────────┼──────┼──────────┤ │
│ │ □   │ ABC Elect  │ 1234    │$12,450 │ Smith  │● PM  │ Dec 15   │ │
│ │     │ 98% match  │ PO-089  │+$850 ▲ │ 16000  │      │ 2% disc! │ │
│ ├─────┼────────────┼─────────┼────────┼────────┼──────┼──────────┤ │
│ │ □   │ XYZ Plumb  │ 5678    │ $8,200 │ Smith  │● Appd│ Dec 10   │ │
│ │     │ 100% match │ PO-088  │= PO    │ 15000  │      │ Ready    │ │
│ ├─────┼────────────┼─────────┼────────┼────────┼──────┼──────────┤ │
│ │ □   │ ??? (NEW)  │ 9012    │ $5,000 │ ---    │● Need│ Dec 20   │ │
│ │     │ AI: "Best Lumber Co?" (72% conf)                         │ │
│ └─────┴────────────┴─────────┴────────┴────────┴──────┴──────────┘ │
│                                                                     │
│ AI Summary: 2 ready for payment ($20,650) | 1 needs review           │
│ Showing 1-25 of 142                           [< Prev] [Next >]     │
└─────────────────────────────────────────────────────────────────────┘
`}
    />
  )
}
