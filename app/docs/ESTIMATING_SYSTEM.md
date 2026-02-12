# RossOS Estimating System

> **Purpose**: Construction estimating with assemblies, takeoffs, and bid generation.
>
> **Phase**: 12 (Sales & Pre-Construction)
>
> **Last Updated**: 2026-02-12

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Schema](#2-database-schema)
3. [Cost Database](#3-cost-database)
4. [Assemblies](#4-assemblies)
5. [Takeoffs](#5-takeoffs)
6. [Bid Generation](#6-bid-generation)
7. [Integration Points](#7-integration-points)

---

## 1. Overview

### 1.1 Estimating Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ESTIMATING WORKFLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. PLANS            2. TAKEOFF           3. ASSEMBLY        4. BID        │
│   ───────            ─────────            ──────────        ─────           │
│   ┌─────────┐        ┌─────────┐          ┌─────────┐       ┌─────────┐    │
│   │ Upload  │        │ Measure │          │ Apply   │       │ Generate│    │
│   │ PDF/CAD │───────▶│ Areas & │─────────▶│ Pricing │──────▶│ Proposal│    │
│   │ Plans   │        │ Counts  │          │ & Labor │       │ & Bid   │    │
│   └─────────┘        └─────────┘          └─────────┘       └─────────┘    │
│                                                                              │
│   Features:           Features:            Features:         Features:       │
│   - Plan viewer       - Area calc          - Cost DB         - PDF export   │
│   - Scale setting     - Linear ft          - Assemblies      - Breakdowns   │
│   - Markup tools      - Count items        - Labor rates     - Alternates   │
│   - Revisions         - Export data        - Markup %        - Cover letter │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Cost Database | Material and labor cost library | P0 |
| Assemblies | Pre-built component groups | P0 |
| Takeoff Tools | Measurement from plans | P1 |
| Bid Generation | Proposal creation | P0 |
| Templates | Reusable estimate templates | P1 |
| Historical Data | Past project cost analysis | P2 |

---

## 2. Database Schema

### 2.1 Cost Items Table

```sql
-- Base cost database items
CREATE TABLE cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Classification
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  unit TEXT NOT NULL, -- 'EA', 'SF', 'LF', 'SY', 'HR', etc.

  -- Costs
  material_cost DECIMAL(12, 2) DEFAULT 0,
  labor_cost DECIMAL(12, 2) DEFAULT 0,
  equipment_cost DECIMAL(12, 2) DEFAULT 0,
  labor_hours DECIMAL(8, 2) DEFAULT 0,

  -- Metadata
  supplier TEXT,
  manufacturer TEXT,
  model_number TEXT,
  last_price_update TIMESTAMPTZ,
  price_source TEXT, -- 'manual', 'supplier_import', 'rs_means'

  -- Flags
  is_active BOOLEAN DEFAULT true,
  is_taxable BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, code)
);

CREATE INDEX idx_cost_items_company ON cost_items(company_id);
CREATE INDEX idx_cost_items_category ON cost_items(company_id, category);
CREATE INDEX idx_cost_items_search ON cost_items USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- RLS
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company isolation" ON cost_items
  USING (company_id = get_current_company_id());
```

### 2.2 Assemblies Table

```sql
-- Assembly templates (groups of cost items)
CREATE TABLE assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL, -- Unit for the entire assembly

  -- Calculated totals (denormalized for performance)
  total_material_cost DECIMAL(12, 2) DEFAULT 0,
  total_labor_cost DECIMAL(12, 2) DEFAULT 0,
  total_labor_hours DECIMAL(8, 2) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, code)
);

-- Assembly line items
CREATE TABLE assembly_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  cost_item_id UUID REFERENCES cost_items(id) ON DELETE SET NULL,

  -- Can be custom or from cost database
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL DEFAULT 1,

  -- Per-unit costs
  material_cost DECIMAL(12, 2) DEFAULT 0,
  labor_cost DECIMAL(12, 2) DEFAULT 0,
  labor_hours DECIMAL(8, 2) DEFAULT 0,

  -- Calculated
  extended_material DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * material_cost) STORED,
  extended_labor DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * labor_cost) STORED,

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assembly_items_assembly ON assembly_items(assembly_id);

-- Trigger to recalculate assembly totals
CREATE OR REPLACE FUNCTION update_assembly_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assemblies
  SET
    total_material_cost = (
      SELECT COALESCE(SUM(extended_material), 0)
      FROM assembly_items WHERE assembly_id = COALESCE(NEW.assembly_id, OLD.assembly_id)
    ),
    total_labor_cost = (
      SELECT COALESCE(SUM(extended_labor), 0)
      FROM assembly_items WHERE assembly_id = COALESCE(NEW.assembly_id, OLD.assembly_id)
    ),
    total_labor_hours = (
      SELECT COALESCE(SUM(quantity * labor_hours), 0)
      FROM assembly_items WHERE assembly_id = COALESCE(NEW.assembly_id, OLD.assembly_id)
    ),
    total_cost = (
      SELECT COALESCE(SUM(extended_material + extended_labor), 0)
      FROM assembly_items WHERE assembly_id = COALESCE(NEW.assembly_id, OLD.assembly_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.assembly_id, OLD.assembly_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assembly_items_totals
  AFTER INSERT OR UPDATE OR DELETE ON assembly_items
  FOR EACH ROW EXECUTE FUNCTION update_assembly_totals();
```

### 2.3 Estimates Table

```sql
-- Estimates (project bids)
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  opportunity_id UUID REFERENCES opportunities(id), -- From CRM

  -- Identification
  estimate_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'sent', 'accepted', 'rejected', 'expired'
  )),

  -- Project details
  project_address TEXT,
  project_type TEXT,
  square_footage DECIMAL(12, 2),

  -- Financials
  subtotal DECIMAL(14, 2) DEFAULT 0,
  overhead_percent DECIMAL(5, 2) DEFAULT 10,
  overhead_amount DECIMAL(14, 2) DEFAULT 0,
  profit_percent DECIMAL(5, 2) DEFAULT 15,
  profit_amount DECIMAL(14, 2) DEFAULT 0,
  contingency_percent DECIMAL(5, 2) DEFAULT 5,
  contingency_amount DECIMAL(14, 2) DEFAULT 0,
  total DECIMAL(14, 2) DEFAULT 0,

  -- Tax
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  taxable_amount DECIMAL(14, 2) DEFAULT 0,
  tax_amount DECIMAL(14, 2) DEFAULT 0,
  grand_total DECIMAL(14, 2) DEFAULT 0,

  -- Dates
  estimate_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  internal_notes TEXT,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, estimate_number)
);

-- Estimate sections (divisions/categories)
CREATE TABLE estimate_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,

  -- Section totals (calculated)
  material_total DECIMAL(14, 2) DEFAULT 0,
  labor_total DECIMAL(14, 2) DEFAULT 0,
  section_total DECIMAL(14, 2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimate line items
CREATE TABLE estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  section_id UUID REFERENCES estimate_sections(id) ON DELETE SET NULL,

  -- Source reference
  cost_item_id UUID REFERENCES cost_items(id),
  assembly_id UUID REFERENCES assemblies(id),

  -- Item details
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL,
  quantity DECIMAL(12, 4) NOT NULL DEFAULT 1,

  -- Costs per unit
  material_cost DECIMAL(12, 2) DEFAULT 0,
  labor_cost DECIMAL(12, 2) DEFAULT 0,
  equipment_cost DECIMAL(12, 2) DEFAULT 0,

  -- Extended costs
  material_extended DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * material_cost) STORED,
  labor_extended DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * labor_cost) STORED,
  equipment_extended DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * equipment_cost) STORED,
  line_total DECIMAL(14, 2) GENERATED ALWAYS AS (
    quantity * (material_cost + labor_cost + equipment_cost)
  ) STORED,

  -- Flags
  is_taxable BOOLEAN DEFAULT true,
  is_alternate BOOLEAN DEFAULT false, -- Alternate/option item
  include_in_total BOOLEAN DEFAULT true,

  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estimate_items_estimate ON estimate_items(estimate_id);
CREATE INDEX idx_estimate_items_section ON estimate_items(section_id);
```

### 2.4 Takeoffs Table

```sql
-- Plan takeoffs
CREATE TABLE takeoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  plan_file_url TEXT, -- PDF/image of plans
  scale TEXT, -- e.g., "1/4" = 1'-0""

  status TEXT DEFAULT 'in_progress' CHECK (status IN (
    'in_progress', 'completed', 'archived'
  )),

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Takeoff measurements
CREATE TABLE takeoff_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  takeoff_id UUID NOT NULL REFERENCES takeoffs(id) ON DELETE CASCADE,

  -- Classification
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Measurement type and value
  measurement_type TEXT NOT NULL CHECK (measurement_type IN (
    'area', 'linear', 'count', 'volume'
  )),
  quantity DECIMAL(14, 4) NOT NULL,
  unit TEXT NOT NULL, -- SF, LF, EA, CY, etc.

  -- Location on plan (for viewer)
  page_number INT,
  coordinates JSONB, -- [{x, y}] for polygon/line points

  -- Link to estimate
  estimate_item_id UUID REFERENCES estimate_items(id),

  color TEXT DEFAULT '#3B82F6', -- For plan markup
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_takeoff_items_takeoff ON takeoff_items(takeoff_id);
```

---

## 3. Cost Database

### 3.1 Cost Item Categories

| Category | Examples |
|----------|----------|
| **Site Work** | Excavation, grading, utilities |
| **Concrete** | Footings, slabs, flatwork |
| **Masonry** | Block, brick, stone |
| **Metals** | Structural steel, misc metals |
| **Wood & Plastics** | Framing, finish carpentry |
| **Thermal & Moisture** | Insulation, roofing, waterproofing |
| **Doors & Windows** | Entry doors, windows, hardware |
| **Finishes** | Drywall, paint, flooring, tile |
| **Specialties** | Cabinets, countertops, appliances |
| **Mechanical** | HVAC, plumbing |
| **Electrical** | Wiring, fixtures, panels |

### 3.2 Cost Item API

```typescript
// src/app/api/cost-items/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const costItemSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  unit: z.string().min(1),
  material_cost: z.number().min(0).default(0),
  labor_cost: z.number().min(0).default(0),
  equipment_cost: z.number().min(0).default(0),
  labor_hours: z.number().min(0).default(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const supabase = await createClient();

  let query = supabase
    .from('cost_items')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.textSearch('name', search);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const validation = costItemSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('cost_items')
    .insert(validation.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

### 3.3 Cost Database Import

```typescript
// src/lib/estimating/import-costs.ts

interface CostImportRow {
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  material_cost: number;
  labor_cost: number;
  labor_hours?: number;
}

export async function importCostDatabase(
  companyId: string,
  rows: CostImportRow[],
  options: {
    updateExisting?: boolean;
    source?: string;
  } = {}
) {
  const supabase = await createClient();
  const results = { created: 0, updated: 0, errors: [] as string[] };

  for (const row of rows) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('cost_items')
        .select('id')
        .eq('company_id', companyId)
        .eq('code', row.code)
        .single();

      if (existing && options.updateExisting) {
        await supabase
          .from('cost_items')
          .update({
            ...row,
            last_price_update: new Date().toISOString(),
            price_source: options.source || 'import',
          })
          .eq('id', existing.id);
        results.updated++;
      } else if (!existing) {
        await supabase.from('cost_items').insert({
          ...row,
          company_id: companyId,
          last_price_update: new Date().toISOString(),
          price_source: options.source || 'import',
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push(`Error importing ${row.code}: ${error}`);
    }
  }

  return results;
}
```

---

## 4. Assemblies

### 4.1 Assembly Management

```typescript
// src/lib/estimating/assemblies.ts

interface AssemblyItem {
  costItemId?: string;
  name: string;
  description?: string;
  unit: string;
  quantity: number;
  materialCost: number;
  laborCost: number;
  laborHours: number;
}

interface Assembly {
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  items: AssemblyItem[];
}

export async function createAssembly(
  companyId: string,
  assembly: Assembly
) {
  const supabase = await createClient();

  // Create assembly
  const { data: newAssembly, error: assemblyError } = await supabase
    .from('assemblies')
    .insert({
      company_id: companyId,
      code: assembly.code,
      name: assembly.name,
      description: assembly.description,
      category: assembly.category,
      unit: assembly.unit,
    })
    .select()
    .single();

  if (assemblyError) throw assemblyError;

  // Add items
  const items = assembly.items.map((item, index) => ({
    assembly_id: newAssembly.id,
    cost_item_id: item.costItemId,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    material_cost: item.materialCost,
    labor_cost: item.laborCost,
    labor_hours: item.laborHours,
    sort_order: index,
  }));

  await supabase.from('assembly_items').insert(items);

  // Fetch complete assembly with totals
  return getAssembly(newAssembly.id);
}

export async function getAssembly(assemblyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assemblies')
    .select(`
      *,
      items:assembly_items(
        *,
        cost_item:cost_items(code, name)
      )
    `)
    .eq('id', assemblyId)
    .single();

  if (error) throw error;
  return data;
}

export async function applyAssemblyToEstimate(
  estimateId: string,
  assemblyId: string,
  quantity: number,
  sectionId?: string
) {
  const assembly = await getAssembly(assemblyId);
  const supabase = await createClient();

  // Create estimate items from assembly items
  const items = assembly.items.map((item: any, index: number) => ({
    estimate_id: estimateId,
    section_id: sectionId,
    assembly_id: assemblyId,
    cost_item_id: item.cost_item_id,
    code: item.cost_item?.code,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity * quantity,
    material_cost: item.material_cost,
    labor_cost: item.labor_cost,
    sort_order: index,
  }));

  await supabase.from('estimate_items').insert(items);

  // Recalculate estimate totals
  await recalculateEstimate(estimateId);
}
```

### 4.2 Common Construction Assemblies

```typescript
// src/lib/estimating/standard-assemblies.ts

export const standardAssemblies = [
  {
    code: 'FRM-EXT-2X6',
    name: 'Exterior Wall Framing - 2x6',
    category: 'Framing',
    unit: 'LF',
    items: [
      { name: '2x6x8 Studs', unit: 'EA', quantity: 1.5, materialCost: 8.50 },
      { name: 'Bottom Plate 2x6', unit: 'LF', quantity: 1, materialCost: 2.25 },
      { name: 'Top Plates 2x6 (Double)', unit: 'LF', quantity: 2, materialCost: 2.25 },
      { name: 'Framing Nails', unit: 'LF', quantity: 1, materialCost: 0.15 },
      { name: 'Framing Labor', unit: 'LF', quantity: 1, laborCost: 4.50, laborHours: 0.12 },
    ],
  },
  {
    code: 'DRY-1/2-LV0',
    name: 'Drywall - 1/2" Level 0 Finish',
    category: 'Finishes',
    unit: 'SF',
    items: [
      { name: '1/2" Drywall Sheet', unit: 'SF', quantity: 1.1, materialCost: 0.45 },
      { name: 'Drywall Screws', unit: 'SF', quantity: 1, materialCost: 0.02 },
      { name: 'Joint Tape', unit: 'SF', quantity: 1, materialCost: 0.01 },
      { name: 'Joint Compound', unit: 'SF', quantity: 1, materialCost: 0.08 },
      { name: 'Hang Drywall', unit: 'SF', quantity: 1, laborCost: 0.65, laborHours: 0.015 },
      { name: 'Tape & Finish L0', unit: 'SF', quantity: 1, laborCost: 0.35, laborHours: 0.008 },
    ],
  },
  // ... more assemblies
];
```

---

## 5. Takeoffs

### 5.1 Takeoff Measurement Types

| Type | Unit | Use Case |
|------|------|----------|
| **Area** | SF, SY | Flooring, roofing, drywall |
| **Linear** | LF | Trim, framing, piping |
| **Count** | EA | Doors, windows, fixtures |
| **Volume** | CY, CF | Concrete, excavation |

### 5.2 Takeoff Component

```typescript
// src/components/takeoff/takeoff-viewer.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

interface TakeoffMeasurement {
  id: string;
  type: 'area' | 'linear' | 'count';
  points: { x: number; y: number }[];
  value: number;
  unit: string;
  category: string;
  name: string;
  color: string;
}

interface TakeoffViewerProps {
  planUrl: string;
  scale: string; // e.g., "1/4" = 1'-0""
  measurements: TakeoffMeasurement[];
  onMeasurementAdd: (measurement: Omit<TakeoffMeasurement, 'id'>) => void;
  onMeasurementDelete: (id: string) => void;
}

export function TakeoffViewer({
  planUrl,
  scale,
  measurements,
  onMeasurementAdd,
  onMeasurementDelete,
}: TakeoffViewerProps) {
  const [currentTool, setCurrentTool] = useState<'area' | 'linear' | 'count' | null>(null);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scaleFactor = parseScale(scale); // Convert scale string to number

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'count') {
      // Count tool - single click adds a point
      const measurement = {
        type: 'count' as const,
        points: [{ x, y }],
        value: 1,
        unit: 'EA',
        category: 'Uncategorized',
        name: 'New Item',
        color: '#3B82F6',
      };
      onMeasurementAdd(measurement);
    } else {
      // Area/Linear - build polygon/line
      setCurrentPoints([...currentPoints, { x, y }]);
    }
  }, [currentTool, currentPoints, onMeasurementAdd]);

  const completeMeasurement = useCallback(() => {
    if (currentPoints.length < 2) return;

    let value: number;
    let unit: string;

    if (currentTool === 'area') {
      // Calculate polygon area
      value = calculatePolygonArea(currentPoints) * scaleFactor * scaleFactor;
      unit = 'SF';
    } else {
      // Calculate line length
      value = calculateLineLength(currentPoints) * scaleFactor;
      unit = 'LF';
    }

    onMeasurementAdd({
      type: currentTool!,
      points: currentPoints,
      value,
      unit,
      category: 'Uncategorized',
      name: 'New Measurement',
      color: currentTool === 'area' ? '#10B981' : '#F59E0B',
    });

    setCurrentPoints([]);
  }, [currentTool, currentPoints, scaleFactor, onMeasurementAdd]);

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <div className="w-16 bg-muted p-2 flex flex-col gap-2">
        <button
          onClick={() => setCurrentTool('area')}
          className={`p-2 rounded ${currentTool === 'area' ? 'bg-primary text-white' : ''}`}
        >
          Area
        </button>
        <button
          onClick={() => setCurrentTool('linear')}
          className={`p-2 rounded ${currentTool === 'linear' ? 'bg-primary text-white' : ''}`}
        >
          Linear
        </button>
        <button
          onClick={() => setCurrentTool('count')}
          className={`p-2 rounded ${currentTool === 'count' ? 'bg-primary text-white' : ''}`}
        >
          Count
        </button>
        <button
          onClick={completeMeasurement}
          className="p-2 rounded bg-green-500 text-white"
          disabled={currentPoints.length < 2}
        >
          Done
        </button>
      </div>

      {/* Plan Viewer */}
      <div className="flex-1 relative overflow-auto">
        <Document
          file={planUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page
            pageNumber={pageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>

        {/* Measurement overlay canvas */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Measurements list */}
      <div className="w-64 bg-muted p-4 overflow-auto">
        <h3 className="font-semibold mb-4">Measurements</h3>
        {measurements.map((m) => (
          <div key={m.id} className="p-2 bg-background rounded mb-2">
            <div className="flex justify-between">
              <span>{m.name}</span>
              <button onClick={() => onMeasurementDelete(m.id)}>×</button>
            </div>
            <div className="text-sm text-muted-foreground">
              {m.value.toFixed(2)} {m.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseScale(scale: string): number {
  // Parse scale like "1/4" = 1'-0"" -> 48 (inches per inch on plan)
  const match = scale.match(/(\d+)\/(\d+)/);
  if (match) {
    return (parseInt(match[2]) / parseInt(match[1])) * 12;
  }
  return 1;
}

function calculatePolygonArea(points: { x: number; y: number }[]): number {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

function calculateLineLength(points: { x: number; y: number }[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}
```

---

## 6. Bid Generation

### 6.1 Estimate Calculations

```typescript
// src/lib/estimating/calculations.ts

interface EstimateCalculations {
  subtotal: number;
  overheadAmount: number;
  profitAmount: number;
  contingencyAmount: number;
  total: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export function calculateEstimateTotals(
  items: Array<{
    lineTotal: number;
    isTaxable: boolean;
    includeInTotal: boolean;
  }>,
  settings: {
    overheadPercent: number;
    profitPercent: number;
    contingencyPercent: number;
    taxRate: number;
  }
): EstimateCalculations {
  // Sum included items
  const subtotal = items
    .filter(item => item.includeInTotal)
    .reduce((sum, item) => sum + item.lineTotal, 0);

  // Calculate markups
  const overheadAmount = subtotal * (settings.overheadPercent / 100);
  const subtotalWithOverhead = subtotal + overheadAmount;

  const profitAmount = subtotalWithOverhead * (settings.profitPercent / 100);
  const subtotalWithProfit = subtotalWithOverhead + profitAmount;

  const contingencyAmount = subtotalWithProfit * (settings.contingencyPercent / 100);
  const total = subtotalWithProfit + contingencyAmount;

  // Calculate tax on taxable items only
  const taxableAmount = items
    .filter(item => item.includeInTotal && item.isTaxable)
    .reduce((sum, item) => sum + item.lineTotal, 0);

  // Apply markups to taxable portion
  const taxableWithMarkups = taxableAmount *
    (1 + settings.overheadPercent / 100) *
    (1 + settings.profitPercent / 100) *
    (1 + settings.contingencyPercent / 100);

  const taxAmount = taxableWithMarkups * settings.taxRate;
  const grandTotal = total + taxAmount;

  return {
    subtotal,
    overheadAmount,
    profitAmount,
    contingencyAmount,
    total,
    taxableAmount: taxableWithMarkups,
    taxAmount,
    grandTotal,
  };
}

export async function recalculateEstimate(estimateId: string) {
  const supabase = await createClient();

  // Get estimate settings and items
  const { data: estimate } = await supabase
    .from('estimates')
    .select(`
      overhead_percent,
      profit_percent,
      contingency_percent,
      tax_rate,
      items:estimate_items(line_total, is_taxable, include_in_total)
    `)
    .eq('id', estimateId)
    .single();

  if (!estimate) return;

  const totals = calculateEstimateTotals(estimate.items, {
    overheadPercent: estimate.overhead_percent,
    profitPercent: estimate.profit_percent,
    contingencyPercent: estimate.contingency_percent,
    taxRate: estimate.tax_rate,
  });

  // Update estimate
  await supabase
    .from('estimates')
    .update({
      subtotal: totals.subtotal,
      overhead_amount: totals.overheadAmount,
      profit_amount: totals.profitAmount,
      contingency_amount: totals.contingencyAmount,
      total: totals.total,
      taxable_amount: totals.taxableAmount,
      tax_amount: totals.taxAmount,
      grand_total: totals.grandTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('id', estimateId);
}
```

### 6.2 Bid PDF Generation

```typescript
// src/lib/estimating/generate-bid-pdf.ts
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export function generateBidPDF(estimate: EstimateWithItems) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROPOSAL</Text>
          <Text>Estimate #{estimate.estimate_number}</Text>
          <Text>Date: {formatDate(estimate.estimate_date)}</Text>
        </View>

        {/* Client Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prepared For</Text>
          <Text>{estimate.client.name}</Text>
          <Text>{estimate.client.address}</Text>
        </View>

        {/* Project Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project</Text>
          <Text>{estimate.name}</Text>
          <Text>{estimate.project_address}</Text>
        </View>

        {/* Scope of Work */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope of Work</Text>
          {estimate.sections.map(section => (
            <View key={section.id} style={styles.scopeSection}>
              <Text style={styles.scopeTitle}>{section.name}</Text>
              {section.items.map(item => (
                <View key={item.id} style={styles.scopeItem}>
                  <Text>• {item.name}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Pricing Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment</Text>
          <View style={styles.pricingRow}>
            <Text>Base Price:</Text>
            <Text>{formatCurrency(estimate.subtotal)}</Text>
          </View>
          {estimate.tax_amount > 0 && (
            <View style={styles.pricingRow}>
              <Text>Sales Tax:</Text>
              <Text>{formatCurrency(estimate.tax_amount)}</Text>
            </View>
          )}
          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Investment:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(estimate.grand_total)}
            </Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Text>• This proposal is valid until {formatDate(estimate.valid_until)}</Text>
          <Text>• Payment terms: 50% deposit, balance due upon completion</Text>
          <Text>• Work to begin within 2 weeks of signed agreement</Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine}>
            <Text>Accepted By: _________________________</Text>
            <Text>Date: _____________</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
```

---

## 7. Integration Points

### 7.1 Convert Estimate to Job

```typescript
// src/lib/estimating/convert-to-job.ts

export async function convertEstimateToJob(
  estimateId: string,
  options: {
    createBudget?: boolean;
    importTakeoffs?: boolean;
  } = {}
) {
  const supabase = await createClient();

  // Get estimate with all details
  const { data: estimate } = await supabase
    .from('estimates')
    .select(`
      *,
      client:clients(*),
      sections:estimate_sections(
        *,
        items:estimate_items(*)
      )
    `)
    .eq('id', estimateId)
    .single();

  if (!estimate) throw new Error('Estimate not found');

  // Create job
  const { data: job } = await supabase
    .from('jobs')
    .insert({
      company_id: estimate.company_id,
      client_id: estimate.client_id,
      name: estimate.name,
      address: estimate.project_address,
      contract_amount: estimate.grand_total,
      status: 'pending',
      source_estimate_id: estimateId,
    })
    .select()
    .single();

  if (!job) throw new Error('Failed to create job');

  // Create budget if requested
  if (options.createBudget) {
    for (const section of estimate.sections) {
      for (const item of section.items) {
        await supabase.from('budget_items').insert({
          job_id: job.id,
          category: section.name,
          description: item.name,
          budgeted_amount: item.line_total,
        });
      }
    }
  }

  // Update estimate status
  await supabase
    .from('estimates')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', estimateId);

  return job;
}
```

### 7.2 Historical Cost Analysis

```typescript
// src/lib/estimating/historical-analysis.ts

export async function analyzeHistoricalCosts(
  companyId: string,
  category: string,
  options: {
    dateRange?: { start: Date; end: Date };
    projectTypes?: string[];
  } = {}
) {
  const supabase = await createClient();

  let query = supabase
    .from('budget_items')
    .select(`
      category,
      budgeted_amount,
      actual_amount,
      job:jobs!inner(
        id,
        name,
        square_footage,
        project_type,
        completed_at
      )
    `)
    .eq('job.company_id', companyId)
    .eq('category', category)
    .not('job.completed_at', 'is', null);

  if (options.dateRange) {
    query = query
      .gte('job.completed_at', options.dateRange.start.toISOString())
      .lte('job.completed_at', options.dateRange.end.toISOString());
  }

  const { data: items } = await query;

  if (!items?.length) return null;

  // Calculate statistics
  const costPerSF = items.map(item => ({
    budgeted: item.budgeted_amount / item.job.square_footage,
    actual: item.actual_amount / item.job.square_footage,
  }));

  return {
    category,
    sampleSize: items.length,
    budgetedPerSF: {
      min: Math.min(...costPerSF.map(c => c.budgeted)),
      max: Math.max(...costPerSF.map(c => c.budgeted)),
      avg: costPerSF.reduce((sum, c) => sum + c.budgeted, 0) / costPerSF.length,
    },
    actualPerSF: {
      min: Math.min(...costPerSF.map(c => c.actual)),
      max: Math.max(...costPerSF.map(c => c.actual)),
      avg: costPerSF.reduce((sum, c) => sum + c.actual, 0) / costPerSF.length,
    },
    variancePercent: calculateAverageVariance(items),
  };
}
```

---

## Summary

The Estimating System provides:

1. **Cost Database**: Maintain material and labor costs
2. **Assemblies**: Create reusable component groups
3. **Takeoffs**: Measure quantities from plans
4. **Bid Generation**: Create professional proposals
5. **Job Conversion**: Convert accepted estimates to active jobs
6. **Historical Analysis**: Learn from past projects

---

*Last Updated: 2026-02-12*
*Version: 1.0*
