'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'


// Custom dropdown component
function CustomSelect({ options, value, onChange, placeholder }: {
  options: string[]
  value: string
  onChange: (val: string) => void
  placeholder: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative min-w-[180px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          <button
            onClick={() => {
              onChange('')
              setIsOpen(false)
            }}
            className="w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 cursor-pointer text-gray-500"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 cursor-pointer ${
                value === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Mock data
const mockDocuments = [
  { id: 1, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', dateReceived: '03/25/2025', status: 'Released' },
  { id: 2, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean', dateReceived: '03/25/2025', status: 'Denied' },
  { id: 3, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean', dateReceived: '03/25/2025', status: 'Approved' },
  { id: 4, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', dateReceived: '03/25/2025', status: 'Released' },
  { id: 5, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean', dateReceived: '03/25/2025', status: 'Denied' },
  { id: 6, name: 'Budget Report', type: 'Financial Document', department: 'Accounting Office', dateReceived: '03/26/2025', status: 'Approved' },
  { id: 7, name: 'Procurement Request', type: 'Requisition', department: 'Supply Office', dateReceived: '03/26/2025', status: 'Released' },
  { id: 8, name: 'Historical Archive Document', type: 'Historical Document', department: 'BAC', dateReceived: '03/27/2025', status: 'Approved' },
]

// Generate more documents to reach 20
for (let i = 9; i <= 20; i++) {
  mockDocuments.push({
    id: i,
    name: 'Scholarship Grant Certificate',
    type: i % 2 === 0 ? 'Financial Document' : 'Historical Document',
    department: i % 3 === 0 ? 'Supply Office' : 'Accounting Office',
    dateReceived: '03/25/2025',
    status: ['Released', 'Denied', 'Approved'][i % 3],
  })
}

const documentTypes = [...new Set(mockDocuments.map(d => d.type))]
const departments = [...new Set(mockDocuments.map(d => d.department))]
const statuses = [...new Set(mockDocuments.map(d => d.status))]

export default function ActivityLogPage() {
  const [selectedType, setSelectedType] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter documents
  const filteredDocs = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || doc.type === selectedType
    const matchesDept = !selectedDept || doc.department === selectedDept
    const matchesStatus = !selectedStatus || doc.status === selectedStatus
    return matchesSearch && matchesType && matchesDept && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  // Status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-cyan-100 text-cyan-700'
      case 'Denied':
        return 'bg-red-100 text-red-700'
      case 'Approved':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
          <p className="text-sm text-gray-400">Total: {mockDocuments.length}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Document..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 transition-all"
            />
          </div>
          
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* FILTER ROW */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          
          <CustomSelect
            options={documentTypes}
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val)
              setCurrentPage(1)
            }}
            placeholder="Document Type"
          />

          <CustomSelect
            options={departments}
            value={selectedDept}
            onChange={(val) => {
              setSelectedDept(val)
              setCurrentPage(1)
            }}
            placeholder="Submitting Department"
          />

          <CustomSelect
            options={statuses}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val)
              setCurrentPage(1)
            }}
            placeholder="Status"
          />
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Document Name</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Document Type</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Submitting Department</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Date Received</th>
                  <th className="text-left px-9 py-3.5 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">{doc.name}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.type}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.department}</td>
                    <td className="px-6 py-4 text-gray-600">{doc.dateReceived}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedDocs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {filteredDocs.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> of{' '}
              <span className="font-medium">{filteredDocs.length}</span> active documents
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                      currentPage === page
                        ? 'bg-gray-800 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}