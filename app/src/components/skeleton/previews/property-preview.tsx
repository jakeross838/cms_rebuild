'use client'

import {
  Building2,
  Home,
  MapPin,
  Ruler,
  Layers,
  Droplets,
  Wind,
  Thermometer,
  Car,
  Trees,
  Sparkles,
  Edit3,
  Printer,
  Square,
  Mountain,
  Waves,
  Zap,
  Flame,
  CloudRain,
  Shield,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropertyData {
  // Basic Info
  jobName: string
  address: string
  city: string
  state: string
  zip: string

  // Building Profile
  totalSf: number
  conditionedSf: number
  garageSf: number
  porchLanaiSf: number
  bedrooms: number
  fullBaths: number
  halfBaths: number
  stories: number
  firstFloorSf: number
  secondFloorSf: number

  // Garage
  garageBays: number
  garageType: string
  garageFinished: boolean

  // Structure
  foundationType: string
  elevationHeight: number
  structuralSystem: string
  roofType: string
  roofPitch: string
  roofMaterial: string
  exteriorCladding: string[]

  // Lot & Site
  lotAcreage: number
  lotDimensions: string
  lotNumber: string
  subdivision: string
  hoaName: string
  parcelNumber: string
  zoning: string

  // Setbacks
  setbackFront: number
  setbackRear: number
  setbackSide: number
  setbackWater: number

  // Environmental
  floodZone: string
  bfe: number
  dfe: number
  ffe: number
  windSpeed: number
  exposureCategory: string
  isCoastal: boolean
  isHistoric: boolean

  // Utilities
  waterSource: string
  sewerType: string
  gasType: string
  electricProvider: string

  // Special Features
  specialFeatures: string[]

  // AI Extracted
  aiExtractedFields: string[]
}

const mockProperty: PropertyData = {
  jobName: 'Smith Residence',
  address: '1234 Ocean Drive',
  city: 'Anna Maria Island',
  state: 'FL',
  zip: '34216',

  totalSf: 3500,
  conditionedSf: 2800,
  garageSf: 600,
  porchLanaiSf: 400,
  bedrooms: 4,
  fullBaths: 3,
  halfBaths: 1,
  stories: 2,
  firstFloorSf: 2200,
  secondFloorSf: 1300,

  garageBays: 2,
  garageType: 'Attached',
  garageFinished: false,

  foundationType: 'Pilings',
  elevationHeight: 14,
  structuralSystem: 'Wood Frame',
  roofType: 'Hip',
  roofPitch: '6:12',
  roofMaterial: 'Metal Standing Seam',
  exteriorCladding: ['Fiber Cement', 'Stone Veneer'],

  lotAcreage: 0.28,
  lotDimensions: '100 x 120',
  lotNumber: '15',
  subdivision: 'Island Preserve',
  hoaName: 'IP Homeowners Association',
  parcelNumber: '12345-6789-00',
  zoning: 'R-1 SFR',

  setbackFront: 25,
  setbackRear: 20,
  setbackSide: 10,
  setbackWater: 50,

  floodZone: 'VE',
  bfe: 12,
  dfe: 13,
  ffe: 14,
  windSpeed: 170,
  exposureCategory: 'D',
  isCoastal: true,
  isHistoric: false,

  waterSource: 'City',
  sewerType: 'City',
  gasType: 'Propane',
  electricProvider: 'FPL',

  specialFeatures: ['Pool', 'Outdoor Kitchen', 'Elevator', 'Generator', 'Smart Home'],

  aiExtractedFields: ['porchLanaiSf', 'floodZone', 'stories'],
}

function InfoCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: typeof Building2
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function DataRow({
  label,
  value,
  isAiExtracted,
}: {
  label: string
  value: string | number
  isAiExtracted?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-900">{value}</span>
        {isAiExtracted && (
          <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI</span>
        )}
      </div>
    </div>
  )
}

function FeatureBadge({ feature }: { feature: string }) {
  const featureIcons: Record<string, typeof Home> = {
    'Pool': Waves,
    'Outdoor Kitchen': Flame,
    'Elevator': Layers,
    'Generator': Zap,
    'Smart Home': Home,
    'Fire Sprinklers': CloudRain,
    'Solar': Thermometer,
  }
  const Icon = featureIcons[feature] || Square

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-lg text-blue-700 text-sm">
      <Icon className="h-4 w-4" />
      <span>{feature}</span>
    </div>
  )
}

