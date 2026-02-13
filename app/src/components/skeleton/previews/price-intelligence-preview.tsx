'use client'

import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
  Minus,
  Package,
  Hammer,
  Zap,
  Droplets,
  Flame,
  PaintBucket,
  Upload,
  Star,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronRight,
  Eye,
  Users,
  FileText,
  Settings,
  Award,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ── Types ────────────────────────────────────────────────────

type Trend = 'up' | 'down' | 'stable'
type Severity = 'info' | 'warning' | 'alert'
type Confidence = 'strong' | 'moderate' | 'weak' | 'very_weak'

interface VendorPrice {
  price: number
  trend: Trend
  date: string
  leadDays?: number
}

interface Material {
  id: string
  name: string
  category: string
  unit: string
  altUnits?: Record<string, number> // conversion factors
  prices: Record<string, VendorPrice>
  confidence: number
  dataPoints: number
}

interface Vendor {
  id: string
  name: string
  short: string
}

interface Category {
  id: string
  name: string
  icon: React.ElementType
}

interface LaborSub {
  id: string
  name: string
  trade: string
  pricePerSf: number
  pricePerUnit?: number
  qualityRating: number
  scheduleRating: number
  communicationRating: number
  callbacks: number
  jobsCompleted: number
  valueScore: number
  availability: string
  lastQuoteDate: string
}

interface Anomaly {
  id: string
  material: string
  vendor: string
  severity: Severity
  message: string
  deviation: number
  date: string
}

interface SavingsItem {
  job: string
  category: string
  actualSpend: number
  optimalSpend: number
  savings: number
  vendor: string
}

// ── Mock Data ────────────────────────────────────────────────

const vendors: Vendor[] = [
  { id: 'gulf', name: 'Gulf Lumber', short: 'Gulf' },
  { id: '84', name: '84 Lumber', short: '84 Lbr' },
  { id: 'island', name: 'Island Lumber', short: 'Island' },
  { id: 'builder', name: 'BuilderFirst Supply', short: 'BldFirst' },
  { id: 'coastal', name: 'Coastal Supply Co', short: 'Coastal' },
  { id: 'abc', name: 'ABC Supply', short: 'ABC' },
  { id: 'advantage', name: 'Advantage Lumber', short: 'Advntg' },
  { id: 'hdpro', name: 'HD Pro', short: 'HD Pro' },
]

const categories: Category[] = [
  { id: 'framing', name: 'Framing Lumber', icon: Package },
  { id: 'sheet-goods', name: 'Sheet Goods', icon: Package },
  { id: 'roofing', name: 'Roofing', icon: Package },
  { id: 'concrete', name: 'Concrete & Masonry', icon: Package },
  { id: 'insulation', name: 'Insulation', icon: Flame },
  { id: 'siding', name: 'Siding & Trim', icon: PaintBucket },
  { id: 'decking', name: 'Decking', icon: Package },
  { id: 'electrical', name: 'Electrical', icon: Zap },
  { id: 'plumbing', name: 'Plumbing', icon: Droplets },
  { id: 'windows', name: 'Windows & Doors', icon: Package },
  { id: 'flooring', name: 'Flooring', icon: Package },
  { id: 'hardware', name: 'Hardware & Fasteners', icon: Hammer },
]

