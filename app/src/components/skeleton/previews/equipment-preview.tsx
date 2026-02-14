'use client'

import { useState } from 'react'
import {
  Plus,
  Sparkles,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  MapPin,
  User,
  MoreHorizontal,
  Calendar,
  DollarSign,
  QrCode,
  Settings,
  PenTool,
  Gauge,
  Navigation,
  Shield,
  FileText,
  Link2,
  Package,
  ShieldAlert,
  CircleDollarSign,
  ChevronRight,
  X,
  Download,
  Printer,
  Image,
  ChevronLeft,
  Clock,
  Camera,
  AlertCircle,
  MapPinned,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel, SubmissionForm, type FormField } from '@/components/skeleton/ui'

// ── Types ───────────────────────────────────────────────────────────────

interface Equipment {
  id: string
  name: string
  assetTag: string
  category: 'Vehicle' | 'Heavy Equipment' | 'Power Tool' | 'Hand Tool' | 'Safety'
  make: string
  model: string
  serialNumber: string
  year: number
  status: 'available' | 'deployed' | 'maintenance' | 'repair' | 'retired' | 'lost_stolen'
  currentJob?: string
  assignedTo?: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  salvageValue: number
  depreciationMethod: 'straight_line' | 'macrs' | 'declining_balance'
  usefulLifeYears: number
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNote?: string
  usage?: string
  utilizationRate?: number
  costPerHour?: number
  isRental: boolean
  rentalVendor?: string
  rentalRate?: string
  rentalExpectedReturn?: string
  rentalDailyRate?: number
  rentalStartDate?: string
  gpsEnabled: boolean
  gpsLastLocation?: string
  geofenceStatus?: 'inside' | 'outside' | 'no_geofence'
  geofenceAlertTime?: string
  checkoutStatus?: 'checked_out' | 'available' | 'overdue'
  checkedOutBy?: string
  checkoutDate?: string
  expectedReturnDate?: string
  hourMeterReading?: number
  maintenanceDueHours?: number
  aiNote?: string
  photoUrls?: string[]
  checklistCompleted?: boolean
  checklistCompletedDate?: string
}

interface MaintenanceLog {
  id: string
  equipmentName: string
  assetTag: string
  maintenanceType: 'preventive' | 'corrective' | 'inspection' | 'calibration'
  description: string
  performedDate: string
  performedBy: string
  serviceProvider: string
  partsCost: number
  laborCost: number
  totalCost: number
  hoursAtService?: number
  nextDueDate?: string
  nextDueHours?: number
}

interface RentalEquipment {
  id: string
  description: string
  vendor: string
  project: string
  rentalRate: string
  ratePeriod: 'daily' | 'weekly' | 'monthly'
  startDate: string
  expectedReturnDate: string
  deliveryFee: number
  totalCostToDate: number
  status: 'active' | 'pending_return' | 'returned' | 'overdue'
  poNumber?: string
  daysRented: number
}

interface MaintenanceChecklist {
  id: string
  item: string
  completed: boolean
}

interface CategoryChecklists {
  'Heavy Equipment': MaintenanceChecklist[]
  'Vehicle': MaintenanceChecklist[]
  'Power Tool': MaintenanceChecklist[]
}

// ── Mock Data ───────────────────────────────────────────────────────────

