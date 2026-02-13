'use client'

import { useState } from 'react'
import {
  User,
  Building,
  Phone,
  Mail,
  Star,
  Plus,
  MoreHorizontal,
  Sparkles,
  Globe,
  MapPin,
  Tag,
  Shield,
  FileText,
  Calendar,
  CreditCard,
  UserPlus,
  Users,
  Archive,
  Smartphone,
  Briefcase,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'
import { AIFeaturesPanel } from '@/components/skeleton/ui'

// ---------------------------------------------------------------------------
// Types (aligned to Module 03 - Core Data Model, contacts table)
// ---------------------------------------------------------------------------

type ContactType = 'client' | 'vendor' | 'architect' | 'engineer' | 'designer' | 'lender' | 'realtor' | 'inspector' | 'other'
type ContactStatus = 'active' | 'archived'

interface ProjectAssignment {
  projectId: string
  projectName: string
  role: string
  isPrimary: boolean
  contractAmount?: number
}

interface Contact {
  id: string
  contactType: ContactType
  firstName: string
  lastName: string
  companyName?: string
  displayName: string
  title: string
  email: string
  phone: string
  mobile?: string
  website?: string
  address?: string
  notes?: string
  tags: string[]
  isFavorite: boolean
  status: ContactStatus

  // Vendor-specific fields
  licenseNumber?: string
  insuranceExpiry?: string
  insuranceStatus?: 'valid' | 'expiring' | 'expired'
  w9OnFile?: boolean
  paymentTerms?: string
  taxId?: string

  // Client-specific fields
  clientSource?: string
  referredBy?: string

  // Relationships
  projectAssignments: ProjectAssignment[]

  // Audit
  createdAt: string
  version: number
}

// ---------------------------------------------------------------------------
// Mock Data (covering all contact_type values from spec)
// ---------------------------------------------------------------------------

const mockContacts: Contact[] = [
  {
    id: '1',
    contactType: 'architect',
    firstName: 'John',
    lastName: 'Smith',
    companyName: 'ABC Architecture',
    displayName: 'John Smith',
    title: 'Principal Architect, AIA',
    email: 'john@abcarch.com',
    phone: '(555) 222-3333',
    mobile: '(555) 222-3334',
    website: 'www.abcarch.com',
    address: '100 Design Blvd, Austin, TX 78701',
    notes: 'Specializes in coastal modern. Responsive to RFIs.',
    tags: ['Preferred', 'Coastal', 'Modern'],
    isFavorite: true,
    status: 'active',
    licenseNumber: 'ARC-2024-1234',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'architect', isPrimary: true },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'architect', isPrimary: true },
      { projectId: 'j-005', projectName: 'Davis Addition', role: 'architect', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'architect', isPrimary: false },
      { projectId: 'j-009', projectName: 'Clark Renovation', role: 'architect', isPrimary: true },
    ],
    createdAt: '2024-06-15',
    version: 3,
  },
  {
    id: '2',
    contactType: 'engineer',
    firstName: 'Bob',
    lastName: 'Wilson',
    companyName: 'Coastal Engineering',
    displayName: 'Bob Wilson',
    title: 'Structural Engineer, PE',
    email: 'bob@coastaleng.com',
    phone: '(555) 444-5555',
    mobile: '(555) 444-5556',
    website: 'www.coastaleng.com',
    address: '200 Engineering Way, Austin, TX 78702',
    tags: ['Preferred', 'Structural', 'Coastal/Elevated'],
    isFavorite: true,
    status: 'active',
    licenseNumber: 'PE-TX-89012',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-003', projectName: 'Harbor Condo Reno', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-005', projectName: 'Davis Addition', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-006', projectName: 'Reef House', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'structural_engineer', isPrimary: true },
      { projectId: 'j-009', projectName: 'Clark Renovation', role: 'structural_engineer', isPrimary: false },
      { projectId: 'j-010', projectName: 'Bay Vista Home', role: 'structural_engineer', isPrimary: true },
    ],
    createdAt: '2024-03-10',
    version: 5,
  },
  {
    id: '3',
    contactType: 'inspector',
    firstName: 'Tom',
    lastName: 'Davis',
    companyName: 'County Building Dept',
    displayName: 'Tom Davis',
    title: 'Senior Building Inspector',
    email: 'tdavis@county.gov',
    phone: '(555) 666-7777',
    address: '400 Government Center, Austin, TX 78703',
    tags: ['Government', 'Structural', 'Electrical'],
    isFavorite: false,
    status: 'active',
    notes: 'Usually available for inspection scheduling Tue-Thur. 48-hour notice required.',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-003', projectName: 'Harbor Condo Reno', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-005', projectName: 'Davis Addition', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-006', projectName: 'Reef House', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-007', projectName: 'Sunset Ridge', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-009', projectName: 'Clark Renovation', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-010', projectName: 'Bay Vista Home', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-011', projectName: 'Maple Court Duplex', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-012', projectName: 'Cedar Walk Townhome', role: 'building_inspector', isPrimary: true },
      { projectId: 'j-013', projectName: 'Heritage Oak Home', role: 'building_inspector', isPrimary: true },
    ],
    createdAt: '2023-11-01',
    version: 2,
  },
  {
    id: '4',
    contactType: 'realtor',
    firstName: 'Sarah',
    lastName: 'Johnson',
    companyName: 'Johnson Realty',
    displayName: 'Sarah Johnson',
    title: 'Broker Associate',
    email: 'sarah@johnsonrealty.com',
    phone: '(555) 888-9999',
    mobile: '(555) 888-9998',
    website: 'www.johnsonrealty.com',
    address: '500 Realty Row, Austin, TX 78704',
    tags: ['Referral Source', 'Luxury', 'Coastal'],
    isFavorite: false,
    status: 'active',
    clientSource: 'referral',
    projectAssignments: [
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'realtor', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'realtor', isPrimary: true },
      { projectId: 'j-010', projectName: 'Bay Vista Home', role: 'realtor', isPrimary: true },
    ],
    createdAt: '2024-09-20',
    version: 1,
  },
  {
    id: '5',
    contactType: 'other',
    firstName: 'Mike',
    lastName: 'Brown',
    companyName: 'Brown & Associates',
    displayName: 'Mike Brown',
    title: 'Construction Attorney',
    email: 'mike@brownlaw.com',
    phone: '(555) 111-2222',
    mobile: '(555) 111-2223',
    website: 'www.brownlaw.com',
    address: '600 Legal Ave, Austin, TX 78705',
    tags: ['Legal', 'Contracts', 'Lien Law'],
    isFavorite: true,
    status: 'active',
    notes: 'Specializes in TX lien law and construction defect litigation.',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'attorney', isPrimary: true },
      { projectId: 'j-003', projectName: 'Harbor Condo Reno', role: 'attorney', isPrimary: true },
    ],
    createdAt: '2024-01-05',
    version: 2,
  },
  {
    id: '6',
    contactType: 'designer',
    firstName: 'Lisa',
    lastName: 'Chen',
    companyName: 'Chen Interior Design',
    displayName: 'Lisa Chen',
    title: 'Principal Interior Designer, ASID',
    email: 'lisa@chendesign.com',
    phone: '(555) 333-4444',
    mobile: '(555) 333-4445',
    website: 'www.chendesign.com',
    address: '150 Design District, Austin, TX 78701',
    tags: ['Preferred', 'Modern', 'High-End'],
    isFavorite: true,
    status: 'active',
    notes: 'Works closely with selections. Very detail-oriented on specs.',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'interior_designer', isPrimary: true },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'interior_designer', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'interior_designer', isPrimary: true },
    ],
    createdAt: '2024-07-22',
    version: 2,
  },
  {
    id: '7',
    contactType: 'lender',
    firstName: 'David',
    lastName: 'Martinez',
    companyName: 'First Coast Bank',
    displayName: 'David Martinez',
    title: 'VP, Construction Lending',
    email: 'dmartinez@firstcoastbank.com',
    phone: '(555) 777-8888',
    mobile: '(555) 777-8889',
    website: 'www.firstcoastbank.com',
    address: '800 Financial Blvd, Austin, TX 78701',
    tags: ['Construction Loans', 'Draws', 'Primary Lender'],
    isFavorite: false,
    status: 'active',
    notes: 'Primary construction lender. AIA G702/G703 format required for draws.',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'lender', isPrimary: true },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'lender', isPrimary: true },
      { projectId: 'j-006', projectName: 'Reef House', role: 'lender', isPrimary: true },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'lender', isPrimary: true },
    ],
    createdAt: '2024-04-18',
    version: 1,
  },
  {
    id: '8',
    contactType: 'client',
    firstName: 'James',
    lastName: 'Parker',
    companyName: '',
    displayName: 'James Parker',
    title: 'Homeowner',
    email: 'james.parker@gmail.com',
    phone: '(555) 999-1111',
    mobile: '(555) 999-1112',
    address: '900 Lakefront Dr, Austin, TX 78730',
    tags: ['Active Client', 'Custom Home'],
    isFavorite: false,
    status: 'active',
    clientSource: 'referral',
    referredBy: 'Sarah Johnson',
    projectAssignments: [
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'client', isPrimary: true },
    ],
    createdAt: '2025-01-10',
    version: 1,
  },
  {
    id: '9',
    contactType: 'vendor',
    firstName: 'Rick',
    lastName: 'Torres',
    companyName: 'Torres Electrical',
    displayName: 'Torres Electrical',
    title: 'Owner / Master Electrician',
    email: 'rick@torreselectric.com',
    phone: '(555) 555-6666',
    mobile: '(555) 555-6667',
    website: 'www.torreselectric.com',
    address: '250 Trade Way, Austin, TX 78745',
    tags: ['Preferred', 'Electrical', 'Residential'],
    isFavorite: true,
    status: 'active',
    licenseNumber: 'ELEC-TX-34567',
    insuranceExpiry: '2026-08-15',
    insuranceStatus: 'valid',
    w9OnFile: true,
    paymentTerms: 'net_30',
    taxId: '**-***1234',
    projectAssignments: [
      { projectId: 'j-001', projectName: 'Smith Residence', role: 'electrical', isPrimary: true, contractAmount: 42000 },
      { projectId: 'j-002', projectName: 'Johnson Beach House', role: 'electrical', isPrimary: true, contractAmount: 38500 },
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'electrical', isPrimary: true, contractAmount: 67000 },
    ],
    createdAt: '2023-08-01',
    version: 8,
  },
  {
    id: '10',
    contactType: 'vendor',
    firstName: 'Maria',
    lastName: 'Gonzalez',
    companyName: 'Coastal Plumbing Co.',
    displayName: 'Coastal Plumbing Co.',
    title: 'Operations Manager',
    email: 'maria@coastalplumbing.com',
    phone: '(555) 444-7777',
    mobile: '(555) 444-7778',
    website: 'www.coastalplumbing.com',
    address: '320 Industrial Park, Austin, TX 78748',
    tags: ['Plumbing', 'Backup'],
    isFavorite: false,
    status: 'active',
    licenseNumber: 'PLM-TX-56789',
    insuranceExpiry: '2026-03-01',
    insuranceStatus: 'expiring',
    w9OnFile: true,
    paymentTerms: 'net_15',
    taxId: '**-***5678',
    projectAssignments: [
      { projectId: 'j-005', projectName: 'Davis Addition', role: 'plumbing', isPrimary: true, contractAmount: 18000 },
    ],
    createdAt: '2024-11-15',
    version: 3,
  },
  {
    id: '11',
    contactType: 'engineer',
    firstName: 'Karen',
    lastName: 'Patel',
    companyName: 'EcoSystems MEP',
    displayName: 'Karen Patel',
    title: 'MEP Engineer, PE',
    email: 'kpatel@ecosystemsmep.com',
    phone: '(555) 222-8888',
    address: '420 Tech Center, Austin, TX 78759',
    tags: ['MEP', 'Energy Modeling', 'LEED'],
    isFavorite: false,
    status: 'active',
    licenseNumber: 'PE-TX-45678',
    projectAssignments: [
      { projectId: 'j-008', projectName: 'Parker Estate', role: 'mep_engineer', isPrimary: true },
      { projectId: 'j-010', projectName: 'Bay Vista Home', role: 'mep_engineer', isPrimary: true },
    ],
    createdAt: '2025-03-01',
    version: 1,
  },
  {
    id: '12',
    contactType: 'architect',
    firstName: 'Gerald',
    lastName: 'Wu',
    companyName: 'Wu Designs LLC',
    displayName: 'Gerald Wu',
    title: 'Architect, AIA',
    email: 'gerald@wudesigns.com',
    phone: '(555) 111-5555',
    tags: ['Modern', 'Minimalist'],
    isFavorite: false,
    status: 'archived',
    licenseNumber: 'ARC-2023-5678',
    projectAssignments: [],
    createdAt: '2023-05-01',
    version: 4,
  },
]