const materials: Material[] = [
  // Framing Lumber
  { id: 'm1', name: '2x4x8 SPF Stud', category: 'framing', unit: 'each', altUnits: { bf: 0.19, lf: 0.48 }, prices: { gulf: { price: 3.85, trend: 'down', date: '2026-02-08' }, '84': { price: 4.12, trend: 'up', date: '2026-02-05' }, island: { price: 3.98, trend: 'down', date: '2026-02-07' }, builder: { price: 4.25, trend: 'stable', date: '2026-02-01' }, coastal: { price: 4.05, trend: 'down', date: '2026-02-06' }, hdpro: { price: 3.97, trend: 'down', date: '2026-02-10' } }, confidence: 96, dataPoints: 58 },
  { id: 'm2', name: '2x4x10 SPF #2', category: 'framing', unit: 'each', altUnits: { bf: 0.24, lf: 0.38 }, prices: { gulf: { price: 5.10, trend: 'down', date: '2026-02-08' }, '84': { price: 5.45, trend: 'up', date: '2026-02-04' }, island: { price: 5.28, trend: 'stable', date: '2026-02-06' }, coastal: { price: 5.35, trend: 'down', date: '2026-02-05' } }, confidence: 89, dataPoints: 34 },
  { id: 'm3', name: '2x6x8 SPF #2', category: 'framing', unit: 'each', altUnits: { bf: 0.28, lf: 0.72 }, prices: { gulf: { price: 5.95, trend: 'down', date: '2026-02-09' }, '84': { price: 6.28, trend: 'up', date: '2026-02-05' }, island: { price: 6.10, trend: 'down', date: '2026-02-07' }, builder: { price: 6.45, trend: 'stable', date: '2026-02-02' }, hdpro: { price: 6.15, trend: 'down', date: '2026-02-10' } }, confidence: 94, dataPoints: 47 },
  { id: 'm4', name: '2x6x12 SPF #2', category: 'framing', unit: 'each', altUnits: { bf: 0.42, lf: 0.48 }, prices: { gulf: { price: 9.20, trend: 'stable', date: '2026-02-08' }, '84': { price: 9.85, trend: 'up', date: '2026-02-04' }, island: { price: 9.45, trend: 'down', date: '2026-02-06' }, coastal: { price: 9.70, trend: 'up', date: '2026-02-05' } }, confidence: 87, dataPoints: 28 },
  { id: 'm5', name: '2x10x16 SPF #2', category: 'framing', unit: 'each', altUnits: { bf: 0.67, lf: 0.94 }, prices: { gulf: { price: 18.50, trend: 'up', date: '2026-02-07' }, '84': { price: 19.20, trend: 'up', date: '2026-02-05' }, island: { price: 18.90, trend: 'stable', date: '2026-02-06' } }, confidence: 78, dataPoints: 18 },
  { id: 'm6', name: '2x12x16 SPF #2', category: 'framing', unit: 'each', altUnits: { bf: 0.83, lf: 1.18 }, prices: { gulf: { price: 24.80, trend: 'up', date: '2026-02-07' }, '84': { price: 25.95, trend: 'up', date: '2026-02-03' }, island: { price: 25.10, trend: 'stable', date: '2026-02-06' } }, confidence: 72, dataPoints: 14 },
  { id: 'm7', name: 'LVL 1-3/4x9-1/2x20', category: 'framing', unit: 'each', prices: { gulf: { price: 68.50, trend: 'stable', date: '2026-02-05' }, '84': { price: 72.40, trend: 'up', date: '2026-02-02' }, builder: { price: 71.00, trend: 'stable', date: '2026-01-28' } }, confidence: 62, dataPoints: 9 },
  { id: 'm8', name: 'PT 4x4x8 Ground Contact', category: 'framing', unit: 'each', prices: { gulf: { price: 12.85, trend: 'down', date: '2026-02-08' }, '84': { price: 13.50, trend: 'stable', date: '2026-02-04' }, island: { price: 13.10, trend: 'down', date: '2026-02-06' }, hdpro: { price: 12.98, trend: 'down', date: '2026-02-10' } }, confidence: 91, dataPoints: 39 },
  // Sheet Goods
  { id: 'm9', name: '3/4" CDX Plywood (4x8)', category: 'sheet-goods', unit: 'sheet', altUnits: { sf: 0.016 }, prices: { gulf: { price: 52.40, trend: 'down', date: '2026-02-09' }, '84': { price: 55.80, trend: 'up', date: '2026-02-05' }, island: { price: 54.10, trend: 'down', date: '2026-02-07' }, coastal: { price: 53.50, trend: 'stable', date: '2026-02-06' }, hdpro: { price: 54.95, trend: 'down', date: '2026-02-10' } }, confidence: 92, dataPoints: 42 },
  { id: 'm10', name: '1/2" CDX Plywood (4x8)', category: 'sheet-goods', unit: 'sheet', altUnits: { sf: 0.013 }, prices: { gulf: { price: 38.20, trend: 'down', date: '2026-02-08' }, '84': { price: 40.50, trend: 'stable', date: '2026-02-05' }, island: { price: 39.40, trend: 'down', date: '2026-02-07' }, hdpro: { price: 39.85, trend: 'down', date: '2026-02-10' } }, confidence: 90, dataPoints: 38 },
  { id: 'm11', name: '7/16" OSB (4x8)', category: 'sheet-goods', unit: 'sheet', altUnits: { sf: 0.011 }, prices: { gulf: { price: 28.50, trend: 'down', date: '2026-02-09' }, '84': { price: 30.20, trend: 'up', date: '2026-02-04' }, coastal: { price: 29.10, trend: 'down', date: '2026-02-06' }, hdpro: { price: 29.75, trend: 'stable', date: '2026-02-10' } }, confidence: 88, dataPoints: 31 },
  { id: 'm12', name: '1/2" Drywall (4x12)', category: 'sheet-goods', unit: 'sheet', altUnits: { sf: 0.003 }, prices: { gulf: { price: 14.85, trend: 'up', date: '2026-02-08' }, builder: { price: 15.20, trend: 'up', date: '2026-02-04' }, coastal: { price: 14.50, trend: 'down', date: '2026-02-06' }, hdpro: { price: 15.10, trend: 'up', date: '2026-02-10' } }, confidence: 96, dataPoints: 62 },
  { id: 'm13', name: '5/8" Type X Drywall (4x12)', category: 'sheet-goods', unit: 'sheet', altUnits: { sf: 0.004 }, prices: { gulf: { price: 17.90, trend: 'up', date: '2026-02-08' }, builder: { price: 18.40, trend: 'up', date: '2026-02-04' }, coastal: { price: 17.60, trend: 'stable', date: '2026-02-06' } }, confidence: 85, dataPoints: 25 },
  // Roofing
  { id: 'm14', name: '30-Year Arch Shingles (GAF Timberline)', category: 'roofing', unit: 'square', altUnits: { bundle: 0.33 }, prices: { abc: { price: 139.00, trend: 'down', date: '2026-02-08' }, builder: { price: 148.00, trend: 'down', date: '2026-02-05' }, coastal: { price: 145.00, trend: 'down', date: '2026-02-06' }, hdpro: { price: 142.50, trend: 'down', date: '2026-02-10' } }, confidence: 88, dataPoints: 26 },
  { id: 'm15', name: 'Synthetic Underlayment (10 sq roll)', category: 'roofing', unit: 'roll', altUnits: { sf: 0.001 }, prices: { abc: { price: 165.00, trend: 'stable', date: '2026-02-07' }, builder: { price: 172.00, trend: 'up', date: '2026-02-04' }, coastal: { price: 168.00, trend: 'stable', date: '2026-02-06' } }, confidence: 79, dataPoints: 17 },
  { id: 'm16', name: 'Ice & Water Shield (2 sq roll)', category: 'roofing', unit: 'roll', prices: { abc: { price: 98.50, trend: 'up', date: '2026-02-07' }, builder: { price: 105.00, trend: 'up', date: '2026-02-03' }, hdpro: { price: 101.00, trend: 'up', date: '2026-02-10' } }, confidence: 74, dataPoints: 13 },
  { id: 'm17', name: 'Drip Edge (10\' white)', category: 'roofing', unit: 'each', prices: { abc: { price: 6.85, trend: 'stable', date: '2026-02-07' }, hdpro: { price: 7.20, trend: 'stable', date: '2026-02-10' }, coastal: { price: 7.05, trend: 'stable', date: '2026-02-06' } }, confidence: 82, dataPoints: 20 },
  // Concrete
  { id: 'm18', name: 'Concrete 4000 PSI', category: 'concrete', unit: 'CY', prices: { gulf: { price: 158.00, trend: 'up', date: '2026-02-09' }, builder: { price: 165.00, trend: 'up', date: '2026-02-05' }, coastal: { price: 172.00, trend: 'up', date: '2026-02-06' } }, confidence: 91, dataPoints: 35 },
  { id: 'm19', name: '#4 Rebar (20\' stick)', category: 'concrete', unit: 'each', prices: { gulf: { price: 12.40, trend: 'down', date: '2026-02-08' }, '84': { price: 13.10, trend: 'stable', date: '2026-02-05' }, hdpro: { price: 12.85, trend: 'down', date: '2026-02-10' } }, confidence: 83, dataPoints: 22 },
  { id: 'm20', name: 'Wire Mesh 6x6 W1.4 (5x150)', category: 'concrete', unit: 'roll', prices: { gulf: { price: 145.00, trend: 'stable', date: '2026-02-07' }, builder: { price: 152.00, trend: 'up', date: '2026-02-04' }, hdpro: { price: 148.00, trend: 'stable', date: '2026-02-10' } }, confidence: 76, dataPoints: 15 },
  // Insulation
  { id: 'm21', name: 'R-30 Fiberglass Batt (unfaced)', category: 'insulation', unit: 'sf', prices: { builder: { price: 1.12, trend: 'down', date: '2026-02-05' }, coastal: { price: 1.18, trend: 'down', date: '2026-02-06' }, hdpro: { price: 1.28, trend: 'up', date: '2026-02-10' } }, confidence: 87, dataPoints: 29 },
  { id: 'm22', name: 'R-19 Fiberglass Batt (kraft)', category: 'insulation', unit: 'sf', prices: { builder: { price: 0.78, trend: 'stable', date: '2026-02-05' }, coastal: { price: 0.82, trend: 'down', date: '2026-02-06' }, hdpro: { price: 0.85, trend: 'stable', date: '2026-02-10' } }, confidence: 84, dataPoints: 24 },
  { id: 'm23', name: '2" Rigid Foam XPS (4x8)', category: 'insulation', unit: 'sheet', altUnits: { sf: 0.01 }, prices: { builder: { price: 42.50, trend: 'up', date: '2026-02-04' }, coastal: { price: 40.80, trend: 'stable', date: '2026-02-06' }, hdpro: { price: 43.20, trend: 'up', date: '2026-02-10' } }, confidence: 75, dataPoints: 16 },
  // Siding & Trim
  { id: 'm24', name: 'Hardie Plank 8.25" (12\')', category: 'siding', unit: 'each', altUnits: { sf: 0.12, lf: 1.45 }, prices: { abc: { price: 17.40, trend: 'stable', date: '2026-02-07' }, builder: { price: 18.20, trend: 'up', date: '2026-02-04' }, hdpro: { price: 17.85, trend: 'stable', date: '2026-02-10' } }, confidence: 86, dataPoints: 27 },
  { id: 'm25', name: 'PVC Trim 1x4x18', category: 'siding', unit: 'each', altUnits: { lf: 0.72 }, prices: { gulf: { price: 12.95, trend: 'stable', date: '2026-02-08' }, abc: { price: 13.80, trend: 'up', date: '2026-02-07' }, builder: { price: 13.40, trend: 'stable', date: '2026-02-04' } }, confidence: 80, dataPoints: 19 },
  { id: 'm26', name: 'LP SmartSide 8" (16\')', category: 'siding', unit: 'each', altUnits: { sf: 0.09, lf: 1.08 }, prices: { '84': { price: 15.60, trend: 'down', date: '2026-02-05' }, builder: { price: 16.20, trend: 'stable', date: '2026-02-04' }, hdpro: { price: 15.95, trend: 'down', date: '2026-02-10' } }, confidence: 77, dataPoints: 16 },
  // Decking
  { id: 'm27', name: 'Trex Transcend 1x6x16 (Spiced Rum)', category: 'decking', unit: 'each', altUnits: { lf: 2.45, sf: 3.68 }, prices: { gulf: { price: 58.40, trend: 'stable', date: '2026-02-08' }, island: { price: 55.20, trend: 'down', date: '2026-02-07' }, advantage: { price: 52.80, trend: 'down', date: '2026-02-06' }, hdpro: { price: 56.90, trend: 'stable', date: '2026-02-10' } }, confidence: 82, dataPoints: 21 },
  { id: 'm28', name: 'Ipe 5/4x6x16', category: 'decking', unit: 'each', altUnits: { lf: 4.85, sf: 7.28 }, prices: { island: { price: 78.50, trend: 'up', date: '2026-02-07' }, advantage: { price: 68.20, trend: 'stable', date: '2026-02-06' }, gulf: { price: 85.40, trend: 'up', date: '2026-02-08' } }, confidence: 71, dataPoints: 12 },
  { id: 'm29', name: 'PT 5/4x6x16 (deck board)', category: 'decking', unit: 'each', altUnits: { lf: 0.95, sf: 1.42 }, prices: { gulf: { price: 15.20, trend: 'down', date: '2026-02-08' }, '84': { price: 16.10, trend: 'stable', date: '2026-02-05' }, island: { price: 15.60, trend: 'down', date: '2026-02-07' }, hdpro: { price: 15.85, trend: 'down', date: '2026-02-10' } }, confidence: 89, dataPoints: 33 },
  // Electrical
  { id: 'm30', name: '12/2 NM-B Romex (250\')', category: 'electrical', unit: 'roll', altUnits: { lf: 0.34 }, prices: { builder: { price: 84.50, trend: 'up', date: '2026-02-05' }, coastal: { price: 88.20, trend: 'up', date: '2026-02-06' }, hdpro: { price: 86.40, trend: 'up', date: '2026-02-10' } }, confidence: 90, dataPoints: 36 },
  { id: 'm31', name: '14/2 NM-B Romex (250\')', category: 'electrical', unit: 'roll', altUnits: { lf: 0.24 }, prices: { builder: { price: 62.80, trend: 'up', date: '2026-02-05' }, coastal: { price: 65.40, trend: 'up', date: '2026-02-06' }, hdpro: { price: 64.20, trend: 'up', date: '2026-02-10' } }, confidence: 88, dataPoints: 32 },
  { id: 'm32', name: '200A Main Breaker Panel', category: 'electrical', unit: 'each', prices: { builder: { price: 285.00, trend: 'stable', date: '2026-02-04' }, hdpro: { price: 298.00, trend: 'up', date: '2026-02-10' }, coastal: { price: 292.00, trend: 'stable', date: '2026-02-06' } }, confidence: 78, dataPoints: 18 },
  // Plumbing
  { id: 'm33', name: '3/4" PEX-A Tubing (100\')', category: 'plumbing', unit: 'roll', altUnits: { lf: 0.52 }, prices: { builder: { price: 52.40, trend: 'down', date: '2026-02-05' }, coastal: { price: 54.80, trend: 'stable', date: '2026-02-06' }, hdpro: { price: 55.20, trend: 'down', date: '2026-02-10' } }, confidence: 85, dataPoints: 26 },
  { id: 'm34', name: '4" PVC DWV Pipe (10\')', category: 'plumbing', unit: 'each', altUnits: { lf: 1.28 }, prices: { builder: { price: 12.80, trend: 'stable', date: '2026-02-05' }, coastal: { price: 13.40, trend: 'up', date: '2026-02-06' }, hdpro: { price: 13.10, trend: 'stable', date: '2026-02-10' } }, confidence: 83, dataPoints: 23 },
  // Windows & Doors
  { id: 'm35', name: 'Andersen 100 Series DH 36x60', category: 'windows', unit: 'each', prices: { abc: { price: 385.00, trend: 'stable', date: '2026-02-07' }, builder: { price: 398.00, trend: 'up', date: '2026-02-04' }, hdpro: { price: 392.00, trend: 'stable', date: '2026-02-10' } }, confidence: 73, dataPoints: 11 },
  { id: 'm36', name: 'Therma-Tru Entry Door (fiberglass)', category: 'windows', unit: 'each', prices: { abc: { price: 820.00, trend: 'stable', date: '2026-02-07' }, builder: { price: 875.00, trend: 'up', date: '2026-02-03' }, hdpro: { price: 845.00, trend: 'stable', date: '2026-02-10' } }, confidence: 68, dataPoints: 8 },
  // Flooring
  { id: 'm37', name: 'LVP Click-Lock 7" Wide (COREtec)', category: 'flooring', unit: 'sf', prices: { builder: { price: 4.85, trend: 'down', date: '2026-02-05' }, coastal: { price: 5.10, trend: 'stable', date: '2026-02-06' }, hdpro: { price: 4.98, trend: 'down', date: '2026-02-10' } }, confidence: 81, dataPoints: 20 },
  { id: 'm38', name: '3/4" Red Oak Hardwood (select)', category: 'flooring', unit: 'sf', prices: { gulf: { price: 6.45, trend: 'up', date: '2026-02-08' }, island: { price: 6.80, trend: 'up', date: '2026-02-07' }, builder: { price: 6.95, trend: 'up', date: '2026-02-04' } }, confidence: 76, dataPoints: 15 },
  // Hardware
  { id: 'm39', name: '16d Framing Nails (50 lb box)', category: 'hardware', unit: 'box', prices: { gulf: { price: 58.50, trend: 'stable', date: '2026-02-08' }, '84': { price: 62.40, trend: 'up', date: '2026-02-05' }, hdpro: { price: 60.20, trend: 'stable', date: '2026-02-10' } }, confidence: 88, dataPoints: 30 },
  { id: 'm40', name: 'Simpson Strong-Tie A35', category: 'hardware', unit: 'each', prices: { gulf: { price: 2.15, trend: 'stable', date: '2026-02-08' }, builder: { price: 2.35, trend: 'stable', date: '2026-02-04' }, hdpro: { price: 2.28, trend: 'stable', date: '2026-02-10' } }, confidence: 84, dataPoints: 24 },
]