const maintenanceChecklists: CategoryChecklists = {
  'Heavy Equipment': [
    { id: 'he1', item: 'Check hydraulic fluid levels', completed: false },
    { id: 'he2', item: 'Inspect tracks/tires for wear', completed: false },
    { id: 'he3', item: 'Test all controls and levers', completed: false },
    { id: 'he4', item: 'Verify safety features (ROPS, lights, alarms)', completed: false },
    { id: 'he5', item: 'Check engine oil and coolant', completed: false },
    { id: 'he6', item: 'Inspect belts and hoses', completed: false },
  ],
  'Vehicle': [
    { id: 'v1', item: 'Check tire pressure and condition', completed: false },
    { id: 'v2', item: 'Verify all lights functioning', completed: false },
    { id: 'v3', item: 'Test brakes and emergency brake', completed: false },
    { id: 'v4', item: 'Check fluid levels (oil, coolant, brake)', completed: false },
    { id: 'v5', item: 'Inspect mirrors and windshield', completed: false },
    { id: 'v6', item: 'Test horn and wipers', completed: false },
    { id: 'v7', item: 'Check seatbelts and safety equipment', completed: false },
  ],
  'Power Tool': [
    { id: 'pt1', item: 'Inspect power cord/battery', completed: false },
    { id: 'pt2', item: 'Check blade/bit condition', completed: false },
    { id: 'pt3', item: 'Verify safety guards in place', completed: false },
    { id: 'pt4', item: 'Test trigger and controls', completed: false },
    { id: 'pt5', item: 'Clean air vents and filters', completed: false },
  ],
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: '2023 Ford F-250',
    assetTag: 'ROSS-01',
    category: 'Vehicle',
    make: 'Ford',
    model: 'F-250 Super Duty',
    serialNumber: '1FT7W2B69PEA12345',
    year: 2023,
    status: 'deployed',
    currentJob: 'Smith Residence',
    assignedTo: 'Mike Rodriguez',
    purchaseDate: '2023-01-01',
    purchasePrice: 65000,
    currentValue: 55000,
    salvageValue: 15000,
    depreciationMethod: 'macrs',
    usefulLifeYears: 5,
    lastMaintenance: '2026-01-15',
    nextMaintenance: '2026-02-15',
    usage: '12,450 miles',
    utilizationRate: 92,
    costPerHour: 18.50,
    isRental: false,
    gpsEnabled: true,
    gpsLastLocation: '1234 Oak St, Charleston SC',
    geofenceStatus: 'inside',
    photoUrls: [
      '/equipment/ford-f250-1.jpg',
      '/equipment/ford-f250-2.jpg',
      '/equipment/ford-f250-3.jpg',
    ],
    checklistCompleted: true,
    checklistCompletedDate: '2026-02-12',
  },
  {
    id: '2',
    name: '2022 Ford Transit',
    assetTag: 'ROSS-02',
    category: 'Vehicle',
    make: 'Ford',
    model: 'Transit 250',
    serialNumber: '1FTBW2CM3NKB67890',
    year: 2022,
    status: 'deployed',
    currentJob: 'Johnson Beach House',
    assignedTo: 'Carlos Mendez',
    purchaseDate: '2022-03-01',
    purchasePrice: 45000,
    currentValue: 35000,
    salvageValue: 10000,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 7,
    lastMaintenance: '2025-12-20',
    nextMaintenance: '2026-01-20',
    usage: '28,200 miles',
    utilizationRate: 88,
    costPerHour: 14.20,
    isRental: false,
    gpsEnabled: true,
    gpsLastLocation: '3421 Surf Dr, Folly Beach SC',
    geofenceStatus: 'inside',
    photoUrls: [
      '/equipment/ford-transit-1.jpg',
      '/equipment/ford-transit-2.jpg',
    ],
    checklistCompleted: false,
  },
  {
    id: '3',
    name: 'Bobcat S650 Skid Steer',
    assetTag: 'ROSS-10',
    category: 'Heavy Equipment',
    make: 'Bobcat',
    model: 'S650',
    serialNumber: 'B3NZ16789',
    year: 2021,
    status: 'available',
    purchaseDate: '2021-06-01',
    purchasePrice: 52000,
    currentValue: 38000,
    salvageValue: 12000,
    depreciationMethod: 'macrs',
    usefulLifeYears: 7,
    lastMaintenance: '2026-01-05',
    nextMaintenance: 'In ~50 hours',
    maintenanceNote: 'Preventive maintenance due in 50 operating hours',
    usage: '850 hours',
    hourMeterReading: 850,
    maintenanceDueHours: 900,
    utilizationRate: 40,
    costPerHour: 32.50,
    isRental: false,
    gpsEnabled: true,
    gpsLastLocation: 'Equipment Yard, Main Office',
    geofenceStatus: 'inside',
    aiNote: 'At 40% utilization rate. You spent $14,200 on rentals for skid steers in 12 months. Consider cost analysis: own vs rent.',
    photoUrls: [
      '/equipment/bobcat-s650-1.jpg',
      '/equipment/bobcat-s650-2.jpg',
      '/equipment/bobcat-s650-3.jpg',
    ],
    checklistCompleted: true,
    checklistCompletedDate: '2026-02-10',
  },
  {
    id: '4',
    name: 'Cat 303 Mini Excavator',
    assetTag: 'ROSS-11',
    category: 'Heavy Equipment',
    make: 'Caterpillar',
    model: '303 CR',
    serialNumber: 'CAT0303CR456',
    year: 2022,
    status: 'deployed',
    currentJob: 'Harbor View Custom Home',
    assignedTo: 'Tom Williams',
    purchaseDate: '2022-08-01',
    purchasePrice: 68000,
    currentValue: 52000,
    salvageValue: 18000,
    depreciationMethod: 'macrs',
    usefulLifeYears: 7,
    lastMaintenance: '2026-02-01',
    usage: '620 hours',
    hourMeterReading: 620,
    utilizationRate: 72,
    costPerHour: 28.00,
    isRental: false,
    gpsEnabled: true,
    gpsLastLocation: '5678 Beach Rd, Mount Pleasant SC',
    geofenceStatus: 'outside',
    geofenceAlertTime: '2026-02-08 11:47 PM',
    photoUrls: [
      '/equipment/cat-303-1.jpg',
      '/equipment/cat-303-2.jpg',
    ],
    checklistCompleted: false,
  },
  {
    id: '5',
    name: 'Generator 7500W',
    assetTag: 'ROSS-20',
    category: 'Heavy Equipment',
    make: 'Honda',
    model: 'EU7000iS',
    serialNumber: 'HONDA7K-2020-001',
    year: 2020,
    status: 'maintenance',
    purchaseDate: '2020-04-01',
    purchasePrice: 4500,
    currentValue: 2800,
    salvageValue: 500,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 10,
    lastMaintenance: '2026-01-25',
    maintenanceNote: 'Oil change and filter replacement in progress. Expected completion: tomorrow.',
    usage: '500 hours',
    hourMeterReading: 500,
    utilizationRate: 35,
    costPerHour: 8.50,
    isRental: false,
    gpsEnabled: false,
    photoUrls: [
      '/equipment/honda-generator-1.jpg',
    ],
  },
  {
    id: '6',
    name: 'DeWalt Laser Level',
    assetTag: 'TOOL-045',
    category: 'Power Tool',
    make: 'DeWalt',
    model: 'DW089K',
    serialNumber: 'DW089K-23-045',
    year: 2023,
    status: 'deployed',
    currentJob: 'Smith Residence',
    assignedTo: 'Mike Rodriguez',
    purchaseDate: '2023-09-01',
    purchasePrice: 450,
    currentValue: 350,
    salvageValue: 50,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 5,
    isRental: false,
    gpsEnabled: false,
    checkoutStatus: 'checked_out',
    checkedOutBy: 'Mike Rodriguez',
    checkoutDate: '2026-01-15',
    expectedReturnDate: '2026-02-20',
    aiNote: 'Checked out 4 weeks ago. Approaching expected return date. Confirm still needed at Smith job.',
    photoUrls: [
      '/equipment/dewalt-laser-1.jpg',
    ],
  },
  {
    id: '7',
    name: 'Milwaukee M18 Drill Kit',
    assetTag: 'TOOL-052',
    category: 'Power Tool',
    make: 'Milwaukee',
    model: 'M18 Fuel',
    serialNumber: 'MIL-M18F-052',
    year: 2023,
    status: 'available',
    purchaseDate: '2023-11-01',
    purchasePrice: 380,
    currentValue: 300,
    salvageValue: 50,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 5,
    isRental: false,
    gpsEnabled: false,
    checkoutStatus: 'available',
    photoUrls: [
      '/equipment/milwaukee-drill-1.jpg',
      '/equipment/milwaukee-drill-2.jpg',
    ],
  },
  {
    id: '8',
    name: 'Dewalt Table Saw',
    assetTag: 'TOOL-030',
    category: 'Power Tool',
    make: 'DeWalt',
    model: 'DWE7491RS',
    serialNumber: 'DWE7491-22-030',
    year: 2022,
    status: 'deployed',
    currentJob: 'Johnson Beach House',
    assignedTo: 'Carlos Mendez',
    purchaseDate: '2022-02-01',
    purchasePrice: 650,
    currentValue: 450,
    salvageValue: 100,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 7,
    isRental: false,
    gpsEnabled: false,
    checkoutStatus: 'checked_out',
    checkedOutBy: 'Carlos Mendez',
    checkoutDate: '2026-02-03',
    photoUrls: [
      '/equipment/dewalt-tablesaw-1.jpg',
    ],
  },
  {
    id: '9',
    name: 'Hilti TE 60 Hammer Drill (Rental)',
    assetTag: 'RENT-001',
    category: 'Power Tool',
    make: 'Hilti',
    model: 'TE 60-ATC',
    serialNumber: 'N/A - Rental',
    year: 2024,
    status: 'deployed',
    currentJob: 'Harbor View Custom Home',
    assignedTo: 'Tom Williams',
    purchaseDate: 'N/A',
    purchasePrice: 0,
    currentValue: 0,
    salvageValue: 0,
    depreciationMethod: 'straight_line',
    usefulLifeYears: 0,
    isRental: true,
    rentalVendor: 'Sunbelt Rentals',
    rentalRate: '$85/day',
    rentalExpectedReturn: '2026-02-15',
    rentalDailyRate: 85,
    rentalStartDate: '2026-02-05',
    gpsEnabled: false,
  },
]