export function PropertyPreview() {
  const p = mockProperty

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900">Property Details - {p.jobName}</h3>
              {p.isCoastal && (
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">Coastal</span>
              )}
              {p.foundationType === 'Pilings' && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Elevated</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{p.address}, {p.city}, {p.state} {p.zip}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Building Profile */}
          <InfoCard title="Building Profile" icon={Building2}>
            <div className="space-y-0.5">
              <DataRow label="Total SF" value={`${p.totalSf.toLocaleString()} SF`} />
              <DataRow label="Under AC" value={`${p.conditionedSf.toLocaleString()} SF`} />
              <DataRow label="Garage" value={`${p.garageSf.toLocaleString()} SF`} />
              <DataRow label="Porch/Lanai" value={`${p.porchLanaiSf.toLocaleString()} SF`} isAiExtracted />
              <div className="border-t border-gray-100 my-2" />
              <DataRow label="Bedrooms" value={p.bedrooms} />
              <DataRow label="Bathrooms" value={`${p.fullBaths} full / ${p.halfBaths} half`} />
              <DataRow label="Stories" value={p.stories} isAiExtracted />
              <div className="mt-2 text-xs text-gray-500">
                1st Floor: {p.firstFloorSf.toLocaleString()} SF | 2nd Floor: {p.secondFloorSf.toLocaleString()} SF
              </div>
            </div>
          </InfoCard>

          {/* Site & Lot */}
          <InfoCard title="Site & Lot" icon={Trees}>
            <div className="space-y-0.5">
              <DataRow label="Lot Size" value={`${p.lotAcreage} acres`} />
              <DataRow label="Dimensions" value={p.lotDimensions} />
              <DataRow label="Lot #" value={p.lotNumber} />
              <DataRow label="Subdivision" value={p.subdivision} />
              <DataRow label="HOA" value={p.hoaName} />
              <DataRow label="Parcel #" value={p.parcelNumber} />
              <DataRow label="Zoning" value={p.zoning} />
            </div>
          </InfoCard>

          {/* Structure */}
          <InfoCard title="Structure" icon={Home}>
            <div className="space-y-0.5">
              <DataRow label="Foundation" value={p.foundationType} />
              <DataRow label="Elevation" value={`${p.elevationHeight}' above grade`} />
              <DataRow label="Frame" value={p.structuralSystem} />
              <DataRow label="Roof Type" value={`${p.roofType}, ${p.roofPitch}`} />
              <DataRow label="Roof Material" value={p.roofMaterial} />
              <DataRow label="Exterior" value={p.exteriorCladding.join(' + ')} />
              <div className="border-t border-gray-100 my-2" />
              <DataRow label="Garage" value={`${p.garageBays}-bay, ${p.garageType}`} />
              <DataRow label="Garage Finished" value={p.garageFinished ? 'Yes' : 'No'} />
            </div>
          </InfoCard>

          {/* Environmental */}
          <InfoCard title="Environmental & Regulatory" icon={Shield}>
            <div className="space-y-0.5">
              <DataRow label="Flood Zone" value={p.floodZone} isAiExtracted />
              <DataRow label="BFE" value={`${p.bfe}' NAVD`} />
              <DataRow label="DFE" value={`${p.dfe}' NAVD`} />
              <DataRow label="FFE" value={`${p.ffe}' NAVD`} />
              <div className="border-t border-gray-100 my-2" />
              <DataRow label="Wind Speed" value={`${p.windSpeed} mph`} />
              <DataRow label="Exposure" value={`Category ${p.exposureCategory}`} />
              <DataRow label="Coastal Zone" value={p.isCoastal ? 'Yes' : 'No'} />
              <div className="border-t border-gray-100 my-2" />
              <div className="text-xs text-gray-500">
                Setbacks: Front {p.setbackFront}' | Rear {p.setbackRear}' | Side {p.setbackSide}' | Water {p.setbackWater}'
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Utilities Row */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <Droplets className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-xs text-gray-500">Water</div>
              <div className="text-sm font-medium text-gray-900">{p.waterSource}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <Mountain className="h-5 w-5 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500">Sewer</div>
              <div className="text-sm font-medium text-gray-900">{p.sewerType}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-xs text-gray-500">Gas</div>
              <div className="text-sm font-medium text-gray-900">{p.gasType}</div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <div className="text-xs text-gray-500">Electric</div>
              <div className="text-sm font-medium text-gray-900">{p.electricProvider}</div>
            </div>
          </div>
        </div>

        {/* Special Features */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-gray-500" />
            <h4 className="font-medium text-gray-900 text-sm">Special Features</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.specialFeatures.map(feature => (
              <FeatureBadge key={feature} feature={feature} />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="flex-1 text-sm text-amber-700">
            <p className="mb-2">
              <strong>Regulatory Requirements:</strong> VE flood zone + 170mph wind = impact windows required throughout. Breakaway walls required below BFE.
            </p>
            <p>
              <strong>Cost Comparison:</strong> Similar 3,500 SF elevated coastal homes average $285/SF. Pilings + elevator add ~$85K vs slab foundation.
              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">AI = field extracted from uploaded plans</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