const laborSubs: LaborSub[] = [
  // Electrical
  { id: 's1', name: 'Sparks Electric', trade: 'electrical', pricePerSf: 8.50, qualityRating: 5, scheduleRating: 4, communicationRating: 5, callbacks: 0, jobsCompleted: 12, valueScore: 92, availability: 'Available Mar', lastQuoteDate: '2026-01-28' },
  { id: 's2', name: 'Gulf Coast Electrical', trade: 'electrical', pricePerSf: 7.20, qualityRating: 3, scheduleRating: 3, communicationRating: 4, callbacks: 3, jobsCompleted: 8, valueScore: 68, availability: 'Available Now', lastQuoteDate: '2026-02-05' },
  { id: 's3', name: 'A+ Electric', trade: 'electrical', pricePerSf: 9.10, qualityRating: 5, scheduleRating: 5, communicationRating: 5, callbacks: 0, jobsCompleted: 6, valueScore: 88, availability: 'Booked to Apr', lastQuoteDate: '2026-02-01' },
  // Plumbing
  { id: 's4', name: 'Bayshore Plumbing', trade: 'plumbing', pricePerSf: 6.80, qualityRating: 4, scheduleRating: 4, communicationRating: 4, callbacks: 1, jobsCompleted: 15, valueScore: 85, availability: 'Available Now', lastQuoteDate: '2026-02-03' },
  { id: 's5', name: 'Island Plumbing', trade: 'plumbing', pricePerSf: 7.40, qualityRating: 5, scheduleRating: 5, communicationRating: 5, callbacks: 0, jobsCompleted: 9, valueScore: 90, availability: 'Available Mar', lastQuoteDate: '2026-01-30' },
  { id: 's6', name: 'Budget Plumbing', trade: 'plumbing', pricePerSf: 5.90, qualityRating: 2, scheduleRating: 2, communicationRating: 3, callbacks: 5, jobsCompleted: 4, valueScore: 45, availability: 'Available Now', lastQuoteDate: '2026-02-07' },
  // Framing
  { id: 's7', name: 'Coastal Framing', trade: 'framing', pricePerSf: 12.50, qualityRating: 4, scheduleRating: 5, communicationRating: 4, callbacks: 0, jobsCompleted: 18, valueScore: 91, availability: 'Available Now', lastQuoteDate: '2026-02-06' },
  { id: 's8', name: 'Elite Framing', trade: 'framing', pricePerSf: 14.80, qualityRating: 5, scheduleRating: 5, communicationRating: 5, callbacks: 0, jobsCompleted: 11, valueScore: 87, availability: 'Booked to Mar', lastQuoteDate: '2026-02-01' },
  { id: 's9', name: 'QuickFrame LLC', trade: 'framing', pricePerSf: 10.90, qualityRating: 3, scheduleRating: 2, communicationRating: 2, callbacks: 2, jobsCompleted: 6, valueScore: 52, availability: 'Available Now', lastQuoteDate: '2026-02-08' },
  // HVAC
  { id: 's10', name: 'CoolAir HVAC', trade: 'hvac', pricePerSf: 9.80, qualityRating: 5, scheduleRating: 4, communicationRating: 5, callbacks: 0, jobsCompleted: 10, valueScore: 89, availability: 'Available Feb', lastQuoteDate: '2026-02-04' },
  { id: 's11', name: 'Gulf Mechanical', trade: 'hvac', pricePerSf: 8.50, qualityRating: 4, scheduleRating: 3, communicationRating: 3, callbacks: 1, jobsCompleted: 7, valueScore: 74, availability: 'Available Now', lastQuoteDate: '2026-02-06' },
  // Roofing
  { id: 's12', name: 'Top Notch Roofing', trade: 'roofing', pricePerSf: 4.20, qualityRating: 5, scheduleRating: 4, communicationRating: 4, callbacks: 0, jobsCompleted: 14, valueScore: 93, availability: 'Available Now', lastQuoteDate: '2026-02-05' },
  { id: 's13', name: 'Sunshine Roofing', trade: 'roofing', pricePerSf: 3.60, qualityRating: 3, scheduleRating: 3, communicationRating: 3, callbacks: 2, jobsCompleted: 5, valueScore: 61, availability: 'Available Now', lastQuoteDate: '2026-02-08' },
  // Drywall
  { id: 's14', name: 'Precision Drywall', trade: 'drywall', pricePerSf: 2.85, qualityRating: 5, scheduleRating: 5, communicationRating: 4, callbacks: 0, jobsCompleted: 16, valueScore: 95, availability: 'Booked to Mar', lastQuoteDate: '2026-02-02' },
  { id: 's15', name: 'FastWall Inc', trade: 'drywall', pricePerSf: 2.40, qualityRating: 3, scheduleRating: 4, communicationRating: 3, callbacks: 1, jobsCompleted: 9, valueScore: 72, availability: 'Available Now', lastQuoteDate: '2026-02-07' },
  // Painting
  { id: 's16', name: 'Pro Finish Painting', trade: 'painting', pricePerSf: 3.10, qualityRating: 5, scheduleRating: 5, communicationRating: 5, callbacks: 0, jobsCompleted: 13, valueScore: 94, availability: 'Available Mar', lastQuoteDate: '2026-02-03' },
  { id: 's17', name: 'A1 Painters', trade: 'painting', pricePerSf: 2.50, qualityRating: 3, scheduleRating: 3, communicationRating: 4, callbacks: 1, jobsCompleted: 7, valueScore: 65, availability: 'Available Now', lastQuoteDate: '2026-02-06' },
]