const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: '1',
    equipmentName: '2023 Ford F-250',
    assetTag: 'ROSS-01',
    maintenanceType: 'preventive',
    description: 'Oil change, tire rotation, brake inspection',
    performedDate: '2026-01-15',
    performedBy: 'Internal',
    serviceProvider: 'Ross Fleet Maintenance',
    partsCost: 85,
    laborCost: 120,
    totalCost: 205,
    hoursAtService: undefined,
    nextDueDate: '2026-04-15',
  },
  {
    id: '2',
    equipmentName: 'Bobcat S650 Skid Steer',
    assetTag: 'ROSS-10',
    maintenanceType: 'preventive',
    description: 'Hydraulic fluid change, filter replacement, track tension',
    performedDate: '2026-01-05',
    performedBy: 'Bobcat Dealer',
    serviceProvider: 'Bobcat of Charleston',
    partsCost: 340,
    laborCost: 280,
    totalCost: 620,
    hoursAtService: 800,
    nextDueHours: 900,
  },
  {
    id: '3',
    equipmentName: 'Generator 7500W',
    assetTag: 'ROSS-20',
    maintenanceType: 'corrective',
    description: 'Oil change and filter replacement - running rough at idle',
    performedDate: '2026-02-11',
    performedBy: 'Internal',
    serviceProvider: 'Ross Equipment Shop',
    partsCost: 45,
    laborCost: 60,
    totalCost: 105,
    hoursAtService: 500,
  },
]

const mockRentals: RentalEquipment[] = [
  {
    id: '1',
    description: 'Hilti TE 60 Hammer Drill',
    vendor: 'Sunbelt Rentals',
    project: 'Harbor View Custom Home',
    rentalRate: '$85',
    ratePeriod: 'daily',
    startDate: '2026-02-05',
    expectedReturnDate: '2026-02-15',
    deliveryFee: 0,
    totalCostToDate: 595,
    status: 'active',
    poNumber: 'PO-2026-0145',
    daysRented: 7,
  },
  {
    id: '2',
    description: 'Concrete Pump Truck',
    vendor: 'United Rentals',
    project: 'Harbor View Custom Home',
    rentalRate: '$1,800',
    ratePeriod: 'daily',
    startDate: '2026-02-08',
    expectedReturnDate: '2026-02-09',
    deliveryFee: 350,
    totalCostToDate: 3950,
    status: 'returned',
    poNumber: 'PO-2026-0148',
    daysRented: 2,
  },
  {
    id: '3',
    description: 'Scissor Lift 26ft',
    vendor: 'Sunbelt Rentals',
    project: 'Smith Residence',
    rentalRate: '$450',
    ratePeriod: 'weekly',
    startDate: '2026-01-20',
    expectedReturnDate: '2026-02-03',
    deliveryFee: 150,
    totalCostToDate: 1050,
    status: 'overdue',
    poNumber: 'PO-2026-0132',
    daysRented: 23,
  },
]

