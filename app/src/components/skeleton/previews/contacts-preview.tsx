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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterBar } from '@/components/skeleton/filter-bar'
import { useFilterState, matchesSearch, sortItems } from '@/hooks/use-filter-state'

interface Contact {
  id: string
  firstName: string
  lastName: string
  company: string
  title: string
  category: string
  email: string
  phone: string
  isFavorite: boolean
  projectCount: number
}

const mockContacts: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    company: 'ABC Architecture',
    title: 'Principal Architect, AIA',
    category: 'Architect',
    email: 'john@abcarch.com',
    phone: '(555) 222-3333',
    isFavorite: true,
    projectCount: 5,
  },
  {
    id: '2',
    firstName: 'Bob',
    lastName: 'Wilson',
    company: 'Coastal Engineering',
    title: 'Structural Engineer, PE',
    category: 'Engineer',
    email: 'bob@coastaleng.com',
    phone: '(555) 444-5555',
    isFavorite: true,
    projectCount: 8,
  },
  {
    id: '3',
    firstName: 'Tom',
    lastName: 'Davis',
    company: 'County Building Dept',
    title: 'Building Inspector',
    category: 'Inspector',
    email: 'tdavis@county.gov',
    phone: '(555) 666-7777',
    isFavorite: false,
    projectCount: 12,
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'Johnson Realty',
    title: 'Real Estate Agent',
    category: 'Realtor',
    email: 'sarah@johnsonrealty.com',
    phone: '(555) 888-9999',
    isFavorite: false,
    projectCount: 3,
  },
  {
    id: '5',
    firstName: 'Mike',
    lastName: 'Brown',
    company: 'Brown & Associates',
    title: 'Construction Attorney',
    category: 'Attorney',
    email: 'mike@brownlaw.com',
    phone: '(555) 111-2222',
    isFavorite: true,
    projectCount: 2,
  },
]

const categories = ['All', 'Architect', 'Engineer', 'Inspector', 'Realtor', 'Attorney']

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">
                {contact.firstName} {contact.lastName}
              </h4>
              {contact.isFavorite && (
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              )}
            </div>
            <p className="text-sm text-gray-500">{contact.title}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreHorizontal className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building className="h-4 w-4 text-gray-400" />
          <span>{contact.company}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{contact.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{contact.phone}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={cn(
          "text-xs px-2 py-1 rounded font-medium",
          contact.category === 'Architect' ? 'bg-blue-100 text-blue-700' :
          contact.category === 'Engineer' ? 'bg-green-100 text-green-700' :
          contact.category === 'Inspector' ? 'bg-purple-100 text-purple-700' :
          contact.category === 'Realtor' ? 'bg-pink-100 text-pink-700' :
          'bg-gray-100 text-gray-700'
        )}>
          {contact.category}
        </span>
        <span className="text-xs text-gray-500">
          {contact.projectCount} projects
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button className="flex-1 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          Call
        </button>
        <button className="flex-1 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          Email
        </button>
      </div>
    </div>
  )
}

export function ContactsPreview() {
  const { search, setSearch, activeTab, setActiveTab, activeSort, setActiveSort, sortDirection, toggleSortDirection } = useFilterState({ defaultTab: 'All' })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const filtered = sortItems(
    mockContacts.filter(contact => {
      if (!matchesSearch(contact, search, ['firstName', 'lastName', 'company', 'email', 'title'])) return false
      if (activeTab !== 'All' && contact.category !== activeTab) return false
      if (showFavoritesOnly && !contact.isFavorite) return false
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
          <h3 className="font-semibold text-gray-900">Contacts</h3>
          <span className="text-sm text-gray-500">{mockContacts.length} contacts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contacts..."
          tabs={categories.map(cat => ({
            key: cat,
            label: cat,
            count: cat === 'All' ? mockContacts.length : mockContacts.filter(c => c.category === cat).length,
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          sortOptions={[
            { value: 'lastName', label: 'Last Name' },
            { value: 'company', label: 'Company' },
            { value: 'projectCount', label: 'Projects' },
          ]}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          sortDirection={sortDirection}
          onSortDirectionChange={toggleSortDirection}
          actions={[{ icon: Plus, label: 'Add Contact', onClick: () => {}, variant: 'primary' }]}
          resultCount={filtered.length}
          totalCount={mockContacts.length}
        >
          {/* Favorites toggle in children slot */}
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
            Favorites Only
          </button>
        </FilterBar>
      </div>

      {/* Contact Cards */}
      <div className="p-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
            <span className="font-medium text-sm text-amber-800">AI Insight:</span>
          </div>
          <div className="text-sm text-amber-700">
            John Smith (Architect) has worked on 5 similar coastal projects. Consider involving him early on Johnson Beach House design.
          </div>
        </div>
      </div>
    </div>
  )
}