const anomalies: Anomaly[] = [
  { id: 'a1', material: '12/2 NM-B Romex', vendor: 'Coastal Supply', severity: 'alert', message: 'Copper wire up 18% in 30 days. Consider locking orders for active jobs.', deviation: 18, date: '2026-02-10' },
  { id: 'a2', material: '4" PVC DWV Pipe', vendor: 'Coastal Supply', severity: 'warning', message: 'Vendor charging 22% above your 6-month average. 3 other vendors have lower pricing.', deviation: 22, date: '2026-02-09' },
  { id: 'a3', material: 'Concrete 4000 PSI', vendor: 'All vendors', severity: 'warning', message: 'All vendors trending up — seasonal demand increase. Budget impact: +$3,200 on active jobs.', deviation: 12, date: '2026-02-08' },
  { id: 'a4', material: 'Ipe 5/4x6x16', vendor: 'Gulf Lumber', severity: 'alert', message: 'Gulf charging $85.40 vs Advantage at $68.20. Potential savings of $1,720 on Molinari job.', deviation: 25, date: '2026-02-08' },
  { id: 'a5', material: '3/4" Red Oak Hardwood', vendor: 'All vendors', severity: 'info', message: 'Hardwood prices up 8% this quarter. Trend expected to continue into Q2.', deviation: 8, date: '2026-02-07' },
  { id: 'a6', material: 'R-30 Fiberglass Batt', vendor: 'HD Pro', severity: 'info', message: 'HD Pro pricing 14% above BuilderFirst. Consider switching for insulation purchases.', deviation: 14, date: '2026-02-06' },
]

const savingsData: SavingsItem[] = [
  { job: 'Smith Residence', category: 'Framing Lumber', actualSpend: 42500, optimalSpend: 39200, savings: 3300, vendor: 'Gulf Lumber' },
  { job: 'Smith Residence', category: 'Roofing', actualSpend: 18400, optimalSpend: 17100, savings: 1300, vendor: 'ABC Supply' },
  { job: 'Johnson Remodel', category: 'Electrical', actualSpend: 12800, optimalSpend: 11200, savings: 1600, vendor: 'BuilderFirst' },
  { job: 'Johnson Remodel', category: 'Plumbing', actualSpend: 8900, optimalSpend: 8200, savings: 700, vendor: 'Coastal Supply' },
  { job: 'Molinari Custom', category: 'Decking', actualSpend: 22347, optimalSpend: 13758, savings: 8589, vendor: 'Kimal → Advantage' },
  { job: 'Molinari Custom', category: 'Windows', actualSpend: 34200, optimalSpend: 32800, savings: 1400, vendor: 'ABC Supply' },
  { job: 'Harbor View #4', category: 'Concrete', actualSpend: 28500, optimalSpend: 27100, savings: 1400, vendor: 'Gulf' },
  { job: 'Harbor View #4', category: 'Framing Lumber', actualSpend: 38200, optimalSpend: 35400, savings: 2800, vendor: 'Gulf Lumber' },
]

const vendorSpend = [
  { vendor: 'Gulf Lumber', totalSpend: 284500, jobCount: 8, topCategory: 'Framing', avgSavings: 4.2, trend: 'stable' as Trend },
  { vendor: 'BuilderFirst Supply', totalSpend: 198200, jobCount: 7, topCategory: 'Electrical', avgSavings: 2.8, trend: 'up' as Trend },
  { vendor: 'Coastal Supply Co', totalSpend: 142800, jobCount: 6, topCategory: 'Plumbing', avgSavings: 1.5, trend: 'up' as Trend },
  { vendor: 'ABC Supply', totalSpend: 118400, jobCount: 5, topCategory: 'Roofing', avgSavings: 5.1, trend: 'down' as Trend },
  { vendor: '84 Lumber', totalSpend: 95600, jobCount: 4, topCategory: 'Framing', avgSavings: -1.2, trend: 'up' as Trend },
  { vendor: 'HD Pro', totalSpend: 82100, jobCount: 6, topCategory: 'Hardware', avgSavings: 0.8, trend: 'stable' as Trend },
  { vendor: 'Island Lumber', totalSpend: 68900, jobCount: 3, topCategory: 'Decking', avgSavings: 3.4, trend: 'down' as Trend },
  { vendor: 'Advantage Lumber', totalSpend: 45200, jobCount: 2, topCategory: 'Decking', avgSavings: 8.2, trend: 'stable' as Trend },
]