const statusConfig: Record<Equipment['status'], { label: string; color: string; icon: React.ElementType }> = {
  available: { label: 'Available', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  deployed: { label: 'Deployed', color: 'bg-blue-100 text-blue-700', icon: MapPin },
  maintenance: { label: 'Maintenance', color: 'bg-amber-100 text-amber-700', icon: Wrench },
  repair: { label: 'Repair', color: 'bg-orange-100 text-orange-700', icon: Settings },
  retired: { label: 'Retired', color: 'bg-gray-100 text-gray-500', icon: Settings },
  lost_stolen: { label: 'Lost/Stolen', color: 'bg-red-100 text-red-700', icon: ShieldAlert },
}

const categoryConfig: Record<Equipment['category'], { icon: React.ElementType; color: string; bg: string }> = {
  Vehicle: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Heavy Equipment': { icon: Settings, color: 'text-amber-600', bg: 'bg-amber-100' },
  'Power Tool': { icon: PenTool, color: 'text-purple-600', bg: 'bg-purple-100' },
  'Hand Tool': { icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-100' },
  Safety: { icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
}

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K'
  return '$' + value.toFixed(0)
}

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function isMaintenanceOverdue(nextMaintenance?: string): boolean {
  if (!nextMaintenance || !/^\d{4}-\d{2}-\d{2}$/.test(nextMaintenance)) return false
  return getDaysUntil(nextMaintenance) < 0
}

function getOverdueDays(nextMaintenance?: string): number {
  if (!nextMaintenance || !/^\d{4}-\d{2}-\d{2}$/.test(nextMaintenance)) return 0
  const days = getDaysUntil(nextMaintenance)
  return days < 0 ? Math.abs(days) : 0
}

// ── QR Code Component ───────────────────────────────────────────────────

function QRCodeSVG({ data, size = 120 }: { data: string; size?: number }) {
  // Simple QR-like pattern generator (visual placeholder)
  const cellSize = size / 25
  const cells: boolean[][] = []

  // Generate pattern based on data hash
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data.charCodeAt(i)
    hash = hash & hash
  }

  for (let row = 0; row < 25; row++) {
    cells[row] = []
    for (let col = 0; col < 25; col++) {
      // Position detection patterns (corners)
      const isTopLeft = row < 7 && col < 7
      const isTopRight = row < 7 && col > 17
      const isBottomLeft = row > 17 && col < 7

      if (isTopLeft || isTopRight || isBottomLeft) {
        // Create finder pattern
        const isOuter = row === 0 || row === 6 || col === 0 || col === 6 ||
                       (isTopRight && (col === 18 || col === 24)) ||
                       (isBottomLeft && (row === 18 || row === 24))
        const isInner = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
                       (isTopRight && row >= 2 && row <= 4 && col >= 20 && col <= 22) ||
                       (isBottomLeft && row >= 20 && row <= 22 && col >= 2 && col <= 4)
        cells[row][col] = isOuter || isInner
      } else {
        // Data area - pseudo-random based on position and hash
        cells[row][col] = ((hash + row * 31 + col * 17) % 3) === 0
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {cells.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          cell ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cellSize}
              y={rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  )
}

// ── QR Code Modal ───────────────────────────────────────────────────────

function QRCodeModal({
  equipment,
  isOpen,
  onClose
}: {
  equipment: Equipment
  isOpen: boolean
  onClose: () => void
}) {
  if (!isOpen) return null

  const qrData = JSON.stringify({
    id: equipment.id,
    assetTag: equipment.assetTag,
    name: equipment.name,
    serialNumber: equipment.serialNumber,
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Equipment QR Code</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="border-2 border-gray-200 p-4 rounded-lg mb-4">
            <QRCodeSVG data={qrData} size={160} />
          </div>

          <div className="text-center mb-4">
            <div className="font-medium text-gray-900">{equipment.name}</div>
            <div className="text-sm text-gray-500 font-mono">{equipment.assetTag}</div>
            <div className="text-xs text-gray-400 mt-1">SN: {equipment.serialNumber}</div>
          </div>

          <div className="flex gap-2 w-full">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Printer className="h-4 w-4" />
              Print QR
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Photo Gallery Modal ─────────────────────────────────────────────────

function PhotoGalleryModal({
  photos,
  equipmentName,
  isOpen,
  onClose,
  initialIndex = 0,
}: {
  photos: string[]
  equipmentName: string
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen || photos.length === 0) return null

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % photos.length)
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
            {/* Placeholder for actual image */}
            <div className="text-center">
              <Image className="h-16 w-16 text-gray-600 mx-auto mb-2" />
              <div className="text-gray-400 text-sm">{photos[currentIndex]}</div>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div className="p-4">
            <div className="text-white font-medium">{equipmentName}</div>
            <div className="text-gray-400 text-sm">
              Photo {currentIndex + 1} of {photos.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Maintenance Checklist Modal ─────────────────────────────────────────

function ChecklistModal({
  equipment,
  isOpen,
  onClose,
}: {
  equipment: Equipment
  isOpen: boolean
  onClose: () => void
}) {
  const categoryKey = equipment.category as keyof CategoryChecklists
  const checklist = maintenanceChecklists[categoryKey] || maintenanceChecklists['Power Tool']
  const [items, setItems] = useState(checklist.map(item => ({ ...item })))

  if (!isOpen) return null

  const completedCount = items.filter(i => i.completed).length
  const allCompleted = completedCount === items.length

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Maintenance Checklist</h3>
            <p className="text-sm text-gray-500">{equipment.name}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className={cn(
              "font-medium",
              allCompleted ? "text-green-600" : "text-amber-600"
            )}>
              {completedCount} / {items.length} complete
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                allCompleted ? "bg-green-500" : "bg-amber-500"
              )}
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {items.map(item => (
            <label
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                item.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-200 hover:bg-gray-100"
              )}
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className={cn(
                "text-sm",
                item.completed ? "text-green-700 line-through" : "text-gray-700"
              )}>
                {item.item}
              </span>
            </label>
          ))}
        </div>

        <button
          className={cn(
            "w-full py-2 rounded-lg font-medium transition-colors",
            allCompleted
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
          disabled={!allCompleted}
        >
          {allCompleted ? "Complete Checklist" : `Complete ${items.length - completedCount} more items`}
        </button>
      </div>
    </div>
  )
}

// ── Breakdown Report Modal ──────────────────────────────────────────────

function BreakdownModal({
  equipment,
  isOpen,
  onClose,
}: {
  equipment: Equipment
  isOpen: boolean
  onClose: () => void
}) {
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const breakdownFields: FormField[] = [
    {
      id: 'issueDescription',
      label: 'Issue Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the breakdown or malfunction...',
    },
    {
      id: 'photos',
      label: 'Photos',
      type: 'file',
      placeholder: 'Upload photos of the issue',
    },
    {
      id: 'urgency',
      label: 'Urgency Level',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: 'Low - Can continue work' },
        { value: 'medium', label: 'Medium - Partial impact' },
        { value: 'high', label: 'High - Work stopped' },
        { value: 'critical', label: 'Critical - Safety concern' },
      ],
    },
  ]

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Report Equipment Breakdown</h3>
            <p className="text-sm text-gray-500">{equipment.name} ({equipment.assetTag})</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {!submitted ? (
          <>
            <SubmissionForm
              isOpen={true}
              onClose={onClose}
              title="Report Breakdown"
              fields={breakdownFields}
              submitLabel="Report Breakdown"
              onSubmit={handleSubmit}
            />

            {/* AI Suggestion */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-800">AI Suggestion: Available Alternatives</div>
                  <ul className="mt-1 text-sm text-blue-700 space-y-1">
                    <li>- Bobcat S650 (in yard, available immediately)</li>
                    <li>- Rental: Sunbelt has Cat 303 ($450/day, 2hr delivery)</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">Breakdown Reported</h4>
            <p className="text-sm text-gray-500 mb-4">
              Maintenance team has been notified. Estimated response: 2 hours.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────

function EquipmentCard({ equipment }: { equipment: Equipment }) {
  const statusCfg = statusConfig[equipment.status]
  const categoryCfg = categoryConfig[equipment.category]
  const StatusIcon = statusCfg.icon
  const CategoryIcon = categoryCfg.icon

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [checklistModalOpen, setChecklistModalOpen] = useState(false)
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false)
  const [inlineChecklistOpen, setInlineChecklistOpen] = useState(false)

  // Inline checklist state
  const categoryKey2 = equipment.category as keyof CategoryChecklists
  const inlineChecklist = maintenanceChecklists[categoryKey2]
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (!inlineChecklist) return {}
    // If checklist was previously completed, mark all as checked
    if (equipment.checklistCompleted) {
      return Object.fromEntries(inlineChecklist.map(item => [item.id, true]))
    }
    return {}
  })

  const toggleCheckedItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Calculate maintenance overdue
  const maintenanceOverdue = isMaintenanceOverdue(equipment.nextMaintenance)
  const overdueDays = getOverdueDays(equipment.nextMaintenance)

  // Calculate rental return info
  const rentalDaysUntilReturn = equipment.isRental && equipment.rentalExpectedReturn
    ? getDaysUntil(equipment.rentalExpectedReturn)
    : null
  const rentalOverdue = rentalDaysUntilReturn !== null && rentalDaysUntilReturn < 0
  const rentalSoonDue = rentalDaysUntilReturn !== null && rentalDaysUntilReturn >= 0 && rentalDaysUntilReturn <= 3

  // Calculate rental cost accumulating
  const rentalCostAccumulated = equipment.isRental && equipment.rentalDailyRate && equipment.rentalStartDate
    ? (() => {
        const start = new Date(equipment.rentalStartDate + 'T00:00:00')
        const today = new Date()
        const days = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        return days * equipment.rentalDailyRate
      })()
    : 0

  // Get checklist for this equipment type
  const categoryKey = equipment.category as keyof CategoryChecklists
  const hasChecklist = categoryKey in maintenanceChecklists

  const openPhoto = (index: number) => {
    setPhotoIndex(index)
    setPhotoModalOpen(true)
  }

  return (
    <>
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
        equipment.status === 'maintenance' && "border-amber-200",
        equipment.status === 'repair' && "border-orange-200",
        equipment.status === 'lost_stolen' && "border-red-300 bg-red-50",
        equipment.geofenceStatus === 'outside' && "border-red-300"
      )}>
        {/* Overdue Maintenance Alert */}
        {maintenanceOverdue && (
          <div className="mb-3 -mt-1 -mx-1 px-3 py-2 bg-red-100 border border-red-200 rounded-t-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700">OVERDUE</span>
            <span className="text-sm text-red-600">{overdueDays} days overdue</span>
          </div>
        )}

        {/* Geofence Alert */}
        {equipment.geofenceStatus === 'outside' && (
          <div className="mb-3 -mt-1 -mx-1 px-3 py-2 bg-red-50 border border-red-200 rounded-t-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Outside designated area</span>
            </div>
            {equipment.geofenceAlertTime && (
              <div className="text-xs text-red-600 mt-1 ml-6">
                Since {equipment.geofenceAlertTime}
              </div>
            )}
            <button className="mt-2 ml-6 flex items-center gap-1 text-xs text-red-700 hover:text-red-800 font-medium">
              <MapPinned className="h-3 w-3" />
              View on Map
            </button>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", categoryCfg.bg)}>
              <CategoryIcon className={cn("h-5 w-5", categoryCfg.color)} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {equipment.name}
                {equipment.isRental && (
                  <span className="ml-1.5 text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">Rental</span>
                )}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                <span className="font-mono">{equipment.assetTag}</span>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-500 transition-colors"
                  title={`QR Code: ${equipment.assetTag}`}
                >
                  <QrCode className="h-3 w-3" />
                  <span className="text-[10px] font-medium">QR</span>
                </button>
                {equipment.serialNumber && equipment.serialNumber !== 'N/A - Rental' && (
                  <span className="text-xs text-gray-400">SN: {equipment.serialNumber.slice(0, 10)}...</span>
                )}
              </div>
            </div>
          </div>
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreHorizontal className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Photo Gallery Thumbnails */}
        {equipment.photoUrls && equipment.photoUrls.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            {equipment.photoUrls.slice(0, 3).map((photo, idx) => (
              <button
                key={idx}
                onClick={() => openPhoto(idx)}
                className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center hover:border-blue-400 hover:bg-gray-50 transition-colors"
                title={photo.split('/').pop()}
              >
                <Camera className="h-4 w-4 text-gray-400" />
              </button>
            ))}
            {equipment.photoUrls.length > 3 && (
              <button
                onClick={() => openPhoto(3)}
                className="w-10 h-10 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-500 hover:border-blue-400 hover:bg-gray-50 transition-colors"
              >
                +{equipment.photoUrls.length - 3}
              </button>
            )}
            <span className="text-[10px] text-gray-400 ml-1">{equipment.photoUrls.length} photo{equipment.photoUrls.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-3">
          {equipment.make} {equipment.model} ({equipment.year})
        </div>

        {equipment.currentJob && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{equipment.currentJob}</span>
          </div>
        )}

        {equipment.assignedTo && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{equipment.assignedTo}</span>
          </div>
        )}

        {equipment.usage && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <Gauge className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700">{equipment.usage}</span>
            {equipment.utilizationRate !== undefined && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded font-medium",
                equipment.utilizationRate >= 70 ? "bg-green-100 text-green-700" :
                equipment.utilizationRate >= 40 ? "bg-amber-100 text-amber-700" :
                "bg-red-100 text-red-700"
              )}>
                {equipment.utilizationRate}% util
              </span>
            )}
          </div>
        )}

        {equipment.gpsEnabled && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <Navigation className={cn(
              "h-3.5 w-3.5",
              equipment.geofenceStatus === 'inside' ? "text-green-500" :
              equipment.geofenceStatus === 'outside' ? "text-red-500" :
              "text-gray-400"
            )} />
            <span>{equipment.gpsLastLocation}</span>
          </div>
        )}

        {/* Rental info with return reminders */}
        {equipment.isRental && (
          <div className="mb-3 p-2 rounded bg-orange-50 text-xs text-orange-700 space-y-1">
            <div className="font-medium">Rental from {equipment.rentalVendor}</div>
            <div>Rate: {equipment.rentalRate}</div>
            {equipment.rentalExpectedReturn && (
              <div className="flex items-center gap-2">
                <span>Return by: {formatDate(equipment.rentalExpectedReturn)}</span>
                {rentalOverdue && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                    OVERDUE by {Math.abs(rentalDaysUntilReturn!)} days
                  </span>
                )}
                {rentalSoonDue && (
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                    Return in {rentalDaysUntilReturn} days
                  </span>
                )}
              </div>
            )}
            {rentalCostAccumulated > 0 && (
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-orange-200">
                <DollarSign className="h-3 w-3" />
                <span>Cost accumulated: ${rentalCostAccumulated.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Checkout info */}
        {equipment.checkoutStatus === 'checked_out' && !equipment.isRental && (
          <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
            <Package className="h-3 w-3" />
            Checked out: {equipment.checkoutDate ? formatDate(equipment.checkoutDate) : ''}
            {equipment.expectedReturnDate && <span> (Return: {formatDate(equipment.expectedReturnDate)})</span>}
          </div>
        )}

        {equipment.maintenanceNote && (
          <div className="mb-3 p-2 rounded bg-amber-50 flex items-start gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
            <span className="text-amber-700">{equipment.maintenanceNote}</span>
          </div>
        )}

        {/* Checklist Status */}
        {hasChecklist && (
          <div className="mb-3">
            <button
              onClick={() => setInlineChecklistOpen(!inlineChecklistOpen)}
              className="flex items-center gap-2 text-xs w-full group"
            >
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              {equipment.checklistCompleted ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Checklist completed {equipment.checklistCompletedDate ? formatDate(equipment.checklistCompletedDate) : ''}
                </span>
              ) : (
                <span className="text-amber-600">
                  Checklist pending ({inlineChecklist ? Object.values(checkedItems).filter(Boolean).length : 0}/{inlineChecklist?.length ?? 0})
                </span>
              )}
              <ChevronRight className={cn(
                "h-3 w-3 text-gray-400 ml-auto transition-transform",
                inlineChecklistOpen && "rotate-90"
              )} />
            </button>

            {/* Inline Maintenance Checklist */}
            {inlineChecklistOpen && inlineChecklist && (
              <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">{equipment.category} Checklist</span>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      Object.values(checkedItems).filter(Boolean).length === inlineChecklist.length
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {Object.values(checkedItems).filter(Boolean).length}/{inlineChecklist.length}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {inlineChecklist.map(item => {
                    const isChecked = !!checkedItems[item.id]
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleCheckedItem(item.id)}
                        className={cn(
                          "flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors",
                          isChecked ? "bg-green-50/50" : "hover:bg-gray-50"
                        )}
                      >
                        {isChecked ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-xs",
                          isChecked ? "text-green-700 line-through" : "text-gray-700"
                        )}>
                          {item.item}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Value and depreciation */}
        {!equipment.isRental && (
          <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="text-gray-500">Purchased</div>
              <div className="font-medium text-gray-900">{formatCurrency(equipment.purchasePrice)}</div>
            </div>
            <div className="bg-gray-50 rounded p-1.5 text-center">
              <div className="text-gray-500">Book Value</div>
              <div className="font-medium text-gray-900">{formatCurrency(equipment.currentValue)}</div>
            </div>
            {equipment.costPerHour && (
              <div className="bg-gray-50 rounded p-1.5 text-center">
                <div className="text-gray-500">Cost/Hr</div>
                <div className="font-medium text-gray-900">${equipment.costPerHour.toFixed(2)}</div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium", statusCfg.color)}>
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </div>
          <div className="flex items-center gap-2">
            {equipment.nextMaintenance && (
              <span className={cn(
                "text-xs flex items-center gap-1",
                maintenanceOverdue ? "text-red-600 font-medium" : "text-gray-500"
              )}>
                <Calendar className="h-3 w-3" />
                {formatDate(equipment.nextMaintenance)}
              </span>
            )}
          </div>
        </div>

        {equipment.aiNote && (
          <div className="mt-3 p-2 rounded-md bg-blue-50 flex items-start gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-blue-500" />
            <span className="text-blue-700">{equipment.aiNote}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {equipment.status === 'available' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              <MapPin className="h-3.5 w-3.5" />
              Deploy to Job
            </button>
          )}
          {equipment.status === 'deployed' && (
            <>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50">
                <CheckCircle className="h-3.5 w-3.5" />
                Return / Check In
              </button>
              <button
                onClick={() => setBreakdownModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Breakdown
              </button>
            </>
          )}
          {equipment.status === 'maintenance' && (
            <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 border border-amber-200 rounded hover:bg-amber-50">
              <Wrench className="h-3.5 w-3.5" />
              View Maintenance
            </button>
          )}
          {hasChecklist && !equipment.checklistCompleted && (
            <button
              onClick={() => setChecklistModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-purple-600 border border-purple-200 rounded hover:bg-purple-50"
            >
              <FileText className="h-3.5 w-3.5" />
              Checklist
            </button>
          )}
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <QRCodeModal
        equipment={equipment}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      {equipment.photoUrls && (
        <PhotoGalleryModal
          photos={equipment.photoUrls}
          equipmentName={equipment.name}
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          initialIndex={photoIndex}
        />
      )}

      <ChecklistModal
        equipment={equipment}
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
      />

      <BreakdownModal
        equipment={equipment}
        isOpen={breakdownModalOpen}
        onClose={() => setBreakdownModalOpen(false)}
      />
    </>
  )
}

// ── Main Component ──────────────────────────────────────────────────────

export function EquipmentPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection, viewMode, setViewMode } = useFilterState({ defaultView: 'grid' })
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const filteredEquipment = sortItems(
    mockEquipment.filter(equipment => {
      if (!matchesSearch(equipment, search, ['name', 'assetTag', 'make', 'model', 'currentJob', 'assignedTo', 'serialNumber'])) return false
      const categoryMatch = activeTab === 'all' || activeTab === 'rentals' || activeTab === 'maintenance' || equipment.category === activeTab
      const statusMatch = selectedStatus === 'All' || equipment.status === selectedStatus.toLowerCase().replace(' ', '_')
      const rentalMatch = activeTab !== 'rentals' || equipment.isRental
      return categoryMatch && statusMatch && rentalMatch
    }),
    activeSort as keyof Equipment | '',
    sortDirection,
  )

  // Calculate stats
  const ownedEquipment = mockEquipment.filter(e => !e.isRental)
  const totalEquipment = ownedEquipment.length
  const totalValue = ownedEquipment.reduce((sum, e) => sum + e.currentValue, 0)
  const totalPurchaseValue = ownedEquipment.reduce((sum, e) => sum + e.purchasePrice, 0)
  const availableCount = mockEquipment.filter(e => e.status === 'available').length
  const deployedCount = mockEquipment.filter(e => e.status === 'deployed').length
  const maintenanceCount = mockEquipment.filter(e => e.status === 'maintenance' || e.status === 'repair').length
  const rentalCount = mockEquipment.filter(e => e.isRental).length
  const activeRentalCost = mockRentals.filter(r => r.status === 'active' || r.status === 'overdue').reduce((sum, r) => sum + r.totalCostToDate, 0)
  const gpsTrackedCount = mockEquipment.filter(e => e.gpsEnabled).length

  // Count overdue maintenance
  const overdueMaintenanceCount = mockEquipment.filter(e => isMaintenanceOverdue(e.nextMaintenance)).length

  // AI Features
  const aiFeatures = [
    {
      feature: 'Maintenance Prediction',
      insight: 'Generator approaching 500 hours. Oil change due in ~50 operating hours based on 250-hour interval.',
      action: { label: 'Schedule Maintenance', onClick: () => {} },
    },
    {
      feature: 'Utilization Analysis',
      insight: 'Bobcat S650 at 40% utilization this month. Consider: Rent out idle days or reassign to Johnson project.',
      action: { label: 'View Report', onClick: () => {} },
    },
    {
      feature: 'Rent vs Own Analysis',
      insight: '12-month excavator rental spend: $24,800. Purchase price: $85,000. Break-even: 41 months. Recommend: Continue renting.',
      action: { label: 'Full Analysis', onClick: () => {} },
    },
    {
      feature: 'Location Intelligence',
      insight: 'Compactor left Harbor View at 11:47 PM Saturday. Unusual - verify with site super Monday AM.',
      action: { label: 'View Location', onClick: () => {} },
    },
  ]

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Equipment & Assets</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {totalEquipment} owned + {rentalCount} rented
              </span>
              {overdueMaintenanceCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {overdueMaintenanceCount} overdue
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              Track equipment, tools, vehicles, rentals, maintenance, and depreciation
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <FileText className="h-4 w-4" />
              Depreciation Report
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="grid grid-cols-7 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Settings className="h-3.5 w-3.5" />
              Total Owned
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{totalEquipment}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <DollarSign className="h-3.5 w-3.5" />
              Book Value
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</div>
            <div className="text-xs text-gray-400">of {formatCurrency(totalPurchaseValue)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-xs">
              <CheckCircle className="h-3.5 w-3.5" />
              Available
            </div>
            <div className="text-xl font-bold text-green-700 mt-1">{availableCount}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-600 text-xs">
              <MapPin className="h-3.5 w-3.5" />
              Deployed
            </div>
            <div className="text-xl font-bold text-blue-700 mt-1">{deployedCount}</div>
          </div>
          <div className={cn("rounded-lg p-3", maintenanceCount > 0 ? "bg-amber-50" : "bg-gray-50")}>
            <div className={cn("flex items-center gap-2 text-xs", maintenanceCount > 0 ? "text-amber-600" : "text-gray-500")}>
              <Wrench className="h-3.5 w-3.5" />
              Maintenance
            </div>
            <div className={cn("text-xl font-bold mt-1", maintenanceCount > 0 ? "text-amber-700" : "text-gray-900")}>
              {maintenanceCount}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-orange-600 text-xs">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Active Rentals
            </div>
            <div className="text-xl font-bold text-orange-700 mt-1">{mockRentals.filter(r => r.status === 'active').length}</div>
            <div className="text-xs text-orange-500">{formatCurrency(activeRentalCost)} spent</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-emerald-600 text-xs">
              <Navigation className="h-3.5 w-3.5" />
              GPS Tracked
            </div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{gpsTrackedCount}</div>
          </div>
        </div>
      </div>

      {/* Cross-module connections */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Connected to:</span>
          {[
            { label: 'Jobs (Cost Allocation)', color: 'bg-blue-50 text-blue-700' },
            { label: 'HR & Workforce', color: 'bg-purple-50 text-purple-700' },
            { label: 'Financial Reporting', color: 'bg-green-50 text-green-700' },
            { label: 'Vendor Management', color: 'bg-orange-50 text-orange-700' },
            { label: 'Purchase Orders', color: 'bg-indigo-50 text-indigo-700' },
            { label: 'Notifications', color: 'bg-pink-50 text-pink-700' },
          ].map(badge => (
            <span key={badge.label} className={cn("text-xs px-2 py-0.5 rounded flex items-center gap-1", badge.color)}>
              <Link2 className="h-3 w-3" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search equipment, serial numbers..."
          tabs={[
            { key: 'all', label: 'All', count: mockEquipment.length },
            { key: 'Vehicle', label: 'Vehicles', count: mockEquipment.filter(e => e.category === 'Vehicle').length },
            { key: 'Heavy Equipment', label: 'Heavy Equip', count: mockEquipment.filter(e => e.category === 'Heavy Equipment').length },
            { key: 'Power Tool', label: 'Tools', count: mockEquipment.filter(e => e.category === 'Power Tool' || e.category === 'Hand Tool').length },
            { key: 'rentals', label: 'Rentals', count: mockRentals.length },
            { key: 'maintenance', label: 'Maintenance Log' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          dropdowns={activeTab !== 'rentals' && activeTab !== 'maintenance' ? [
            {
              label: 'All Statuses',
              value: selectedStatus,
              options: [
                { value: 'Available', label: 'Available' },
                { value: 'Deployed', label: 'Deployed' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Repair', label: 'Repair' },
                { value: 'Retired', label: 'Retired' },
              ],
              onChange: setSelectedStatus,
            },
          ] : []}
          sortOptions={activeTab !== 'rentals' && activeTab !== 'maintenance' ? [
            { value: 'name', label: 'Name' },
            { value: 'category', label: 'Category' },
            { value: 'currentValue', label: 'Value' },
            { value: 'status', label: 'Status' },
            { value: 'utilizationRate', label: 'Utilization' },
          ] : []}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          viewMode={activeTab !== 'rentals' && activeTab !== 'maintenance' ? viewMode : undefined}
          onViewModeChange={activeTab !== 'rentals' && activeTab !== 'maintenance' ? setViewMode : undefined}
          actions={[
            { icon: Plus, label: 'Add Asset', onClick: () => {}, variant: 'primary' },
          ]}
          resultCount={filteredEquipment.length}
          totalCount={mockEquipment.length}
        />
      </div>

      {/* Content */}
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {/* ── Equipment Grid/List ── */}
        {activeTab !== 'rentals' && activeTab !== 'maintenance' && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-3 gap-4">
                {filteredEquipment.map(equipment => (
                  <EquipmentCard key={equipment.id} equipment={equipment} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEquipment.map(equipment => (
                  <EquipmentCard key={equipment.id} equipment={equipment} />
                ))}
              </div>
            )}
            {filteredEquipment.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No equipment matches the current filters</p>
              </div>
            )}
          </>
        )}

        {/* ── Rentals Tab ── */}
        {activeTab === 'rentals' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">{mockRentals.filter(r => r.status === 'active').length}</div>
                <div className="text-xs text-green-600">Active Rentals</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-red-700">{mockRentals.filter(r => r.status === 'overdue').length}</div>
                <div className="text-xs text-red-600">Overdue Returns</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-700">${mockRentals.reduce((sum, r) => sum + r.totalCostToDate, 0).toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Rental Spend</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Equipment</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Vendor</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Project</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Rate</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Days</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Cost</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Return</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRentals.map(rental => (
                    <tr key={rental.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium text-gray-900">{rental.description}</td>
                      <td className="py-2 px-3 text-gray-600">{rental.vendor}</td>
                      <td className="py-2 px-3 text-gray-600">{rental.project}</td>
                      <td className="py-2 px-3 text-gray-600">{rental.rentalRate}/{rental.ratePeriod.slice(0, 1)}</td>
                      <td className="py-2 px-3 text-gray-600">{rental.daysRented}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">${rental.totalCostToDate.toLocaleString()}</td>
                      <td className="py-2 px-3 text-gray-600">{formatDate(rental.expectedReturnDate)}</td>
                      <td className="py-2 px-3">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-medium",
                          rental.status === 'active' ? "bg-green-100 text-green-700" :
                          rental.status === 'overdue' ? "bg-red-100 text-red-700" :
                          rental.status === 'pending_return' ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {rental.status === 'active' ? 'Active' :
                           rental.status === 'overdue' ? 'Overdue' :
                           rental.status === 'pending_return' ? 'Pending Return' :
                           'Returned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Rent vs Own insight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-800 text-sm">Rent vs. Own Analysis</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    You have spent $14,200 renting skid steers in the last 12 months.
                    A comparable Bobcat S650 purchase would cost $52,000 with estimated annual operating cost of $8,000.
                    At current rental frequency, ownership breaks even in 2.8 years.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Maintenance Tab ── */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            {/* Overdue maintenance alerts */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h5 className="font-medium text-amber-800">Maintenance Due / Overdue</h5>
              </div>
              <div className="space-y-2">
                {mockEquipment.filter(e => e.maintenanceNote || isMaintenanceOverdue(e.nextMaintenance)).map(eq => {
                  const overdue = isMaintenanceOverdue(eq.nextMaintenance)
                  const days = getOverdueDays(eq.nextMaintenance)
                  return (
                    <div key={eq.id} className={cn(
                      "flex items-center justify-between rounded p-2 border",
                      overdue ? "bg-red-50 border-red-200" : "bg-white border-amber-100"
                    )}>
                      <div className="flex items-center gap-2">
                        {overdue && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            OVERDUE
                          </span>
                        )}
                        <span className="font-mono text-xs text-gray-500">{eq.assetTag}</span>
                        <span className="text-sm font-medium text-gray-900">{eq.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {overdue ? (
                          <span className="text-xs text-red-700 font-medium">{days} days overdue</span>
                        ) : (
                          <span className="text-xs text-amber-700">{eq.maintenanceNote}</span>
                        )}
                        <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                          Schedule <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Maintenance log */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h5 className="font-medium text-gray-900">Recent Maintenance Log</h5>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Equipment</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Description</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Date</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Provider</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Parts</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Labor</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMaintenanceLogs.map(log => (
                    <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900">{log.equipmentName}</div>
                        <div className="text-xs text-gray-400 font-mono">{log.assetTag}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded font-medium",
                          log.maintenanceType === 'preventive' ? "bg-green-100 text-green-700" :
                          log.maintenanceType === 'corrective' ? "bg-red-100 text-red-700" :
                          log.maintenanceType === 'inspection' ? "bg-blue-100 text-blue-700" :
                          "bg-purple-100 text-purple-700"
                        )}>
                          {log.maintenanceType}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs">{log.description}</td>
                      <td className="py-2 px-3 text-gray-600">{formatDate(log.performedDate)}</td>
                      <td className="py-2 px-3 text-gray-600">{log.serviceProvider}</td>
                      <td className="py-2 px-3 text-gray-600">${log.partsCost}</td>
                      <td className="py-2 px-3 text-gray-600">${log.laborCost}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">${log.totalCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
                Total maintenance cost (shown): ${mockMaintenanceLogs.reduce((sum, l) => sum + l.totalCost, 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Features Panel */}
      <div className="border-t border-gray-200">
        <AIFeaturesPanel
          title="Equipment Intelligence"
          features={aiFeatures}
        />
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">Asset Intelligence:</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-amber-700">
            <span>Bobcat S650 at 40% utilization - rental may be more cost-effective ($14.2K/yr rental spend)</span>
            <span className="text-amber-400">|</span>
            <span>Generator needs oil change in ~50 hours based on usage pattern</span>
            <span className="text-amber-400">|</span>
            <span>Laser level checkout approaching return date - confirm still at Smith job</span>
            <span className="text-amber-400">|</span>
            <span>Scissor lift rental overdue by 9 days - $58/day unnecessary cost</span>
          </div>
        </div>
      </div>
    </div>
  )
}