// ---------------------------------------------------------------------------
// Contact type styling
// ---------------------------------------------------------------------------

const contactTypeConfig: Record<ContactType, { label: string; bgColor: string; textColor: string }> = {
  client: { label: 'Client', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  vendor: { label: 'Vendor', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
  architect: { label: 'Architect', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  engineer: { label: 'Engineer', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  designer: { label: 'Designer', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
  lender: { label: 'Lender', bgColor: 'bg-violet-100', textColor: 'text-violet-700' },
  realtor: { label: 'Realtor', bgColor: 'bg-rose-100', textColor: 'text-rose-700' },
  inspector: { label: 'Inspector', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
  other: { label: 'Other', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
}

const categories = ['All', 'client', 'vendor', 'architect', 'engineer', 'designer', 'lender', 'realtor', 'inspector', 'other'] as const

// ---------------------------------------------------------------------------
// ContactCard
// ---------------------------------------------------------------------------

function ContactCard({ contact }: { contact: Contact }) {
  const typeStyle = contactTypeConfig[contact.contactType]

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer",
      contact.status === 'archived' && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center",
            typeStyle.bgColor
          )}>
            <User className={cn("h-5 w-5", typeStyle.textColor)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">
                {contact.displayName}
              </h4>
              {contact.isFavorite && (
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              )}
              {contact.status === 'archived' && (
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Archived
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{contact.title}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        {contact.companyName && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span>{contact.companyName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{contact.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span>{contact.phone}</span>
          {contact.mobile && (
            <>
              <span className="text-gray-300">|</span>
              <Smartphone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span>{contact.mobile}</span>
            </>
          )}
        </div>
        {contact.website && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{contact.website}</span>
          </div>
        )}
        {contact.address && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {contact.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Vendor-specific fields */}
      {contact.contactType === 'vendor' && (
        <div className="bg-orange-50 rounded p-2 mb-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <Shield className="h-3 w-3" /> Insurance:
            </span>
            <span className={cn(
              "px-1.5 py-0.5 rounded font-medium",
              contact.insuranceStatus === 'valid' ? 'bg-green-100 text-green-700' :
              contact.insuranceStatus === 'expiring' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            )}>
              {contact.insuranceExpiry} ({contact.insuranceStatus})
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <FileText className="h-3 w-3" /> W-9:
            </span>
            <span className={cn(
              "font-medium",
              contact.w9OnFile ? "text-green-600" : "text-red-600"
            )}>
              {contact.w9OnFile ? 'On File' : 'Missing'}
            </span>
          </div>
          {contact.paymentTerms && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Terms:
              </span>
              <span className="font-medium text-gray-700">
                {contact.paymentTerms === 'net_30' ? 'Net 30' :
                 contact.paymentTerms === 'net_15' ? 'Net 15' :
                 contact.paymentTerms === 'due_on_receipt' ? 'Due on Receipt' :
                 contact.paymentTerms}
              </span>
            </div>
          )}
          {contact.licenseNumber && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> License:
              </span>
              <span className="font-medium text-gray-700">{contact.licenseNumber}</span>
            </div>
          )}
        </div>
      )}

      {/* Client-specific fields */}
      {contact.contactType === 'client' && contact.clientSource && (
        <div className="bg-emerald-50 rounded p-2 mb-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1">
              <UserPlus className="h-3 w-3" /> Source:
            </span>
            <span className="font-medium text-gray-700 capitalize">{contact.clientSource}</span>
          </div>
          {contact.referredBy && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Referred by:</span>
              <span className="font-medium text-gray-700">{contact.referredBy}</span>
            </div>
          )}
        </div>
      )}

      {/* License for non-vendors (architects, engineers, inspectors) */}
      {contact.contactType !== 'vendor' && contact.contactType !== 'client' && contact.licenseNumber && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Briefcase className="h-3 w-3" />
          License: <span className="font-medium text-gray-700">{contact.licenseNumber}</span>
        </div>
      )}

      {/* Footer: type badge + project count + module badge */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2 py-1 rounded font-medium",
            typeStyle.bgColor, typeStyle.textColor,
          )}>
            {typeStyle.label}
          </span>
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Module 3</span>
        </div>
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {contact.projectAssignments.length} project{contact.projectAssignments.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Project assignments summary (top 3) */}
      {contact.projectAssignments.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {contact.projectAssignments.slice(0, 3).map(pa => (
            <div key={pa.projectId} className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                {pa.projectName}
                {pa.isPrimary && <span className="text-blue-500 font-medium">(Primary)</span>}
              </span>
              {pa.contractAmount && (
                <span className="font-medium text-gray-600">${pa.contractAmount.toLocaleString()}</span>
              )}
            </div>
          ))}
          {contact.projectAssignments.length > 3 && (
            <div className="text-xs text-blue-600">+{contact.projectAssignments.length - 3} more</div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          Call
        </button>
        <button className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          Email
        </button>
        <button className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          View Profile
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ContactsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'All' })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  // Stats
  const activeContacts = mockContacts.filter(c => c.status === 'active')
  const archivedContacts = mockContacts.filter(c => c.status === 'archived')
  const favoriteCount = mockContacts.filter(c => c.isFavorite).length
  const vendorsWithExpiringInsurance = mockContacts.filter(c =>
    c.contactType === 'vendor' && (c.insuranceStatus === 'expiring' || c.insuranceStatus === 'expired')
  ).length
  const totalProjectLinks = mockContacts.reduce((sum, c) => sum + c.projectAssignments.length, 0)

  const filtered = sortItems(
    mockContacts.filter(contact => {
      if (!matchesSearch(contact, search, ['firstName', 'lastName', 'companyName', 'displayName', 'email', 'title', 'tags'])) return false
      if (activeTab !== 'All' && contact.contactType !== activeTab) return false
      if (showFavoritesOnly && !contact.isFavorite) return false
      if (!showArchived && contact.status === 'archived') return false
      return true
    }),
    activeSort as keyof Contact | '',
    sortDirection,
  )

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Contacts Directory</h3>
          <span className="text-sm text-gray-500">{activeContacts.length} active contacts</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Module 3</span>
          {vendorsWithExpiringInsurance > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {vendorsWithExpiringInsurance} insurance alert{vendorsWithExpiringInsurance !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contacts by name, company, email, tags..."
          tabs={categories.map(cat => ({
            key: cat,
            label: cat === 'All' ? 'All' : contactTypeConfig[cat as ContactType]?.label || cat,
            count: cat === 'All'
              ? mockContacts.filter(c => showArchived || c.status !== 'archived').length
              : mockContacts.filter(c => c.contactType === cat && (showArchived || c.status !== 'archived')).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'lastName', label: 'Last Name' },
            { value: 'companyName', label: 'Company' },
            { value: 'contactType', label: 'Type' },
            { value: 'createdAt', label: 'Date Added' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Contact', onClick: () => {}, variant: 'primary' }]}
          resultCount={filtered.length}
          totalCount={mockContacts.length}
        >
          {/* Extra filter controls */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
              showFavoritesOnly
                ? "bg-amber-100 text-amber-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Star className={cn("h-4 w-4", showFavoritesOnly && "fill-amber-500")} />
            Favorites
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
              showArchived
                ? "bg-gray-200 text-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Archive className="h-4 w-4" />
            Show Archived ({archivedContacts.length})
          </button>
        </FilterBar>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5">
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <span className="text-gray-500">Active: <span className="font-medium text-gray-900">{activeContacts.length}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Favorites: <span className="font-medium text-gray-900">{favoriteCount}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Project Links: <span className="font-medium text-gray-900">{totalProjectLinks}</span></span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Types:
            {Object.entries(
              mockContacts.filter(c => c.status === 'active').reduce<Record<string, number>>((acc, c) => {
                acc[c.contactType] = (acc[c.contactType] || 0) + 1
                return acc
              }, {})
            ).map(([type, count]) => (
              <span key={type} className={cn("ml-1.5 text-xs px-1.5 py-0.5 rounded font-medium", contactTypeConfig[type as ContactType].bgColor, contactTypeConfig[type as ContactType].textColor)}>
                {contactTypeConfig[type as ContactType].label}: {count}
              </span>
            ))}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Archived: <span className="font-medium text-gray-900">{archivedContacts.length}</span></span>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
        {filtered.map(contact => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            No contacts found
          </div>
        )}
      </div>

      {/* AI Insights Bar */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-sm text-amber-800">AI Insights:</span>
          </div>
          <div className="text-sm text-amber-700 space-y-1">
            <div>John Smith (Architect) has worked on 5 similar coastal projects. Consider involving him early on Bay Vista design.</div>
            <div>Coastal Plumbing Co. insurance expires March 1 -- request updated COI now to avoid project delays.</div>
            <div>Potential duplicate: "Gerald Wu" (archived) and "Wu Designs LLC" may reference the same contact.</div>
          </div>
        </div>
      </div>

      {/* AI Features Panel */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <AIFeaturesPanel
          title="AI Features for Contacts"
          columns={2}
          features={[
            {
              feature: 'Duplicate Detection',
              trigger: 'real-time',
              insight: 'Identifies potential duplicate contacts based on name, email, phone, and company matching algorithms.',
              detail: 'Found 2 potential duplicates: "Gerald Wu" and "Wu Designs LLC" share similar company patterns.',
              severity: 'warning',
              confidence: 85,
            },
            {
              feature: 'Relationship Mapping',
              trigger: 'on-change',
              insight: 'Shows connections between contacts across projects, companies, and referral networks.',
              detail: 'Sarah Johnson (Realtor) has referred 3 clients including James Parker. Strong referral source.',
              severity: 'info',
              confidence: 92,
            },
            {
              feature: 'Contact Enrichment',
              trigger: 'daily',
              insight: 'Suggests additional info from public sources like LinkedIn, company websites, and business directories.',
              detail: 'Found updated credentials for Bob Wilson: PE license renewed through 2027.',
              severity: 'success',
              confidence: 78,
            },
            {
              feature: 'Engagement Scoring',
              trigger: 'real-time',
              insight: 'Ranks contacts by interaction frequency including emails, calls, and project involvement.',
              detail: 'Top engaged contacts: Rick Torres (12 interactions/month), Lisa Chen (8/month), Bob Wilson (7/month).',
              severity: 'info',
              confidence: 95,
            },
            {
              feature: 'Role Classification',
              trigger: 'on-creation',
              insight: 'Auto-categorizes contacts by role type based on title, company, and project assignments.',
              detail: 'Suggested reclassification: Mike Brown from "Other" to new category "Legal/Compliance".',
              severity: 'info',
              confidence: 88,
            },
          ]}
        />
      </div>
    </div>
  )
}
