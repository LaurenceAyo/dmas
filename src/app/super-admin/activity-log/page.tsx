'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

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
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 cursor-pointer ${value === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
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

// Document type with modal details
type Document = {
  id: number
  name: string
  type: string
  department: string
  dateReceived: string
  status: string
  submittedBy: string
  dateSubmitted: string
  correspondingOffice: string
  officeRemarks: string
  clientAcknowledgement: string
}

// Mock data with full details
const mockDocuments: Document[] = [
  {
    id: 1,
    name: 'Scholarship Grant Certificate',
    type: 'Financial Document',
    department: 'Accounting Office',
    dateReceived: '03/25/2025',
    status: 'Released',
    submittedBy: 'John Doe',
    dateSubmitted: 'March 1, 2026',
    correspondingOffice: "Dean's Office",
    officeRemarks: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam',
    clientAcknowledgement: 'Document received and acknowledged by the client.'
  },
  {
    id: 2,
    name: 'Scholarship Grant Certificate',
    type: 'Financial Document',
    department: 'Associate Dean',
    dateReceived: '03/25/2025',
    status: 'Denied',
    submittedBy: 'Jane Smith',
    dateSubmitted: 'March 2, 2026',
    correspondingOffice: 'Registrar Office',
    officeRemarks: 'Document incomplete. Missing required signatures.',
    clientAcknowledgement: 'Client notified of denial.'
  },
  {
    id: 3,
    name: 'Scholarship Grant Certificate',
    type: 'Financial Document',
    department: 'Associate Dean',
    dateReceived: '03/25/2025',
    status: 'Approved',
    submittedBy: 'Alice Brown',
    dateSubmitted: 'March 3, 2026',
    correspondingOffice: 'Finance Office',
    officeRemarks: 'All requirements met. Proceeding to next stage.',
    clientAcknowledgement: 'Waiting for client response.'
  },
]

// Generate more documents
for (let i = 4; i <= 20; i++) {
  mockDocuments.push({
    id: i,
    name: 'Scholarship Grant Certificate',
    type: i % 2 === 0 ? 'Financial Document' : 'Historical Document',
    department: i % 3 === 0 ? 'Supply Office' : 'Accounting Office',
    dateReceived: '03/25/2025',
    status: ['Released', 'Denied', 'Approved'][i % 3],
    submittedBy: `User ${i}`,
    dateSubmitted: `March ${i}, 2026`,
    correspondingOffice: ["Dean's Office", 'Registrar Office', 'Finance Office'][i % 3],
    officeRemarks: 'Standard processing remarks for this document.',
    clientAcknowledgement: 'Pending client acknowledgement.'
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
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
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

  // Get progress step based on status
  const getProgressSteps = (status: string) => {
    const steps = [
      { label: 'Submitted', active: true, completed: true },
      { label: 'Under Review', active: status !== 'Submitted', completed: status !== 'Submitted' },
      { label: 'For Recommendation', active: ['Approved', 'Released'].includes(status), completed: ['Approved', 'Released'].includes(status) },
      { label: 'Approved', active: status === 'Approved' || status === 'Released', completed: status === 'Approved' || status === 'Released' },
      { label: 'Released', active: status === 'Released', completed: status === 'Released' }
    ]
    return steps
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
          <NotificationBell />
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
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
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
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition cursor-pointer ${currentPage === page
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

      {/* MODAL - Document Tracking Details */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">Document Tracking Details</h2>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Tracker */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="relative flex items-start justify-between px-4">
                {getProgressSteps(selectedDoc.status).map((step, index) => (
                  <div key={index} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                    {/* Line connecting to next circle (drawn BEFORE the circle) */}
                    {index < getProgressSteps(selectedDoc.status).length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 ${getProgressSteps(selectedDoc.status)[index + 1].completed
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                          }`}
                        style={{ zIndex: 0 }}
                      />
                    )}

                    {/* Circle with 3px black outline */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-[1px] border-black relative z-10 ${step.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-400'
                        }`}
                    >
                      {step.completed ? '' : ''}
                    </div>

                    {/* Label */}
                    <p
                      className={`text-xs mt-3 text-center leading-tight ${step.active ? 'text-gray-800 font-medium' : 'text-gray-400'
                        }`}
                      style={{ maxWidth: '80px' }}
                    >
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Details */}
            <div className="px-6 py-6 grid grid-cols-2 gap-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Document Name:</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Document Type:</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted By:</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.submittedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date Submitted:</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.dateSubmitted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Corresponding office:</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.correspondingOffice}</p>
              </div>
            </div>

            {/* Office Remarks */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Office Remarks</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedDoc.officeRemarks}
                </p>
              </div>
            </div>

            {/* Client Acknowledgement */}
            <div className="px-6 py-6">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Client Acknowledgement:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {selectedDoc.clientAcknowledgement}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}