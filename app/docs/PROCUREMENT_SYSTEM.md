# RossOS Procurement System

> **Purpose**: Purchase orders, material tracking, and receiving workflows.
>
> **Phase**: 5 (Vendors & Subcontractors)
>
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Purchase Orders](#3-purchase-orders)
4. [Material Tracking](#4-material-tracking)
5. [Receiving](#5-receiving)
6. [Inventory Management](#6-inventory-management)
7. [Reporting](#7-reporting)

---

## 1. Overview

### 1.1 Procurement Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROCUREMENT WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. REQUISITION      2. PO CREATION     3. ORDER         4. RECEIVE        │
│   ─────────────      ─────────────      ────────        ─────────          │
│   ┌─────────┐        ┌─────────┐        ┌─────────┐     ┌─────────┐        │
│   │ Request │        │ Create  │        │ Send to │     │ Check   │        │
│   │ Material│───────▶│ Purchase│───────▶│ Vendor  │────▶│ Delivery│        │
│   │         │        │ Order   │        │         │     │ Items   │        │
│   └─────────┘        └─────────┘        └─────────┘     └─────────┘        │
│                           │                                  │              │
│                           ▼                                  ▼              │
│                      ┌─────────┐                       ┌─────────┐         │
│                      │ Approval│                       │ Update  │         │
│                      │ Workflow│                       │ Inventory│         │
│                      └─────────┘                       └─────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Purchase Orders | Create and track POs | P0 |
| Approval Workflow | Multi-level PO approval | P0 |
| Receiving | Log deliveries and verify | P0 |
| Material Tracking | Track materials to jobs | P1 |
| Inventory | Optional warehouse tracking | P2 |
| Vendor Integration | Send POs electronically | P2 |

---

## 2. Database Schema

### 2.1 Purchase Orders Table

```sql
-- Purchase Orders
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  job_id UUID REFERENCES jobs(id),

  -- Identification
  po_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'sent', 'acknowledged',
    'partially_received', 'received', 'cancelled', 'closed'
  )),

  -- Details
  description TEXT,
  notes TEXT,
  internal_notes TEXT,

  -- Dates
  po_date DATE DEFAULT CURRENT_DATE,
  required_date DATE,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,

  -- Shipping
  ship_to_address TEXT,
  ship_to_job BOOLEAN DEFAULT true,
  shipping_method TEXT,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,

  -- Financials
  subtotal DECIMAL(14, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_amount DECIMAL(14, 2) DEFAULT 0,
  total DECIMAL(14, 2) DEFAULT 0,

  -- Payment
  payment_terms TEXT, -- 'Net 30', 'COD', etc.

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold DECIMAL(14, 2) DEFAULT 0,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,

  -- Tracking
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, po_number)
);

CREATE INDEX idx_purchase_orders_company ON purchase_orders(company_id);
CREATE INDEX idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_job ON purchase_orders(job_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(company_id, status);

-- RLS
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON purchase_orders
  USING (company_id = get_current_company_id());
```

### 2.2 PO Line Items Table

```sql
-- Purchase Order Line Items
CREATE TABLE po_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,

  -- Item Details
  item_code TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL, -- EA, LF, SF, etc.
  quantity DECIMAL(12, 4) NOT NULL,
  unit_price DECIMAL(12, 4) NOT NULL,

  -- Calculated
  line_total DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

  -- Receiving tracking
  quantity_received DECIMAL(12, 4) DEFAULT 0,
  quantity_remaining DECIMAL(12, 4) GENERATED ALWAYS AS (quantity - quantity_received) STORED,

  -- Budget linking
  budget_item_id UUID REFERENCES budget_items(id),
  cost_code TEXT,

  -- Flags
  is_taxable BOOLEAN DEFAULT true,

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_po_line_items_po ON po_line_items(purchase_order_id);

-- Trigger to update PO totals
CREATE OR REPLACE FUNCTION update_po_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE purchase_orders
  SET
    subtotal = (
      SELECT COALESCE(SUM(line_total), 0)
      FROM po_line_items
      WHERE purchase_order_id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  -- Also update tax and total
  UPDATE purchase_orders
  SET
    tax_amount = subtotal * tax_rate,
    total = subtotal + (subtotal * tax_rate) + shipping_cost
  WHERE id = COALESCE(NEW.purchase_order_id, OLD.purchase_order_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER po_line_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON po_line_items
  FOR EACH ROW EXECUTE FUNCTION update_po_totals();
```

### 2.3 Receiving Table

```sql
-- Receiving records
CREATE TABLE receiving_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),

  -- Identification
  receiving_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'inspecting', 'accepted', 'partial_reject', 'rejected'
  )),

  -- Delivery info
  received_date DATE DEFAULT CURRENT_DATE,
  received_by UUID REFERENCES users(id),
  delivery_method TEXT,
  carrier TEXT,
  tracking_number TEXT,

  -- Documentation
  packing_slip_number TEXT,
  packing_slip_url TEXT,
  notes TEXT,

  -- Issues
  has_damages BOOLEAN DEFAULT false,
  damage_notes TEXT,
  damage_photos JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, receiving_number)
);

-- Receiving line items
CREATE TABLE receiving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiving_record_id UUID NOT NULL REFERENCES receiving_records(id) ON DELETE CASCADE,
  po_line_item_id UUID NOT NULL REFERENCES po_line_items(id),

  -- Quantities
  quantity_ordered DECIMAL(12, 4) NOT NULL,
  quantity_received DECIMAL(12, 4) NOT NULL,
  quantity_rejected DECIMAL(12, 4) DEFAULT 0,
  quantity_accepted DECIMAL(12, 4) GENERATED ALWAYS AS (quantity_received - quantity_rejected) STORED,

  -- Inspection
  inspection_status TEXT DEFAULT 'pending' CHECK (inspection_status IN (
    'pending', 'passed', 'failed', 'partial'
  )),
  rejection_reason TEXT,

  -- Storage
  storage_location TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receiving_items_record ON receiving_items(receiving_record_id);
CREATE INDEX idx_receiving_items_po_item ON receiving_items(po_line_item_id);

-- Trigger to update PO line item received quantities
CREATE OR REPLACE FUNCTION update_po_received_qty()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE po_line_items
  SET
    quantity_received = (
      SELECT COALESCE(SUM(quantity_accepted), 0)
      FROM receiving_items
      WHERE po_line_item_id = NEW.po_line_item_id
    ),
    updated_at = NOW()
  WHERE id = NEW.po_line_item_id;

  -- Update PO status if fully received
  PERFORM update_po_status_from_receiving(
    (SELECT purchase_order_id FROM po_line_items WHERE id = NEW.po_line_item_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER receiving_items_update_po
  AFTER INSERT OR UPDATE ON receiving_items
  FOR EACH ROW EXECUTE FUNCTION update_po_received_qty();
```

### 2.4 Material Tracking Table

```sql
-- Material usage tracking
CREATE TABLE material_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id),

  -- Source
  receiving_item_id UUID REFERENCES receiving_items(id),
  po_line_item_id UUID REFERENCES po_line_items(id),
  inventory_item_id UUID REFERENCES inventory_items(id),

  -- Item details
  item_description TEXT NOT NULL,
  quantity_used DECIMAL(12, 4) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(12, 4),
  total_cost DECIMAL(14, 2) GENERATED ALWAYS AS (quantity_used * COALESCE(unit_cost, 0)) STORED,

  -- Classification
  cost_code TEXT,
  budget_item_id UUID REFERENCES budget_items(id),
  phase TEXT,

  -- Usage details
  usage_date DATE DEFAULT CURRENT_DATE,
  used_by UUID REFERENCES users(id),
  location TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_material_usage_job ON material_usage(job_id);
CREATE INDEX idx_material_usage_date ON material_usage(job_id, usage_date);
```

---

## 3. Purchase Orders

### 3.1 PO Number Generation

```typescript
// src/lib/procurement/po-number.ts

export async function generatePONumber(companyId: string): Promise<string> {
  const supabase = await createClient();

  // Get company settings for PO format
  const { data: settings } = await supabase
    .from('company_settings')
    .select('po_prefix, po_next_number')
    .eq('company_id', companyId)
    .single();

  const prefix = settings?.po_prefix || 'PO';
  const nextNumber = settings?.po_next_number || 1;

  // Format: PO-2026-00001
  const year = new Date().getFullYear();
  const paddedNumber = String(nextNumber).padStart(5, '0');
  const poNumber = `${prefix}-${year}-${paddedNumber}`;

  // Increment counter
  await supabase
    .from('company_settings')
    .update({ po_next_number: nextNumber + 1 })
    .eq('company_id', companyId);

  return poNumber;
}
```

### 3.2 Create Purchase Order

```typescript
// src/lib/procurement/purchase-orders.ts

interface CreatePOInput {
  vendorId: string;
  jobId?: string;
  description?: string;
  requiredDate?: Date;
  shipToAddress?: string;
  shipToJob?: boolean;
  paymentTerms?: string;
  items: Array<{
    itemCode?: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    budgetItemId?: string;
    costCode?: string;
    isTaxable?: boolean;
  }>;
}

export async function createPurchaseOrder(
  companyId: string,
  input: CreatePOInput,
  createdBy: string
) {
  const supabase = await createClient();

  // Generate PO number
  const poNumber = await generatePONumber(companyId);

  // Get company approval threshold
  const { data: settings } = await supabase
    .from('company_settings')
    .select('po_approval_threshold')
    .eq('company_id', companyId)
    .single();

  const approvalThreshold = settings?.po_approval_threshold || 0;

  // Calculate subtotal to check if approval required
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const requiresApproval = subtotal >= approvalThreshold;

  // Create PO
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .insert({
      company_id: companyId,
      vendor_id: input.vendorId,
      job_id: input.jobId,
      po_number: poNumber,
      description: input.description,
      required_date: input.requiredDate?.toISOString(),
      ship_to_address: input.shipToAddress,
      ship_to_job: input.shipToJob ?? true,
      payment_terms: input.paymentTerms || 'Net 30',
      requires_approval: requiresApproval,
      approval_threshold: approvalThreshold,
      status: requiresApproval ? 'pending_approval' : 'draft',
      created_by: createdBy,
    })
    .select()
    .single();

  if (poError) throw poError;

  // Create line items
  const lineItems = input.items.map((item, index) => ({
    purchase_order_id: po.id,
    item_code: item.itemCode,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    budget_item_id: item.budgetItemId,
    cost_code: item.costCode,
    is_taxable: item.isTaxable ?? true,
    sort_order: index,
  }));

  await supabase.from('po_line_items').insert(lineItems);

  // Return complete PO
  return getPurchaseOrder(po.id);
}

export async function getPurchaseOrder(poId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('purchase_orders')
    .select(`
      *,
      vendor:vendors(id, name, email, phone),
      job:jobs(id, name, job_number),
      items:po_line_items(
        *,
        budget_item:budget_items(id, category, description)
      ),
      created_by_user:users!purchase_orders_created_by_fkey(id, name),
      approved_by_user:users!purchase_orders_approved_by_fkey(id, name)
    `)
    .eq('id', poId)
    .single();

  if (error) throw error;
  return data;
}
```

### 3.3 Approval Workflow

```typescript
// src/lib/procurement/approval.ts

export async function submitForApproval(poId: string, submittedBy: string) {
  const supabase = await createClient();

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('status, total, requires_approval')
    .eq('id', poId)
    .single();

  if (!po) throw new Error('Purchase order not found');
  if (po.status !== 'draft') throw new Error('PO must be in draft status');

  await supabase
    .from('purchase_orders')
    .update({
      status: 'pending_approval',
      updated_by: submittedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  // Notify approvers
  await notifyApprovers(poId);
}

export async function approvePurchaseOrder(
  poId: string,
  approvedBy: string,
  notes?: string
) {
  const supabase = await createClient();

  // Verify user has approval permission
  const { data: user } = await supabase
    .from('users')
    .select('role, approval_limit')
    .eq('id', approvedBy)
    .single();

  const { data: po } = await supabase
    .from('purchase_orders')
    .select('total')
    .eq('id', poId)
    .single();

  if (!user || !canApprove(user, po.total)) {
    throw new Error('Insufficient approval authority');
  }

  await supabase
    .from('purchase_orders')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      approval_notes: notes,
      updated_by: approvedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  // Notify requester
  await notifyPOApproved(poId);
}

export async function rejectPurchaseOrder(
  poId: string,
  rejectedBy: string,
  reason: string
) {
  const supabase = await createClient();

  await supabase
    .from('purchase_orders')
    .update({
      status: 'draft', // Send back to draft for revision
      approval_notes: `Rejected: ${reason}`,
      updated_by: rejectedBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  // Notify requester
  await notifyPORejected(poId, reason);
}

function canApprove(user: { role: string; approval_limit: number }, amount: number): boolean {
  if (user.role === 'admin' || user.role === 'owner') return true;
  return user.approval_limit >= amount;
}
```

### 3.4 Send PO to Vendor

```typescript
// src/lib/procurement/send-po.ts

export async function sendPurchaseOrder(
  poId: string,
  sentBy: string,
  options: {
    method: 'email' | 'download';
    emailMessage?: string;
  }
) {
  const supabase = await createClient();

  const po = await getPurchaseOrder(poId);

  if (po.status !== 'approved' && po.status !== 'draft') {
    throw new Error('PO must be approved or draft to send');
  }

  // Generate PDF
  const pdfBuffer = await generatePOPDF(po);
  const pdfPath = `pos/${po.company_id}/${po.po_number}.pdf`;

  // Upload to storage
  await supabase.storage
    .from('documents')
    .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf' });

  if (options.method === 'email') {
    // Send email to vendor
    await sendEmail({
      to: po.vendor.email,
      subject: `Purchase Order ${po.po_number}`,
      template: 'purchase-order',
      data: {
        vendorName: po.vendor.name,
        poNumber: po.po_number,
        message: options.emailMessage,
      },
      attachments: [{
        filename: `${po.po_number}.pdf`,
        content: pdfBuffer,
      }],
    });
  }

  // Update status
  await supabase
    .from('purchase_orders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_by: sentBy,
      updated_at: new Date().toISOString(),
    })
    .eq('id', poId);

  return { pdfPath };
}
```

---

## 4. Material Tracking

### 4.1 Track Material to Job

```typescript
// src/lib/procurement/material-tracking.ts

interface MaterialUsageInput {
  jobId: string;
  receivingItemId?: string;
  poLineItemId?: string;
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  costCode?: string;
  budgetItemId?: string;
  phase?: string;
  location?: string;
  notes?: string;
}

export async function recordMaterialUsage(
  companyId: string,
  input: MaterialUsageInput,
  usedBy: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('material_usage')
    .insert({
      company_id: companyId,
      job_id: input.jobId,
      receiving_item_id: input.receivingItemId,
      po_line_item_id: input.poLineItemId,
      inventory_item_id: input.inventoryItemId,
      item_description: input.description,
      quantity_used: input.quantity,
      unit: input.unit,
      unit_cost: input.unitCost,
      cost_code: input.costCode,
      budget_item_id: input.budgetItemId,
      phase: input.phase,
      location: input.location,
      notes: input.notes,
      used_by: usedBy,
    })
    .select()
    .single();

  if (error) throw error;

  // Update budget actual if linked
  if (input.budgetItemId && input.unitCost) {
    await updateBudgetActual(input.budgetItemId, input.quantity * input.unitCost);
  }

  return data;
}

export async function getMaterialUsageByJob(
  jobId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    costCode?: string;
  } = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from('material_usage')
    .select(`
      *,
      used_by_user:users!material_usage_used_by_fkey(id, name),
      budget_item:budget_items(id, category, description)
    `)
    .eq('job_id', jobId)
    .order('usage_date', { ascending: false });

  if (options.startDate) {
    query = query.gte('usage_date', options.startDate.toISOString());
  }

  if (options.endDate) {
    query = query.lte('usage_date', options.endDate.toISOString());
  }

  if (options.costCode) {
    query = query.eq('cost_code', options.costCode);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
```

### 4.2 Material Summary Report

```typescript
// src/lib/procurement/reports.ts

export async function getMaterialSummaryByJob(jobId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_material_summary', {
    p_job_id: jobId,
  });

  if (error) throw error;
  return data;
}

// SQL function for material summary
/*
CREATE OR REPLACE FUNCTION get_material_summary(p_job_id UUID)
RETURNS TABLE (
  cost_code TEXT,
  description TEXT,
  total_quantity DECIMAL,
  unit TEXT,
  total_cost DECIMAL,
  budget_amount DECIMAL,
  variance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mu.cost_code,
    bi.description,
    SUM(mu.quantity_used) as total_quantity,
    mu.unit,
    SUM(mu.total_cost) as total_cost,
    bi.budgeted_amount as budget_amount,
    bi.budgeted_amount - SUM(mu.total_cost) as variance
  FROM material_usage mu
  LEFT JOIN budget_items bi ON mu.budget_item_id = bi.id
  WHERE mu.job_id = p_job_id
  GROUP BY mu.cost_code, bi.description, mu.unit, bi.budgeted_amount
  ORDER BY mu.cost_code;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 5. Receiving

### 5.1 Create Receiving Record

```typescript
// src/lib/procurement/receiving.ts

interface CreateReceivingInput {
  purchaseOrderId: string;
  receivedDate?: Date;
  deliveryMethod?: string;
  carrier?: string;
  trackingNumber?: string;
  packingSlipNumber?: string;
  notes?: string;
  items: Array<{
    poLineItemId: string;
    quantityReceived: number;
    quantityRejected?: number;
    inspectionStatus?: 'passed' | 'failed' | 'partial';
    rejectionReason?: string;
    storageLocation?: string;
  }>;
}

export async function createReceivingRecord(
  companyId: string,
  input: CreateReceivingInput,
  receivedBy: string
) {
  const supabase = await createClient();

  // Generate receiving number
  const receivingNumber = await generateReceivingNumber(companyId);

  // Check for damages
  const hasDamages = input.items.some(
    item => item.quantityRejected && item.quantityRejected > 0
  );

  // Create receiving record
  const { data: record, error: recordError } = await supabase
    .from('receiving_records')
    .insert({
      company_id: companyId,
      purchase_order_id: input.purchaseOrderId,
      receiving_number: receivingNumber,
      received_date: input.receivedDate?.toISOString() || new Date().toISOString(),
      received_by: receivedBy,
      delivery_method: input.deliveryMethod,
      carrier: input.carrier,
      tracking_number: input.trackingNumber,
      packing_slip_number: input.packingSlipNumber,
      notes: input.notes,
      has_damages: hasDamages,
      status: hasDamages ? 'partial_reject' : 'accepted',
    })
    .select()
    .single();

  if (recordError) throw recordError;

  // Create receiving items
  const receivingItems = input.items.map(item => ({
    receiving_record_id: record.id,
    po_line_item_id: item.poLineItemId,
    quantity_ordered: 0, // Will be set from PO line item
    quantity_received: item.quantityReceived,
    quantity_rejected: item.quantityRejected || 0,
    inspection_status: item.inspectionStatus || 'passed',
    rejection_reason: item.rejectionReason,
    storage_location: item.storageLocation,
  }));

  // Get ordered quantities
  const poLineItemIds = input.items.map(i => i.poLineItemId);
  const { data: poItems } = await supabase
    .from('po_line_items')
    .select('id, quantity')
    .in('id', poLineItemIds);

  const itemsWithQty = receivingItems.map(item => ({
    ...item,
    quantity_ordered: poItems?.find(p => p.id === item.po_line_item_id)?.quantity || 0,
  }));

  await supabase.from('receiving_items').insert(itemsWithQty);

  // Update PO status
  await updatePOStatusFromReceiving(input.purchaseOrderId);

  return getReceivingRecord(record.id);
}

export async function getReceivingRecord(recordId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('receiving_records')
    .select(`
      *,
      purchase_order:purchase_orders(
        id,
        po_number,
        vendor:vendors(id, name)
      ),
      received_by_user:users!receiving_records_received_by_fkey(id, name),
      items:receiving_items(
        *,
        po_line_item:po_line_items(
          id,
          description,
          unit,
          quantity,
          unit_price
        )
      )
    `)
    .eq('id', recordId)
    .single();

  if (error) throw error;
  return data;
}

async function updatePOStatusFromReceiving(purchaseOrderId: string) {
  const supabase = await createClient();

  // Get all line items and their received quantities
  const { data: items } = await supabase
    .from('po_line_items')
    .select('quantity, quantity_received')
    .eq('purchase_order_id', purchaseOrderId);

  if (!items) return;

  const totalOrdered = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalReceived = items.reduce((sum, item) => sum + Number(item.quantity_received), 0);

  let newStatus: string;
  if (totalReceived === 0) {
    newStatus = 'sent'; // No change if nothing received
  } else if (totalReceived >= totalOrdered) {
    newStatus = 'received';
  } else {
    newStatus = 'partially_received';
  }

  await supabase
    .from('purchase_orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', purchaseOrderId);
}
```

### 5.2 Receiving UI Component

```typescript
// src/components/procurement/receiving-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const receivingSchema = z.object({
  receivedDate: z.date(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  packingSlipNumber: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    poLineItemId: z.string(),
    quantityReceived: z.number().min(0),
    quantityRejected: z.number().min(0).optional(),
    inspectionStatus: z.enum(['passed', 'failed', 'partial']).optional(),
    rejectionReason: z.string().optional(),
    storageLocation: z.string().optional(),
  })),
});

interface ReceivingFormProps {
  purchaseOrder: PurchaseOrderWithItems;
  onSubmit: (data: z.infer<typeof receivingSchema>) => Promise<void>;
}

export function ReceivingForm({ purchaseOrder, onSubmit }: ReceivingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(receivingSchema),
    defaultValues: {
      receivedDate: new Date(),
      items: purchaseOrder.items.map(item => ({
        poLineItemId: item.id,
        quantityReceived: Number(item.quantity_remaining),
        quantityRejected: 0,
        inspectionStatus: 'passed' as const,
      })),
    },
  });

  const handleSubmit = async (data: z.infer<typeof receivingSchema>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Header Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Received Date</label>
          <input
            type="date"
            {...form.register('receivedDate', { valueAsDate: true })}
          />
        </div>
        <div>
          <label>Packing Slip #</label>
          <input type="text" {...form.register('packingSlipNumber')} />
        </div>
        <div>
          <label>Carrier</label>
          <input type="text" {...form.register('carrier')} />
        </div>
        <div>
          <label>Tracking #</label>
          <input type="text" {...form.register('trackingNumber')} />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="font-semibold">Items</h3>
        <table className="w-full">
          <thead>
            <tr>
              <th>Description</th>
              <th>Ordered</th>
              <th>Previously Received</th>
              <th>Receiving</th>
              <th>Rejected</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrder.items.map((item, index) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity} {item.unit}</td>
                <td>{item.quantity_received}</td>
                <td>
                  <input
                    type="number"
                    className="w-20"
                    {...form.register(`items.${index}.quantityReceived`, {
                      valueAsNumber: true,
                    })}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="w-20"
                    {...form.register(`items.${index}.quantityRejected`, {
                      valueAsNumber: true,
                    })}
                  />
                </td>
                <td>
                  <select {...form.register(`items.${index}.inspectionStatus`)}>
                    <option value="passed">Passed</option>
                    <option value="partial">Partial</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div>
        <label>Notes</label>
        <textarea {...form.register('notes')} rows={3} />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary"
      >
        {isSubmitting ? 'Saving...' : 'Complete Receiving'}
      </button>
    </form>
  );
}
```

---

## 6. Inventory Management

### 6.1 Inventory Tables

```sql
-- Inventory locations (warehouses)
CREATE TABLE inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES inventory_locations(id),

  -- Item details
  item_code TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,

  -- Quantities
  quantity_on_hand DECIMAL(12, 4) DEFAULT 0,
  quantity_reserved DECIMAL(12, 4) DEFAULT 0,
  quantity_available DECIMAL(12, 4) GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,

  -- Reorder
  reorder_point DECIMAL(12, 4) DEFAULT 0,
  reorder_quantity DECIMAL(12, 4) DEFAULT 0,

  -- Costing
  average_cost DECIMAL(12, 4) DEFAULT 0,
  total_value DECIMAL(14, 2) GENERATED ALWAYS AS (quantity_on_hand * average_cost) STORED,

  -- Tracking
  bin_location TEXT,
  last_counted DATE,
  last_received DATE,
  last_issued DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory transactions
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),

  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'receive', 'issue', 'transfer', 'adjust', 'count'
  )),
  quantity DECIMAL(12, 4) NOT NULL, -- Positive for in, negative for out
  unit_cost DECIMAL(12, 4),

  -- References
  receiving_item_id UUID REFERENCES receiving_items(id),
  material_usage_id UUID REFERENCES material_usage(id),
  job_id UUID REFERENCES jobs(id),

  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(inventory_item_id);