const laborTrades = ['electrical', 'plumbing', 'framing', 'hvac', 'roofing', 'drywall', 'painting']

// ── Helpers ──────────────────────────────────────────────────

function getConfidenceLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Strong', color: 'text-green-700 bg-green-100' }
  if (score >= 50) return { label: 'Moderate', color: 'text-blue-700 bg-blue-100' }
  if (score >= 25) return { label: 'Weak', color: 'text-amber-700 bg-amber-100' }
  return { label: 'Very Weak', color: 'text-red-700 bg-red-100' }
}

function getConfidenceBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 50) return 'bg-blue-500'
  if (score >= 25) return 'bg-amber-500'
  return 'bg-red-500'
}

function getBestPrice(prices: Record<string, VendorPrice>): { vendorId: string; price: number } | null {
  let best: { vendorId: string; price: number } | null = null
  for (const [vendorId, vp] of Object.entries(prices)) {
    if (!best || vp.price < best.price) {
      best = { vendorId, price: vp.price }
    }
  }
  return best
}

function TrendIcon({ trend, className }: { trend: Trend; className?: string }) {
  if (trend === 'up') return <ArrowUp className={cn('h-3 w-3 text-red-500', className)} />
  if (trend === 'down') return <ArrowDown className={cn('h-3 w-3 text-green-500', className)} />
  return <Minus className={cn('h-3 w-3 text-gray-400', className)} />
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn('h-3 w-3', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300')} />
      ))}
    </div>
  )
}

function ValueScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? 'bg-green-100 text-green-800' : score >= 70 ? 'bg-blue-100 text-blue-800' : score >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', color)}>{score}</span>
}

// ── Main Component ───────────────────────────────────────────

type Tab = 'materials' | 'labor' | 'savings' | 'analytics' | 'alerts' | 'quotes'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'materials', label: 'Materials', icon: Package },
  { id: 'labor', label: 'Labor', icon: Hammer },
  { id: 'savings', label: 'Savings', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'quotes', label: 'Quotes & Rate Sheets', icon: FileText },
]

export function PriceIntelligencePreview() {
  const [activeTab, setActiveTab] = useState<Tab>('materials')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Price Intelligence</h1>
            <p className="text-sm text-muted-foreground">Compare prices, track savings, detect anomalies across vendors</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="h-3.5 w-3.5 text-green-600" />Savings YTD</div>
          <div className="text-xl font-bold mt-1">$47,280</div>
          <div className="text-xs text-green-600">8.2% below market avg</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" />Missed Savings</div>
          <div className="text-xl font-bold mt-1">$12,450</div>
          <div className="text-xs text-amber-600">3 POs above best price</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="h-3.5 w-3.5 text-blue-600" />Materials Tracked</div>
          <div className="text-xl font-bold mt-1">248</div>
          <div className="text-xs text-muted-foreground">Across 12 categories</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5 text-purple-600" />Active Vendors</div>
          <div className="text-xl font-bold mt-1">14</div>
          <div className="text-xs text-muted-foreground">8 with rate sheets</div>
        </div>
        <div className="bg-card border rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-green-600" />Avg Confidence</div>
          <div className="text-xl font-bold mt-1">84%</div>
          <div className="text-xs text-muted-foreground">Based on 1,247 data points</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'alerts' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">{anomalies.filter(a => a.severity !== 'info').length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'materials' && <MaterialsTab />}
      {activeTab === 'labor' && <LaborTab />}
      {activeTab === 'savings' && <SavingsTab />}
      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'alerts' && <AlertsTab />}
      {activeTab === 'quotes' && <QuotesTab />}

      {/* AI Features Panel */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg px-4 py-4">
        <AIFeaturesPanel
          title="Price Intelligence AI Features"
          features={[
            {
              feature: 'Market Rate Tracking',
              trigger: 'Real-time',
              insight: 'Continuously monitors material and labor prices across vendors and market sources to maintain up-to-date pricing intelligence.',
              severity: 'info' as const,
              confidence: 94,
              detail: 'Tracking 248 materials across 14 vendors with 1,247 data points collected this quarter.',
            },
            {
              feature: 'Price Alerts',
              trigger: 'On change',
              insight: 'Notifies you of significant price changes, anomalies, or opportunities to save by switching vendors.',
              severity: 'warning' as const,
              confidence: 91,
              detail: '3 active alerts requiring attention. Price swings over 15% trigger immediate notifications.',
            },
            {
              feature: 'Vendor Comparison',
              trigger: 'On submission',
              insight: 'Automatically compares vendor pricing for each material, highlighting best prices and value opportunities.',
              severity: 'success' as const,
              confidence: 96,
              detail: 'Best vendor recommendations generated for all 248 tracked materials with confidence scores.',
            },
            {
              feature: 'Cost Forecasting',
              trigger: 'Weekly',
              insight: 'Predicts future material and labor prices based on historical trends, market indicators, and seasonal patterns.',
              severity: 'info' as const,
              confidence: 78,
              detail: 'Lumber prices projected to decrease 3-5% over next 60 days based on supply chain indicators.',
            },
            {
              feature: 'Negotiation Insights',
              trigger: 'On change',
              insight: 'Suggests negotiation points and leverage opportunities based on vendor pricing history and market conditions.',
              severity: 'success' as const,
              confidence: 85,
              detail: 'Gulf Lumber prices 8% above market average on sheet goods - opportunity for rate sheet renegotiation.',
            },
          ]}
          columns={2}
        />
      </div>
    </div>
  )
}

// ── Materials Tab ────────────────────────────────────────────

