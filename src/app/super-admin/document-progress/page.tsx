'use client'

import { useState, useRef, useEffect } from 'react'
import { Filter, Search, Bell, ChevronLeft, ChevronRight, ChevronDown, X, Eye } from 'lucide-react'

// Custom dropdown component – now supports both string[] and { label: string, value: string }[]
function CustomSelect({ options, value, onChange, placeholder, minWidth }: {
  options: string[] | { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
  placeholder: string
  minWidth: string
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

  // Normalize options to always be objects with label and value
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  // Find the selected option's label to display in the button
  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || ''

  return (
    <div className={`relative ${minWidth}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition cursor-pointer"
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
          {normalizedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-50 cursor-pointer ${
                value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentProgressPage() {
  // ------------------------------------------------------------
  // STATE – filters and search
  // ------------------------------------------------------------
  const [selectedType, setSelectedType] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // ------------------------------------------------------------
  // PAGINATION STATE
  // ------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // ------------------------------------------------------------
  // MODAL STATE – which document is selected (null = no modal)
  // ------------------------------------------------------------
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null)

  // ------------------------------------------------------------
  // MODAL INTERNAL DROPDOWN STATES
  // ------------------------------------------------------------
  const [actionTaken, setActionTaken] = useState('')
  const [corrOffice, setCorrOffice] = useState('')
  const [remarks, setRemarks] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Reset modal fields when a new document is opened
  useEffect(() => {
    if (selectedDoc) {
      setActionTaken('')
      setCorrOffice('')
      setRemarks('')
      setSubmitError('')
      setShowConfirmModal(false)
    }
  }, [selectedDoc])

  // ------------------------------------------------------------
  // MOCK DATA (20 documents) – includes description, submittedBy, lastUpdate, and imageUrl for demo
  // ------------------------------------------------------------
  const documents = [
    {
      id: 1,
      name: 'Request Stock Items',
      type: 'Requisition and Issue Slip (RIS)',
      department: 'Supply Office',
      dateReceived: '03/25/2025',
      status: 'Received',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      submittedBy: 'John Doe',
      lastUpdate: '03/26/2025',
      imageUrl: '/sample.jpg', // ← Add this field to test the preview button
    },
    { id: 2, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Supply Office', dateReceived: '03/25/2025', status: 'Approved', description: 'Sample description', submittedBy: 'Jane Smith', lastUpdate: '03/26/2025' },
    { id: 3, name: 'Scholarship Award Certificate', type: 'Financial Document', department: 'BAC', dateReceived: '03/25/2025', status: 'Pending', description: 'Sample description', submittedBy: 'Alice Brown', lastUpdate: '03/26/2025' },
    { id: 4, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean', dateReceived: '03/25/2025', status: 'Released', description: 'Sample description', submittedBy: 'Bob Johnson', lastUpdate: '03/26/2025' },
    { id: 5, name: 'Scholarship Grant Certificate', type: 'Historical Document', department: 'Associate Dean', dateReceived: '03/25/2025', status: 'Denied', description: 'Sample description', submittedBy: 'Charlie Lee', lastUpdate: '03/26/2025' },
    { id: 6, name: 'Scholarships Grant Certificate', type: 'Historical Document', department: 'Associate Dean', dateReceived: '03/25/2025, 03/25/2025', status: 'Received', description: 'Sample description', submittedBy: 'Diana Prince', lastUpdate: '03/26/2025' },
    { id: 7, name: 'Scholarships Grant Certificate', type: 'Historical Document', department: 'Associate Dean', dateReceived: '03/25/2025, 03/25/2025', status: 'Approved', description: 'Sample description', submittedBy: 'Ethan Hunt', lastUpdate: '03/26/2025' },
    { id: 8, name: 'Scholarships Grant Certificate', type: 'Historical Document', department: 'Associate Dean', dateReceived: '03/25/2025, 03/25/2025', status: 'Pending', description: 'Sample description', submittedBy: 'Fiona Glen', lastUpdate: '03/26/2025' },
    { id: 9, name: 'Budget Report', type: 'Financial Document', department: 'Accounting', dateReceived: '03/26/2025', status: 'Received', description: 'Sample description', submittedBy: 'George Costanza', lastUpdate: '03/27/2025' },
    { id: 10, name: 'Procurement Request', type: 'Requisition', department: 'Supply Office', dateReceived: '03/26/2025', status: 'Approved', description: 'Sample description', submittedBy: 'Hank Hill', lastUpdate: '03/27/2025' },
    { id: 11, name: 'Travel Authorization', type: 'Form', department: 'HR', dateReceived: '03/27/2025', status: 'Denied', description: 'Sample description', submittedBy: 'Ivy League', lastUpdate: '03/28/2025' },
    { id: 12, name: 'Meeting Minutes', type: 'Minutes', department: 'Board', dateReceived: '03/27/2025', status: 'Released', description: 'Sample description', submittedBy: 'Jack Sparrow', lastUpdate: '03/28/2025' },
    { id: 13, name: 'Contract Renewal', type: 'Legal', department: 'Legal', dateReceived: '03/28/2025', status: 'Pending', description: 'Sample description', submittedBy: 'Kate Austen', lastUpdate: '03/29/2025' },
    { id: 14, name: 'Purchase Order', type: 'Order', department: 'Procurement', dateReceived: '03/28/2025', status: 'Received', description: 'Sample description', submittedBy: 'Leo Messi', lastUpdate: '03/29/2025' },
    { id: 15, name: 'Invoice', type: 'Financial', department: 'Accounting', dateReceived: '03/29/2025', status: 'Approved', description: 'Sample description', submittedBy: 'Mona Lisa', lastUpdate: '03/30/2025' },
    { id: 16, name: 'Receipt', type: 'Financial', department: 'Accounting', dateReceived: '03/29/2025', status: 'Denied', description: 'Sample description', submittedBy: 'Ned Stark', lastUpdate: '03/30/2025' },
    { id: 17, name: 'Application Form', type: 'Form', department: 'HR', dateReceived: '03/30/2025', status: 'Received', description: 'Sample description', submittedBy: 'Oscar Wilde', lastUpdate: '03/31/2025' },
    { id: 18, name: 'Evaluation Report', type: 'Report', department: 'Academic', dateReceived: '03/30/2025', status: 'Pending', description: 'Sample description', submittedBy: 'Peter Pan', lastUpdate: '03/31/2025' },
    { id: 19, name: 'Certificate of Attendance', type: 'Certificate', department: 'Training', dateReceived: '03/31/2025', status: 'Released', description: 'Sample description', submittedBy: 'Quinn Fabray', lastUpdate: '04/01/2025' },
    { id: 20, name: 'Memorandum', type: 'Memo', department: 'Executive', dateReceived: '03/31/2025', status: 'Approved', description: 'Sample description', submittedBy: 'Rick Grimes', lastUpdate: '04/01/2025' },
  ]

  // ------------------------------------------------------------
  // UNIQUE VALUES FOR DROPDOWNS (used in filter bar)
  // ------------------------------------------------------------
  const documentTypes = [...new Set(documents.map(d => d.type))]
  const departments = [...new Set(documents.map(d => d.department))]

  // Status dropdown options – using objects to display "Pending Approval" but filter by "Pending"
  const statusOptions = [
    { label: 'Received', value: 'Received' },
    { label: 'Released', value: 'Released' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Denied', value: 'Denied' },
    { label: 'Pending Approval', value: 'Pending' },
  ]

  // Options for Action Taken dropdown – updated "Pending" to "Pending Approval"
  const actionOptions = ['Received', 'Approved', 'Pending Approval', 'Released', 'Denied']

  // ------------------------------------------------------------
  // FILTERING LOGIC
  // ------------------------------------------------------------
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || doc.type === selectedType
    const matchesDept = !selectedDept || doc.department === selectedDept
    const matchesStatus = !selectedStatus || doc.status === selectedStatus
    return matchesSearch && matchesType && matchesDept && matchesStatus
  })

  // ------------------------------------------------------------
  // PAGINATION CALCULATIONS
  // ------------------------------------------------------------
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  // ------------------------------------------------------------
  // CLEAR ALL FILTERS
  // ------------------------------------------------------------
  const clearFilters = () => {
    setSelectedType('')
    setSelectedDept('')
    setSelectedStatus('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  // Helper to get badge color based on status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-700'
      case 'Released': return 'bg-green-100 text-green-700'
      case 'Approved': return 'bg-emerald-100 text-emerald-700'
      case 'Denied': return 'bg-red-100 text-red-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // ------------------------------------------------------------
  // MODAL HANDLERS
  // ------------------------------------------------------------
  const handleClear = () => {
    setActionTaken('')
    setCorrOffice('')
    setRemarks('')
    setSubmitError('')
  }

  const handleSubmitClick = () => {
    // Validation
    if (!actionTaken) {
      setSubmitError('Please select an action.')
      return
    }
    if (!corrOffice) {
      setSubmitError('Please select a corresponding office.')
      return
    }
    if (!remarks.trim()) {
      setSubmitError('Please write some remarks.')
      return
    }
    // If validation passes, show confirmation modal
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = () => {
    // Perform submit action (e.g., send data to server)
    alert('Submitted successfully!') // Replace with actual logic
    setSelectedDoc(null) // Close main modal
    setShowConfirmModal(false) // Close confirmation modal
  }

  const handleCancelConfirm = () => {
    setShowConfirmModal(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-[#1a2e4a]">Document Progress</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Document..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56"
            />
          </div>
          <button className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <Bell size={18} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Total */}
        <div className="mb-4">
          <span className="text-xs text-gray-400 font-medium">Total:</span>
          <span className="text-sm text-gray-700 ml-1">20</span>
        </div>

        {/* FILTER ROW */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <CustomSelect
            options={documentTypes}
            value={selectedType}
            onChange={(val) => {
              setSelectedType(val)
              setCurrentPage(1)
            }}
            placeholder="Document Type"
            minWidth="min-w-[150px]"
          />

          <CustomSelect
            options={departments}
            value={selectedDept}
            onChange={(val) => {
              setSelectedDept(val)
              setCurrentPage(1)
            }}
            placeholder="Submitting Department"
            minWidth="min-w-[160px]"
          />

          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val)
              setCurrentPage(1)
            }}
            placeholder="Status"
            minWidth="min-w-[120px]"
          />

          {(selectedType || selectedDept || selectedStatus || searchQuery) && (
            <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline ml-1">
              Clear
            </button>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-600 text-xs uppercase tracking-wide">
                <th className="text-left px-3 py-2 font-semibold w-[30%]">Document Name</th>
                <th className="text-left px-3 py-2 font-semibold w-[20%]">Document Type</th>
                <th className="text-left px-3 py-2 font-semibold w-[20%]">Submitting Department</th>
                <th className="text-left px-3 py-2 font-semibold w-[15%]">Date Received</th>
                <th className="text-center px-3 py-2 font-semibold w-[15%]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedDocs.map((doc) => (
                <tr
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-2 text-gray-700 font-medium truncate align-middle">{doc.name}</td>
                  <td className="px-3 py-2 text-gray-500 truncate align-middle">{doc.type}</td>
                  <td className="px-3 py-2 text-gray-500 truncate align-middle">{doc.department}</td>
                  <td className="px-3 py-2 text-gray-500 truncate align-middle">{doc.dateReceived}</td>
                  <td className="px-3 py-2 align-middle text-center">
                    <span className={`inline-flex items-center justify-center w-24 h-7 px-2 rounded-full text-xs font-medium whitespace-nowrap leading-5 ${getStatusBadgeColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-400 text-sm">
                    No documents match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {filteredDocs.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-gray-400 min-w-[180px]">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredDocs.length)} of {filteredDocs.length} active documents
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} className="text-gray-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer
                    ${currentPage === page
                      ? 'bg-[#1a2e4a] text-white'
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          DOCUMENT DETAIL MODAL – with working Clear and Submit + confirmation modal
          ============================================================ */}
      {selectedDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedDoc(null)}
        >
          {/* MODAL WIDTH – change max-w-2xl to adjust overall width (e.g., max-w-xl, max-w-3xl) */}
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with title and close button */}
            <div className="flex items-start justify-between px-4 pt-4 pb-1 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-800">{selectedDoc.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedDoc.type}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-400"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body – two‑column grid */}
            <div className="px-4 pt-2 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEFT COLUMN – description (no box) + optional preview button */}
                <div className="space-y-2">
                  {/* Description – scrollable, without border/background (clean look) */}
                  <div className="max-h-40 overflow-y-auto min-h-[250px]">
                    {selectedDoc.description ? (
                      <p className="text-xs text-gray-700 leading-relaxed">{selectedDoc.description}</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No description provided.</p>
                    )}
                  </div>

                  {/* Preview Image Button – appears only if imageUrl exists, with eye icon */}
                  {selectedDoc.imageUrl && (
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-700 hover:bg-gray-200 transition"
                      onClick={() => alert('Preview image – replace with actual viewer')}
                    >
                      <Eye size={16} className="text-gray-500" />
                      <span>Preview Image</span>
                    </button>
                  )}
                </div>

                {/* RIGHT COLUMN – metadata and dropdowns */}
                <div className="space-y-3">
                  {/* Metadata – each on its own line */}
                  <div className="space-y-1">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Date Received:</span>{' '}
                      <span className="text-xs text-gray-800">{selectedDoc.dateReceived}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Last Update:</span>{' '}
                      <span className="text-xs text-gray-800">{selectedDoc.lastUpdate}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Submitted By:</span>{' '}
                      <span className="text-xs text-gray-800">{selectedDoc.submittedBy}</span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-600">Submitting Department:</span>{' '}
                      <span className="text-xs text-gray-800">{selectedDoc.department}</span>
                    </div>
                  </div>

                  {/* Action Taken dropdown – updated options */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Action Taken:</p>
                    <CustomSelect
                      options={actionOptions}
                      value={actionTaken}
                      onChange={setActionTaken}
                      placeholder="Select action"
                      minWidth="w-full"
                    />
                  </div>

                  {/* Corresponding Office dropdown */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-1">Corresponding Office:</p>
                    <CustomSelect
                      options={departments}
                      value={corrOffice}
                      onChange={setCorrOffice}
                      placeholder="Select office"
                      minWidth="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Separator after columns */}
              <hr className="border-gray-100 my-3" />

              {/* Remarks with state */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Remarks:</p>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Please write some remarks...."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              {/* Error message */}
              {submitError && (
                <p className="text-xs text-red-500 mb-2">{submitError}</p>
              )}

              {/* Buttons with handlers */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitClick}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================
              CONFIRMATION MODAL – appears after submit click
              ============================================================ */}
          {showConfirmModal && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
              onClick={handleCancelConfirm}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-semibold text-gray-800 mb-2">Confirm Submission</h3>
                <p className="text-sm text-gray-600 mb-4">Are you sure you want to submit these remarks and actions?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleCancelConfirm}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}