```

### 6.2 Inventory Operations

```typescript
// src/lib/procurement/inventory.ts

export async function receiveToInventory(
  inventoryItemId: string,
  quantity: number,
  unitCost: number,
  receivingItemId?: string,
  createdBy?: string
) {
  const supabase = await createClient();

  // Create transaction
  await supabase.from('inventory_transactions').insert({
    inventory_item_id: inventoryItemId,
    transaction_type: 'receive',
    quantity: quantity,
    unit_cost: unitCost,
    receiving_item_id: receivingItemId,
    created_by: createdBy,
  });

  // Update inventory item with weighted average cost
  const { data: item } = await supabase
    .from('inventory_items')
    .select('quantity_on_hand, average_cost')
    .eq('id', inventoryItemId)
    .single();

  const currentQty = Number(item?.quantity_on_hand || 0);
  const currentCost = Number(item?.average_cost || 0);

  const newQty = currentQty + quantity;
  const newAvgCost = currentQty > 0
    ? ((currentQty * currentCost) + (quantity * unitCost)) / newQty
    : unitCost;

  await supabase
    .from('inventory_items')
    .update({
      quantity_on_hand: newQty,
      average_cost: newAvgCost,
      last_received: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', inventoryItemId);
}

export async function issueFromInventory(
  inventoryItemId: string,
  quantity: number,
  jobId: string,
  createdBy?: string
) {
  const supabase = await createClient();

  // Verify available quantity
  const { data: item } = await supabase
    .from('inventory_items')
    .select('quantity_available, average_cost')
    .eq('id', inventoryItemId)
    .single();

  if (!item || Number(item.quantity_available) < quantity) {
    throw new Error('Insufficient inventory');
  }

  // Create transaction (negative quantity for issue)
  await supabase.from('inventory_transactions').insert({
    inventory_item_id: inventoryItemId,
    transaction_type: 'issue',
    quantity: -quantity,
    unit_cost: item.average_cost,
    job_id: jobId,
    created_by: createdBy,
  });

  // Update inventory item
  await supabase
    .from('inventory_items')
    .update({
      quantity_on_hand: Number(item.quantity_available) - quantity + Number(item.quantity_reserved || 0),
      last_issued: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', inventoryItemId);

  return { unitCost: item.average_cost };
}
```

---

## 7. Reporting

### 7.1 PO Status Report

```typescript
// src/lib/procurement/reports.ts

export async function getPOStatusReport(
  companyId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    vendorId?: string;
    status?: string;
  } = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from('purchase_orders')
    .select(`
      id,
      po_number,
      status,
      po_date,
      required_date,
      total,
      vendor:vendors(name),
      job:jobs(name, job_number),
      items:po_line_items(
        quantity,
        quantity_received,
        line_total
      )
    `)
    .eq('company_id', companyId)
    .order('po_date', { ascending: false });

  if (options.startDate) {
    query = query.gte('po_date', options.startDate.toISOString());
  }
  if (options.endDate) {
    query = query.lte('po_date', options.endDate.toISOString());
  }
  if (options.vendorId) {
    query = query.eq('vendor_id', options.vendorId);
  }
  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Calculate summaries
  return data.map(po => {
    const totalOrdered = po.items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const totalReceived = po.items.reduce((sum, i) => sum + Number(i.quantity_received), 0);
    const receivedPercent = totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

    return {
      ...po,
      totalOrdered,
      totalReceived,
      receivedPercent,
    };
  });
}
```

### 7.2 Vendor Spend Analysis

```typescript
export async function getVendorSpendAnalysis(
  companyId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_vendor_spend_analysis', {
    p_company_id: companyId,
    p_start_date: options.startDate?.toISOString(),
    p_end_date: options.endDate?.toISOString(),
    p_limit: options.limit || 20,
  });

  if (error) throw error;
  return data;
}

// SQL function
/*
CREATE OR REPLACE FUNCTION get_vendor_spend_analysis(
  p_company_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  vendor_id UUID,
  vendor_name TEXT,
  po_count BIGINT,
  total_spend DECIMAL,
  avg_po_value DECIMAL,
  on_time_delivery_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as vendor_id,
    v.name as vendor_name,
    COUNT(DISTINCT po.id) as po_count,
    SUM(po.total) as total_spend,
    AVG(po.total) as avg_po_value,
    (
      COUNT(CASE WHEN po.status = 'received'
        AND po.required_date IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM receiving_records rr
          WHERE rr.purchase_order_id = po.id
          AND rr.received_date <= po.required_date
        ) THEN 1 END
      )::DECIMAL /
      NULLIF(COUNT(CASE WHEN po.status = 'received' THEN 1 END), 0)
    ) * 100 as on_time_delivery_rate
  FROM vendors v
  JOIN purchase_orders po ON po.vendor_id = v.id
  WHERE v.company_id = p_company_id
    AND (p_start_date IS NULL OR po.po_date >= p_start_date)
    AND (p_end_date IS NULL OR po.po_date <= p_end_date)
  GROUP BY v.id, v.name
  ORDER BY total_spend DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## Summary

The Procurement System provides:

1. **Purchase Orders**: Create, approve, and track POs
2. **Approval Workflow**: Configurable approval thresholds
3. **Vendor Communication**: Send POs electronically
4. **Receiving**: Log deliveries and inspect items
5. **Material Tracking**: Track materials to specific jobs
6. **Inventory**: Optional warehouse management
7. **Reporting**: Spend analysis and status reports

---

*Last Updated: 2026-02-12*
*Version: 1.0*