function MaterialsTab() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [unitMode, setUnitMode] = useState<'default' | 'sf' | 'lf' | 'bf'>('default')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(categories.map(c => c.id)))

  const filteredMaterials = useMemo(() => {
    let filtered = materials
    if (selectedCategory) filtered = filtered.filter(m => m.category === selectedCategory)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
    }
    return filtered
  }, [selectedCategory, search])

  const grouped = useMemo(() => {
    const map = new Map<string, Material[]>()
    for (const m of filteredMaterials) {
      const list = map.get(m.category) || []
      list.push(m)
      map.set(m.category, list)
    }
    return map
  }, [filteredMaterials])

  // Get all vendors that appear in current filtered materials
  const activeVendors = useMemo(() => {
    const ids = new Set<string>()
    for (const m of filteredMaterials) {
      for (const vid of Object.keys(m.prices)) ids.add(vid)
    }
    return vendors.filter(v => ids.has(v.id))
  }, [filteredMaterials])

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-lg"
          />
        </div>
        <select
          value={unitMode}
          onChange={e => setUnitMode(e.target.value as typeof unitMode)}
          className="text-sm border rounded-lg px-2 py-1.5"
        >
          <option value="default">Default Units</option>
          <option value="sf">Per SF</option>
          <option value="lf">Per LF</option>
          <option value="bf">Per BF</option>
        </select>
        <div className="text-xs text-muted-foreground">
          {filteredMaterials.length} materials &middot; {activeVendors.length} vendors
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-2.5 py-1 text-xs rounded-full border transition-colors',
            !selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-accent'
          )}
        >
          All ({materials.length})
        </button>
        {categories.map(cat => {
          const count = materials.filter(m => m.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={cn(
                'px-2.5 py-1 text-xs rounded-full border transition-colors',
                selectedCategory === cat.id ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              {cat.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Material Tables by Category */}
      <div className="space-y-2">
        {Array.from(grouped.entries()).map(([catId, mats]) => {
          const cat = categories.find(c => c.id === catId)
          if (!cat) return null
          const isExpanded = expandedCategories.has(catId)
          // Vendors for this category
          const catVendorIds = new Set<string>()
          for (const m of mats) {
            for (const vid of Object.keys(m.prices)) catVendorIds.add(vid)
          }
          const catVendors = vendors.filter(v => catVendorIds.has(v.id))

          return (
            <div key={catId} className="bg-card border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(catId)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <cat.icon className="h-4 w-4 text-muted-foreground" />
                {cat.name}
                <span className="text-xs font-normal text-muted-foreground">({mats.length} items &middot; {catVendors.length} vendors)</span>
              </button>
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground sticky left-0 bg-muted/50 min-w-[200px]">Material</th>
                        <th className="text-center py-2 px-4 font-medium text-muted-foreground w-16">Unit</th>
                        {catVendors.map(v => (
                          <th key={v.id} className="text-center py-2 px-4 font-medium text-muted-foreground min-w-[100px]">{v.short}</th>
                        ))}
                        <th className="text-center py-2 px-4 font-medium text-muted-foreground w-20">Best</th>
                        <th className="text-center py-2 px-4 font-medium text-muted-foreground w-28">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mats.map(mat => {
                        const best = getBestPrice(mat.prices)
                        const displayUnit = unitMode !== 'default' && mat.altUnits?.[unitMode] ? unitMode : mat.unit
                        const convFactor = unitMode !== 'default' && mat.altUnits?.[unitMode] ? mat.altUnits[unitMode] : 1
                        const conf = getConfidenceLabel(mat.confidence)
                        return (
                          <tr key={mat.id} className="hover:bg-muted/30">
                            <td className="py-2 px-4 font-medium sticky left-0 bg-card">{mat.name}</td>
                            <td className="py-2 px-4 text-center text-muted-foreground text-xs">/{displayUnit}</td>
                            {catVendors.map(v => {
                              const vp = mat.prices[v.id]
                              if (!vp) return <td key={v.id} className="py-2 px-4 text-center text-muted-foreground">—</td>
                              const displayPrice = convFactor !== 1 ? vp.price * convFactor : vp.price
                              const isBest = best && v.id === best.vendorId
                              return (
                                <td key={v.id} className="py-2 px-4 text-center">
                                  <span className={cn('font-medium', isBest && 'text-green-600')}>
                                    ${displayPrice < 1 ? displayPrice.toFixed(3) : displayPrice.toFixed(2)}
                                  </span>
                                  <TrendIcon trend={vp.trend} className="inline ml-1" />
                                </td>
                              )
                            })}
                            <td className="py-2 px-4 text-center">
                              {best && (
                                <span className="font-semibold text-green-600">
                                  ${(convFactor !== 1 ? best.price * convFactor : best.price) < 1
                                    ? (convFactor !== 1 ? best.price * convFactor : best.price).toFixed(3)
                                    : (convFactor !== 1 ? best.price * convFactor : best.price).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className={cn('h-full rounded-full', getConfidenceBarColor(mat.confidence))} style={{ width: `${mat.confidence}%` }} />
                                </div>
                                <span className={cn('text-xs px-1 rounded', conf.color)}>{mat.confidence}</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Labor Tab ────────────────────────────────────────────────

function LaborTab() {
  const [selectedTrade, setSelectedTrade] = useState('electrical')

  const tradeSubs = useMemo(() =>
    laborSubs.filter(s => s.trade === selectedTrade).sort((a, b) => b.valueScore - a.valueScore),
    [selectedTrade]
  )

  const tradeStats = useMemo(() => {
    if (tradeSubs.length === 0) return null
    const prices = tradeSubs.map(s => s.pricePerSf)
    return {
      low: Math.min(...prices),
      high: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      count: tradeSubs.length,
    }
  }, [tradeSubs])

  return (
    <div className="space-y-4">
      {/* Trade Selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Trade:</span>
        <div className="flex flex-wrap gap-1.5">
          {laborTrades.map(trade => (
            <button
              key={trade}
              onClick={() => setSelectedTrade(trade)}
              className={cn(
                'px-3 py-1 text-sm rounded-full border capitalize transition-colors',
                selectedTrade === trade ? 'bg-primary text-primary-foreground border-primary' : 'text-muted-foreground hover:bg-accent'
              )}
            >
              {trade}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Sub Comparison Table */}
        <div className="col-span-2 bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold capitalize">{selectedTrade} Subcontractors</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ranked by value score (price + quality + reliability)</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Subcontractor</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">$/SF</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Quality</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Schedule</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Callbacks</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Jobs</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Value</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tradeSubs.map((sub, i) => (
                <tr key={sub.id} className={cn('hover:bg-muted/30', i === 0 && 'bg-green-50/50')}>
                  <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                  <td className="py-2.5 px-4">
                    <div className="font-medium">{sub.name}</div>
                    {i === 0 && <div className="text-xs text-green-600 flex items-center gap-1"><Award className="h-3 w-3" /> Recommended</div>}
                  </td>
                  <td className="py-2.5 px-4 text-center font-medium">${sub.pricePerSf.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-center"><StarRating rating={sub.qualityRating} /></td>
                  <td className="py-2.5 px-4 text-center"><StarRating rating={sub.scheduleRating} /></td>
                  <td className="py-2.5 px-4 text-center">
                    {sub.callbacks === 0
                      ? <span className="text-green-600 text-xs">None</span>
                      : <span className="text-red-600 text-xs font-medium">{sub.callbacks}</span>
                    }
                  </td>
                  <td className="py-2.5 px-4 text-center text-muted-foreground">{sub.jobsCompleted}</td>
                  <td className="py-2.5 px-4 text-center"><ValueScoreBadge score={sub.valueScore} /></td>
                  <td className="py-2.5 px-4 text-xs">{sub.availability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Market Stats Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold capitalize mb-3">Market Stats: {selectedTrade}</h3>
            {tradeStats && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Low</span>
                  <span className="font-medium text-green-600">${tradeStats.low.toFixed(2)}/sf</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Average</span>
                  <span className="font-medium">${tradeStats.avg.toFixed(2)}/sf</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Median</span>
                  <span className="font-medium">${tradeStats.median.toFixed(2)}/sf</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">High</span>
                  <span className="font-medium text-red-600">${tradeStats.high.toFixed(2)}/sf</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Data Points</span>
                  <span className="font-medium">{tradeStats.count} subs</span>
                </div>
                {/* Visual range bar */}
                <div className="mt-2">
                  <div className="text-xs text-muted-foreground mb-1">Price Range</div>
                  <div className="relative h-6 bg-gradient-to-r from-green-100 via-blue-100 to-red-100 rounded-full">
                    {tradeSubs.map(sub => {
                      const pct = tradeStats.high !== tradeStats.low
                        ? ((sub.pricePerSf - tradeStats.low) / (tradeStats.high - tradeStats.low)) * 100
                        : 50
                      return (
                        <div
                          key={sub.id}
                          className="absolute top-0.5 w-5 h-5 rounded-full bg-white border-2 border-primary flex items-center justify-center text-[8px] font-bold"
                          style={{ left: `calc(${pct}% - 10px)` }}
                          title={`${sub.name}: $${sub.pricePerSf}/sf`}
                        >
                          {sub.name.charAt(0)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scope Checklist */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Typical Scope: {selectedTrade}</h3>
            <div className="space-y-1.5 text-xs">
              <div className="font-medium text-green-700">Usually Included:</div>
              {selectedTrade === 'electrical' && ['Labor (rough & trim)', 'Wire & conduit', 'Devices & plates', 'Panel installation', 'Final connections'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500" />{item}</div>
              ))}
              {selectedTrade === 'plumbing' && ['Labor (rough & trim)', 'Pipe & fittings (PEX/PVC)', 'Fixture installation', 'Water heater hookup', 'Gas line rough-in'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500" />{item}</div>
              ))}
              {selectedTrade === 'framing' && ['Labor', 'Framing lumber', 'Hardware & connectors', 'Sheathing', 'Cleanup'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500" />{item}</div>
              ))}
              {!['electrical', 'plumbing', 'framing'].includes(selectedTrade) && ['Labor', 'Standard materials', 'Cleanup'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-muted-foreground"><CheckCircle className="h-3 w-3 text-green-500" />{item}</div>
              ))}
              <div className="font-medium text-red-700 mt-2">Usually Excluded:</div>
              {['Permits & fees', 'Fixtures (supplied by owner)', 'Trenching / excavation'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-muted-foreground"><XCircle className="h-3 w-3 text-red-400" />{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Savings Tab ──────────────────────────────────────────────

function SavingsTab() {
  const totalSavings = savingsData.reduce((sum, s) => sum + s.savings, 0)
  const totalSpend = savingsData.reduce((sum, s) => sum + s.actualSpend, 0)
  const savingsRate = ((totalSavings / totalSpend) * 100)
  const missedSavings = savingsData.filter(s => s.savings > 2000)

  return (
    <div className="space-y-4">
      {/* Savings KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-700">Realized Savings YTD</div>
          <div className="text-2xl font-bold text-green-800 mt-1">{formatCurrency(totalSavings)}</div>
          <div className="text-xs text-green-600 mt-1">{savingsRate.toFixed(1)}% of total spend</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm text-amber-700">Missed Savings</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{formatCurrency(missedSavings.reduce((s, i) => s + i.savings, 0))}</div>
          <div className="text-xs text-amber-600 mt-1">{missedSavings.length} opportunities identified</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Total Material Spend</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(totalSpend)}</div>
          <div className="text-xs text-muted-foreground mt-1">Across {new Set(savingsData.map(s => s.job)).size} jobs</div>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Optimal Spend</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(savingsData.reduce((s, i) => s + i.optimalSpend, 0))}</div>
          <div className="text-xs text-green-600 mt-1">If best prices were used every time</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Savings by Job */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Savings by Job</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Job</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Spend</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Optimal</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from(new Set(savingsData.map(s => s.job))).map(job => {
                const items = savingsData.filter(s => s.job === job)
                const spend = items.reduce((s, i) => s + i.actualSpend, 0)
                const optimal = items.reduce((s, i) => s + i.optimalSpend, 0)
                const saved = items.reduce((s, i) => s + i.savings, 0)
                return (
                  <tr key={job} className="hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-medium">{job}</td>
                    <td className="py-2.5 px-4 text-right">{formatCurrency(spend)}</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{formatCurrency(optimal)}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={cn('font-medium', saved > 3000 ? 'text-amber-600' : 'text-green-600')}>
                        {formatCurrency(saved)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Top Missed Savings */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Top Missed Savings</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Largest opportunities where a better price was available</p>
          </div>
          <div className="divide-y">
            {savingsData
              .sort((a, b) => b.savings - a.savings)
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} className="p-3 hover:bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{item.category}</div>
                      <div className="text-xs text-muted-foreground">{item.job} &middot; {item.vendor}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-amber-600">{formatCurrency(item.savings)}</div>
                      <div className="text-xs text-muted-foreground">
                        {((item.savings / item.actualSpend) * 100).toFixed(0)}% over optimal
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium text-green-800">Savings Intelligence</div>
            <p className="text-sm text-green-700 mt-1">The Molinari Ipe decking order accounted for 40% of all missed savings. Switching to Advantage Lumber for exotic hardwoods would save an estimated $8,500+ per job. Your Gulf Lumber relationship delivers consistent 4.2% savings on framing — consider consolidating more framing purchases with them.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Analytics Tab ────────────────────────────────────────────

function AnalyticsTab() {
  const totalSpend = vendorSpend.reduce((s, v) => s + v.totalSpend, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Vendor Spend Ranking */}
        <div className="col-span-2 bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Vendor Spend Ranking</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Annual spend with year-over-year comparison</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Vendor</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Total Spend</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">% of Total</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Jobs</th>
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Top Category</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Avg Savings</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendorSpend.map((v, i) => {
                const pct = (v.totalSpend / totalSpend) * 100
                return (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="py-2.5 px-4 font-medium">{v.vendor}</td>
                    <td className="py-2.5 px-4 text-right font-medium">{formatCurrency(v.totalSpend)}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-8">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center text-muted-foreground">{v.jobCount}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{v.topCategory}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={cn('text-xs font-medium', v.avgSavings > 0 ? 'text-green-600' : 'text-red-600')}>
                        {v.avgSavings > 0 ? '+' : ''}{v.avgSavings.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center"><TrendIcon trend={v.trend} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Spend Concentration */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Spend Concentration</h3>
            <div className="space-y-2">
              {vendorSpend.slice(0, 5).map((v, i) => {
                const pct = (v.totalSpend / totalSpend) * 100
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="truncate">{v.vendor}</span>
                      <span className="font-medium">${(v.totalSpend / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Top 3 vendors = {((vendorSpend.slice(0, 3).reduce((s, v) => s + v.totalSpend, 0) / totalSpend) * 100).toFixed(0)}% of total spend
              </div>
            </div>
          </div>

          {/* Negotiation Insights */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" /> Negotiation Insights
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-purple-800">Gulf Lumber</div>
                <div className="text-purple-700 mt-0.5">$284K annual spend. Request: 3-5% volume discount, Net 45 terms, free delivery on orders &gt;$2K.</div>
              </div>
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-purple-800">84 Lumber</div>
                <div className="text-purple-700 mt-0.5">Pricing 8% above Gulf on framing. Use Gulf quotes as leverage for price matching.</div>
              </div>
              <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-purple-800">Advantage Lumber</div>
                <div className="text-purple-700 mt-0.5">Best exotic decking prices. Consider exclusive decking vendor agreement for 5-8% additional discount.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Section */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Cost Escalation Forecast</h3>
        <p className="text-xs text-muted-foreground mb-3">Projected material cost changes over the next 6 months based on historical trends</p>
        <div className="grid grid-cols-4 gap-4">
          {[
            { category: 'Framing Lumber', current: '$5.42/bf avg', forecast: '-3.2%', direction: 'down' as Trend, confidence: 82 },
            { category: 'Copper (Wire)', current: '$4.12/lb avg', forecast: '+12.5%', direction: 'up' as Trend, confidence: 76 },
            { category: 'Concrete', current: '$162/CY avg', forecast: '+6.8%', direction: 'up' as Trend, confidence: 88 },
            { category: 'Roofing', current: '$142/sq avg', forecast: '-1.4%', direction: 'down' as Trend, confidence: 71 },
          ].map((item, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="text-sm font-medium">{item.category}</div>
              <div className="text-xs text-muted-foreground">{item.current}</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendIcon trend={item.direction} />
                <span className={cn('text-sm font-semibold', item.direction === 'up' ? 'text-red-600' : 'text-green-600')}>{item.forecast}</span>
                <span className="text-xs text-muted-foreground ml-auto">{item.confidence}% conf</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Alerts Tab ───────────────────────────────────────────────

function AlertsTab() {
  const severityOrder: Record<Severity, number> = { alert: 0, warning: 1, info: 2 }
  const sorted = [...anomalies].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-red-700"><AlertTriangle className="h-4 w-4" />Critical Alerts</div>
          <div className="text-2xl font-bold text-red-800 mt-1">{anomalies.filter(a => a.severity === 'alert').length}</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-amber-700"><AlertTriangle className="h-4 w-4" />Warnings</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{anomalies.filter(a => a.severity === 'warning').length}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-700"><Info className="h-4 w-4" />Info</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{anomalies.filter(a => a.severity === 'info').length}</div>
        </div>
      </div>

      {/* Anomaly List */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Price Anomalies</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Prices that deviate significantly from historical averages</p>
        </div>
        <div className="divide-y">
          {sorted.map(anomaly => (
            <div key={anomaly.id} className="p-4 hover:bg-muted/30">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'mt-0.5 p-1 rounded',
                  anomaly.severity === 'alert' ? 'bg-red-100' : anomaly.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                )}>
                  <AlertTriangle className={cn(
                    'h-4 w-4',
                    anomaly.severity === 'alert' ? 'text-red-600' : anomaly.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{anomaly.material}</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-medium',
                      anomaly.severity === 'alert' ? 'bg-red-100 text-red-700' : anomaly.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {anomaly.severity === 'alert' ? 'ALERT' : anomaly.severity === 'warning' ? 'WARNING' : 'INFO'} &middot; +{anomaly.deviation}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">{anomaly.vendor}</div>
                  <div className="text-sm mt-1">{anomaly.message}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-xs px-2.5 py-1 border rounded-lg hover:bg-accent">Dismiss</button>
                  <button className="text-xs px-2.5 py-1 bg-primary text-primary-foreground rounded-lg hover:opacity-90">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PO Budget Gate Preview */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-semibold mb-2">PO Budget Gate</h3>
        <p className="text-xs text-muted-foreground mb-3">When a PO is created, prices and budget are automatically checked</p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm font-semibold text-amber-800 mb-2">PO REVIEW REQUIRED — Molinari Custom</div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-red-700">OVER BUDGET: Decking (6100)</span>
                <div className="text-xs text-red-600">Budget: $14,850 | Committed: $11,200 | This Order: $8,500 | Over by: $4,850 (33%)</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-green-700">BETTER PRICE AVAILABLE: Ipe 5/4x6</span>
                <div className="text-xs text-green-600">Kimal: $7.89/LF → Advantage: $4.85/LF (Save $1,520)</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg">Switch Vendor</button>
            <button className="text-xs px-3 py-1.5 border rounded-lg">Override with Reason</button>
            <button className="text-xs px-3 py-1.5 border rounded-lg text-muted-foreground">Cancel PO</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Quotes Tab ───────────────────────────────────────────────

function QuotesTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Quote Upload */}
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Upload Vendor Quote</h3>
          <p className="text-xs text-muted-foreground mb-3">Upload PDF, Excel, or CSV quotes. AI will extract line items and match to your material catalog.</p>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Drag &amp; drop quote files or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, Excel, CSV supported</p>
          </div>
          <div className="mt-3">
            <label className="text-xs font-medium">Vendor</label>
            <select className="w-full mt-1 text-sm border rounded-lg px-2 py-1.5">
              <option>Select vendor...</option>
              {vendors.map(v => <option key={v.id}>{v.name}</option>)}
            </select>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Recent Quotes</h3>
          </div>
          <div className="divide-y">
            {[
              { vendor: 'Gulf Lumber', date: '2026-02-08', items: 42, status: 'completed', filename: 'gulf_q1_2026.pdf' },
              { vendor: 'ABC Supply', date: '2026-02-05', items: 28, status: 'completed', filename: 'abc_roofing_quote.pdf' },
              { vendor: 'BuilderFirst', date: '2026-02-03', items: 0, status: 'processing', filename: 'bf_electrical_q1.xlsx' },
              { vendor: 'Coastal Supply', date: '2026-01-28', items: 35, status: 'completed', filename: 'coastal_plumbing.csv' },
              { vendor: 'Island Lumber', date: '2026-01-20', items: 18, status: 'completed', filename: 'island_decking.pdf' },
            ].map((quote, i) => (
              <div key={i} className="p-3 hover:bg-muted/30 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{quote.vendor}</div>
                  <div className="text-xs text-muted-foreground truncate">{quote.filename}</div>
                </div>
                <div className="text-right shrink-0">
                  {quote.status === 'completed' ? (
                    <span className="text-xs text-green-600">{quote.items} items extracted</span>
                  ) : (
                    <span className="text-xs text-blue-600 flex items-center gap-1"><Clock className="h-3 w-3" />Processing...</span>
                  )}
                  <div className="text-xs text-muted-foreground">{quote.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Item Review Queue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Items extracted from quotes that need human confirmation</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-2 px-4 font-medium text-muted-foreground">Vendor Description</th>
              <th className="text-left py-2 px-4 font-medium text-muted-foreground">AI Suggestion</th>
              <th className="text-center py-2 px-4 font-medium text-muted-foreground">Confidence</th>
              <th className="text-left py-2 px-4 font-medium text-muted-foreground">Source</th>
              <th className="text-center py-2 px-4 font-medium text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { raw: 'AZEK TIMBERTECH COMPOSITE 1X6X20 MAHOGANY', suggestion: 'TimberTech Composite 1x6x20 Mahogany', confidence: 72, source: 'Gulf Lumber Q1' },
              { raw: '3/4 T&G ADV PLYWOOD 4X8', suggestion: '3/4" Tongue & Groove Advantech (4x8)', confidence: 65, source: 'Gulf Lumber Q1' },
              { raw: 'CERTAINTEED LANDMARK PRO MOIRE BLK', suggestion: 'CertainTeed Landmark Pro Shingles (Moire Black)', confidence: 58, source: 'ABC Roofing Quote' },
              { raw: 'PELLA 250 SERIES DH 3060', suggestion: null, confidence: 0, source: 'BuilderFirst Q1' },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="py-2.5 px-4 font-mono text-xs">{item.raw}</td>
                <td className="py-2.5 px-4">
                  {item.suggestion
                    ? <span className="text-sm">{item.suggestion}</span>
                    : <span className="text-xs text-amber-600 italic">No match — create new item?</span>
                  }
                </td>
                <td className="py-2.5 px-4 text-center">
                  {item.confidence > 0 ? (
                    <span className={cn('text-xs px-1.5 py-0.5 rounded', getConfidenceLabel(item.confidence).color)}>
                      {item.confidence}%
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2.5 px-4 text-xs text-muted-foreground">{item.source}</td>
                <td className="py-2.5 px-4 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    {item.suggestion && <button className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Confirm</button>}
                    <button className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      {item.suggestion ? 'Edit' : 'Create New'}
                    </button>
                    <button className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Skip</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rate Sheets */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Vendor Rate Sheets</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-negotiated pricing agreements</p>
          </div>
          <button className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg">+ Add Rate Sheet</button>
        </div>
        <div className="divide-y">
          {[
            { vendor: 'Gulf Lumber', items: 186, updated: '2026-01-15', expires: '2026-06-30', status: 'Active' },
            { vendor: 'ABC Supply', items: 94, updated: '2026-01-20', expires: '2026-12-31', status: 'Active' },
            { vendor: 'BuilderFirst', items: 142, updated: '2025-12-01', expires: '2026-03-31', status: 'Expiring Soon' },
            { vendor: 'Coastal Supply', items: 78, updated: '2025-11-15', expires: '2026-05-31', status: 'Active' },
          ].map((rs, i) => (
            <div key={i} className="p-3 hover:bg-muted/30 flex items-center gap-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium">{rs.vendor}</div>
                <div className="text-xs text-muted-foreground">{rs.items} items &middot; Updated {rs.updated}</div>
              </div>
              <div className="text-right">
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  rs.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                )}>
                  {rs.status}
                </span>
                <div className="text-xs text-muted-foreground mt-0.5">Expires {rs.expires}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
