'use client'

import { useState } from 'react'

import { Eye, BookOpen } from 'lucide-react'

import { PageSpec } from '@/components/skeleton/page-spec'
import { PropertyPreview } from '@/components/skeleton/previews/property-preview'
import { cn } from '@/lib/utils'

const constructionWorkflow = [
  'Lead', 'Estimate', 'Contract', 'Job Setup', 'Property Details', 'Budget', 'Schedule', 'Construction'
]

export default function PropertyDetailsSkeleton() {
  const [activeTab, setActiveTab] = useState<'preview' | 'spec'>('preview')

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <Eye className="h-4 w-4" />
          UI Preview
        </button>
        <button
          onClick={() => setActiveTab('spec')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === 'spec'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          <BookOpen className="h-4 w-4" />
          Specification
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preview' ? (
        <PropertyPreview />
      ) : (
        <PageSpec
          title="Property Details"
          phase="Phase 0 - Foundation"
          planFile="views/jobs/PROPERTY_DETAILS.md"
          description="Complete physical profile of the home and site. Core reference data that feeds estimating, permitting, insurance, scheduling, and AI intelligence. Populated from plan extraction, manual entry, or imported from lead/estimate data. This is the single source of truth for 'what are we building?'"
          workflow={constructionWorkflow}
          features={[
            'Building profile: total SF, SF under AC, heated/cooled SF, garage SF, porch/lanai SF, pool house SF',
            'Room count summary: bedrooms, full baths, half baths, bonus rooms, offices',
            'Stories and vertical profile: 1-story, 2-story, split-level, with per-floor SF breakdown',
            'Garage: bays, attached/detached, SF, finished/unfinished',
            'Foundation type: slab-on-grade, crawlspace, pilings/stilts, basement, with elevation height if applicable',
            'Structural system: wood frame, CBS/CMU, steel frame, ICF, hybrid',
            'Roof: type (hip, gable, flat, mixed), pitch, material (shingle, metal, tile, flat)',
            'Exterior cladding: siding type(s), brick, stucco, stone, fiber cement, wood',
            'Lot info: acreage, lot dimensions, lot number, subdivision, HOA name',
            'Site conditions: flood zone (FEMA), coastal/inland, wind speed zone, exposure category',
            'Elevation requirements: BFE, DFE, finished floor elevation, freeboard',
            'Zoning: classification, setbacks (front/rear/side), lot coverage %, height limit',
            'Utilities: water (city/well), sewer (city/septic), gas (natural/propane/none), electric provider',
            'Special features: pool, outdoor kitchen, elevator, generator, fire sprinklers, smart home, solar',
            'Construction classification: new construction, renovation, addition, tear-down/rebuild',
            'Project type tags: coastal, elevated, historic district, waterfront, gated community',
            'Photo: featured property rendering or site photo',
            'Map embed: lot location with parcel overlay',
            'AI-extracted fields highlighted with confidence indicators',
            'Edit mode for manual corrections with learning feedback',
            'Version history: track changes to property profile over time',
            'Print/export property summary sheet',
          ]}
          connections={[
            { name: 'Plan Extraction', type: 'input', description: 'AI extracts SF, room counts, schedules, foundation type, stories from uploaded plans' },
            { name: 'Lead / Estimate', type: 'input', description: 'Initial SF, project type, lot info carried forward from pre-construction' },
            { name: 'Contract', type: 'input', description: 'Contract SF and address become authoritative after execution' },
            { name: 'Permit Extraction', type: 'input', description: 'Jurisdiction, zoning, flood zone auto-populated from permit documents' },
            { name: 'Estimating', type: 'output', description: 'SF, room counts, foundation type drive quantity calculations and $/SF benchmarks' },
            { name: 'Budget', type: 'output', description: 'Cost-per-SF calculations, foundation/structural cost adjustments' },
            { name: 'Schedule', type: 'output', description: 'Foundation type, stories, roof complexity affect duration estimates' },
            { name: 'Insurance', type: 'output', description: 'Construction type, flood zone, wind zone determine coverage requirements' },
            { name: 'Permits', type: 'output', description: 'Zoning setbacks, flood zone, elevation data feed permit applications' },
            { name: 'Client Portal', type: 'output', description: 'Property summary displayed on client-facing dashboard' },
            { name: 'AI Intelligence', type: 'output', description: 'Property attributes power similar-job comparisons and cost predictions' },
            { name: 'Selections', type: 'output', description: 'Room count and SF drive selection quantity calculations' },
            { name: 'Reports', type: 'output', description: 'Property data appears on job cost reports, draw packages, and closeout docs' },
          ]}
          dataFields={[
            // Identity
            { name: 'id', type: 'uuid', required: true, description: 'Primary key' },
            { name: 'job_id', type: 'uuid', required: true, description: 'FK to jobs - one property profile per job' },

            // Building Size
            { name: 'total_sf', type: 'decimal', required: true, description: 'Total square footage under roof' },
            { name: 'conditioned_sf', type: 'decimal', description: 'Square footage under AC/heat (living space)' },
            { name: 'garage_sf', type: 'decimal', description: 'Garage square footage' },
            { name: 'porch_lanai_sf', type: 'decimal', description: 'Covered porch, lanai, screened areas' },
            { name: 'pool_house_sf', type: 'decimal', description: 'Pool house, cabana, detached structure SF' },
            { name: 'per_floor_sf', type: 'jsonb', description: 'SF breakdown by floor: { "first": 2200, "second": 1800, "bonus": 400 }' },

            // Room Counts
            { name: 'bedrooms', type: 'integer', description: 'Number of bedrooms' },
            { name: 'full_bathrooms', type: 'integer', description: 'Full bathrooms (shower/tub + toilet + sink)' },
            { name: 'half_bathrooms', type: 'integer', description: 'Half baths (toilet + sink only)' },
            { name: 'stories', type: 'decimal', description: 'Number of stories (1, 1.5, 2, 3)' },
            { name: 'room_summary', type: 'jsonb', description: 'Detailed room list: [{ name, floor, sf, type }]' },

            // Garage
            { name: 'garage_bays', type: 'integer', description: 'Number of garage bays' },
            { name: 'garage_type', type: 'string', description: 'attached | detached | carport | none' },
            { name: 'garage_finished', type: 'boolean', description: 'Is garage finished/conditioned?' },

            // Structure
            { name: 'foundation_type', type: 'string', description: 'slab | crawlspace | pilings | basement | hybrid' },
            { name: 'elevation_height_ft', type: 'decimal', description: 'Height above grade (for elevated/piling homes)' },
            { name: 'structural_system', type: 'string', description: 'wood_frame | cbs | steel_frame | icf | hybrid' },
            { name: 'roof_type', type: 'string', description: 'hip | gable | flat | shed | mixed' },
            { name: 'roof_pitch', type: 'string', description: 'Roof pitch (e.g., 6:12, 8:12)' },
            { name: 'roof_material', type: 'string', description: 'asphalt_shingle | metal_standing_seam | tile_concrete | tile_clay | flat_membrane | slate' },
            { name: 'exterior_cladding', type: 'jsonb', description: 'Array of cladding types: ["fiber_cement", "stone_veneer"]' },

            // Lot & Site
            { name: 'lot_acreage', type: 'decimal', description: 'Lot size in acres' },
            { name: 'lot_dimensions', type: 'string', description: 'Lot dimensions (e.g., 100x150)' },
            { name: 'lot_number', type: 'string', description: 'Lot number in subdivision' },
            { name: 'subdivision', type: 'string', description: 'Subdivision or community name' },
            { name: 'hoa_name', type: 'string', description: 'HOA name if applicable' },
            { name: 'parcel_number', type: 'string', description: 'County parcel/folio number' },

            // Regulatory & Environmental
            { name: 'flood_zone', type: 'string', description: 'FEMA flood zone (X, AE, VE, etc.)' },
            { name: 'base_flood_elevation', type: 'decimal', description: 'BFE from FIRM map' },
            { name: 'design_flood_elevation', type: 'decimal', description: 'DFE (BFE + freeboard)' },
            { name: 'finished_floor_elevation', type: 'decimal', description: 'FFE as built' },
            { name: 'wind_speed_zone', type: 'integer', description: 'Design wind speed in mph (e.g., 150, 170)' },
            { name: 'exposure_category', type: 'string', description: 'Wind exposure category (B, C, D)' },
            { name: 'is_coastal', type: 'boolean', description: 'Coastal construction zone' },
            { name: 'is_historic_district', type: 'boolean', description: 'Historic district restrictions apply' },
            { name: 'zoning_classification', type: 'string', description: 'Zoning code (R-1, PUD, etc.)' },
            { name: 'setbacks', type: 'jsonb', description: '{ front: 25, rear: 20, side: 10, waterfront: 50 }' },
            { name: 'max_lot_coverage_pct', type: 'decimal', description: 'Maximum lot coverage percentage' },
            { name: 'max_height_ft', type: 'decimal', description: 'Maximum building height allowed' },

            // Utilities
            { name: 'water_source', type: 'string', description: 'city | well | cistern' },
            { name: 'sewer_type', type: 'string', description: 'city | septic | advanced_septic' },
            { name: 'gas_type', type: 'string', description: 'natural | propane | none' },
            { name: 'electric_provider', type: 'string', description: 'Electric utility company name' },

            // Special Features
            { name: 'special_features', type: 'jsonb', description: 'Array: ["pool", "outdoor_kitchen", "elevator", "generator", "fire_sprinklers", "smart_home", "solar", "ev_charger"]' },

            // Classification
            { name: 'construction_type', type: 'string', description: 'new_construction | renovation | addition | tear_down_rebuild' },
            { name: 'project_tags', type: 'jsonb', description: 'Array of tags: ["coastal", "elevated", "waterfront", "gated_community", "barrier_island"]' },

            // Media
            { name: 'featured_image_url', type: 'string', description: 'Rendering, site photo, or plan thumbnail' },
            { name: 'site_map_url', type: 'string', description: 'Site plan or survey image' },

            // AI Metadata
            { name: 'ai_extracted_fields', type: 'jsonb', description: 'Which fields were AI-extracted vs manual: { "total_sf": { source: "plan_extraction", confidence: 0.85 } }' },
            { name: 'last_plan_sync', type: 'timestamptz', description: 'Last time plan extraction updated this profile' },
          ]}
          aiFeatures={[
            {
              name: 'Plan-to-Profile Sync',
              description: 'When architectural/structural plans are uploaded, AI extracts total SF, room counts, door/window counts, foundation type, stories, and roof type. Populates property profile with confidence scores. Highlights fields that differ from manual entry for review.',
              trigger: 'On plan upload or revision'
            },
            {
              name: 'Permit Data Enrichment',
              description: 'When permit documents are uploaded, AI extracts flood zone, zoning classification, setbacks, and wind speed requirements. Cross-references with existing property data and flags conflicts: "Permit says AE flood zone but property was marked X."',
              trigger: 'On permit document upload'
            },
            {
              name: 'Similar Property Matching',
              description: 'Finds similar completed jobs based on property attributes (SF range, stories, foundation type, coastal designation, construction type). Powers cost benchmarking: "Your 3,500 SF elevated coastal homes average $285/SF. This one is tracking at $295/SF."',
              trigger: 'On demand and for estimating'
            },
            {
              name: 'Cost Impact Analysis',
              description: 'Quantifies how property attributes affect cost: "Pilings add $45K vs slab. Metal roof adds $18K vs shingle. Pool adds $65-85K based on your history." Helps builders communicate cost drivers to clients.',
              trigger: 'On property profile changes'
            },
            {
              name: 'Regulatory Compliance Check',
              description: 'Validates property attributes against regulatory requirements: "VE flood zone requires breakaway walls below BFE. Wind speed 170mph requires impact-rated windows throughout. Check that window schedule meets this requirement."',
              trigger: 'On regulatory field changes'
            },
            {
              name: 'Insurance Requirement Calculator',
              description: 'Based on property attributes (construction type, flood zone, wind zone, coastal designation), determines minimum insurance requirements for the job and validates vendor COIs against them.',
              trigger: 'On property profile completion'
            },
            {
              name: 'Schedule Duration Estimation',
              description: 'Property attributes inform schedule duration predictions: "2-story pilings homes average 14 months. Comparable 1-story slab homes average 10 months. Pool adds 6-8 weeks to timeline."',
              trigger: 'On schedule creation'
            },
          ]}
          mockupAscii={`
┌─────────────────────────────────────────────────────────────────────┐
│ Property Details - Smith Residence              [Edit] [Print] [...] │
│ 123 Oak Street, Anna Maria Island, FL 34216                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ BUILDING PROFILE            │  │ SITE & LOT                  │   │
│  │                             │  │                             │   │
│  │ Total SF:     3,500         │  │ Lot:    0.28 acres          │   │
│  │ Under AC:     2,800         │  │ Dims:   100 x 120          │   │
│  │ Garage:         600         │  │ Parcel: 12345-6789         │   │
│  │ Porch/Lanai:    400  *AI    │  │ Sub:    Island Preserve     │   │
│  │ Pool House:       0         │  │ HOA:    IP Homeowners       │   │
│  │                             │  │ Zoning: R-1 SFR             │   │
│  │ Bed: 4  |  Bath: 3/1       │  │                             │   │
│  │ Stories: 2                  │  │ Setbacks:                   │   │
│  │  1st Floor:  2,200 SF       │  │  Front: 25'  Rear: 20'     │   │
│  │  2nd Floor:  1,300 SF       │  │  Side: 10'   Water: 50'    │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐   │
│  │ STRUCTURE                   │  │ ENVIRONMENTAL               │   │
│  │                             │  │                             │   │
│  │ Foundation: Pilings         │  │ Flood Zone:  VE        *AI  │   │
│  │ Elevation:  14' above grade │  │ BFE:         12' NAVD      │   │
│  │ Frame:      Wood frame      │  │ DFE:         13' NAVD      │   │
│  │ Roof:       Hip, 6:12       │  │ FFE:         14' NAVD      │   │
│  │ Roof Mat:   Metal standing  │  │ Wind Speed:  170 mph       │   │
│  │ Exterior:   Fiber cement    │  │ Exposure:    D (coastal)   │   │
│  │           + Stone veneer    │  │ Coastal:     Yes           │   │
│  │                             │  │                             │   │
│  │ Garage: 2-bay, attached     │  │ Water: City | Sewer: City  │   │
│  │         Unfinished          │  │ Gas: Propane | Elec: FPL   │   │
│  └─────────────────────────────┘  └─────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ SPECIAL FEATURES                                              │   │
│  │ [Pool] [Outdoor Kitchen] [Elevator] [Generator] [Smart Home]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ AI: "VE flood zone + 170mph wind = impact windows required    │   │
│  │ throughout. Breakaway walls below BFE. Similar homes avg       │   │
│  │ $285/SF. Pilings + elevator add ~$85K vs slab."               │   │
│  │                                                                │   │
│  │ *AI = field extracted from uploaded plans (confidence 85%+)    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
`}
        />
      )}
    </div>
  )
}
