'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Filter, Search, Bell, ChevronLeft, ChevronRight, ChevronDown, 
  Eye, Trash2, X, Download, Printer 
} from 'lucide-react'

// Custom dropdown component (same as DocumentProgress)
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

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )
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

// Mock archived documents
const archivedDocs = [
  { 
    id: 1, 
    name: 'Transcript of Records', 
    type: 'Academic Record', 
    dateArchived: '03/25/2025', 
    department: 'Accounting Office',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    imageUrl: '/sample.jpg' // for preview
  },
  { id: 2, name: 'Scholarship Grant Certificate', type: 'Financial Document', dateArchived: '03/25/2025', department: 'Accounting Office', description: 'Sample description' },
  { id: 3, name: 'Scholarship Grant Certificate', type: 'Financial Document', dateArchived: '03/25/2025', department: 'Accounting Office', description: 'Sample description' },
  { id: 4, name: 'Scholarship Grant Certificate', type: 'Financial Document', dateArchived: '03/25/2025', department: 'Accounting Office', description: 'Sample description' },
  { id: 5, name: 'Scholarship Grant Certificate', type: 'Financial Document', dateArchived: '03/25/2025', department: 'Accounting Office', description: 'Sample description' },
]
for (let i = 6; i <= 20; i++) {
  archivedDocs.push({
    id: i,
    name: `Document ${i}`,
    type: i % 2 === 0 ? 'Financial Document' : 'Historical Document',
    dateArchived: '03/25/2025',
    department: i % 3 === 0 ? 'Supply Office' : 'Accounting Office',
    description: 'Sample description',
  })
}

// Filter options
const yearOptions = ['2025', '2024', '2023', '2022', '2021', '2020']
const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const categoryOptions = ['Financial Document', 'Historical Document', 'Requisition', 'Form', 'Minutes', 'Legal', 'Order', 'Report', 'Certificate', 'Memo']

// Delete reasons (customize as needed)
const deleteReasons = [
  'Outdated document',
  'Incorrect information',
  'Duplicate document',
  'Others'
]

export default function DigitalArchivePage() {
  // Filter states
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal states
  const [previewDoc, setPreviewDoc] = useState<typeof archivedDocs[0] | null>(null)
  const [deleteDoc, setDeleteDoc] = useState<typeof archivedDocs[0] | null>(null)
  const [showDeletedModal, setShowDeletedModal] = useState(false)

  // Delete reason states
  const [deleteReason, setDeleteReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // For now, no actual filtering – use all docs
  const filteredDocs = archivedDocs

  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  const applyFilters = () => {
    setCurrentPage(1)
    // Actual filtering logic goes here
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear('')
    setSelectedMonth('')
    setSelectedCategory('')
    setCurrentPage(1)
  }

  // Check if any filter is active (excluding search)
  const isFilterActive = selectedYear || selectedMonth || selectedCategory

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    // Validate reason
    if (!deleteReason) {
      setDeleteError('Please select a reason for deletion.')
      return
    }
    if (deleteReason === 'Others' && !otherReason.trim()) {
      setDeleteError('Please specify the reason.')
      return
    }

    // Here you would call your actual delete function with the reason
    // console.log('Deleting', deleteDoc?.name, 'Reason:', deleteReason === 'Others' ? otherReason : deleteReason)

    setDeleteDoc(null)
    setShowDeletedModal(true)
    // Reset reason states
    setDeleteReason('')
    setOtherReason('')
    setDeleteError('')
  }

  const handleCancelDelete = () => {
    setDeleteDoc(null)
    setDeleteReason('')
    setOtherReason('')
    setDeleteError('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header – title left, search + bell right */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-[#1a2e4a]">Digital Archive | Backlog Vault</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56"
            />
          </div>

        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Total Archived */}
        <div className="mb-4">
          <span className="text-xs text-gray-400 font-medium">Total Archived:</span>{' '}
          <span className="text-sm text-gray-700">{archivedDocs.length}</span>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>

          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            placeholder="Year"
            minWidth="min-w-[100px]"
          />

          <CustomSelect
            options={monthOptions}
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="Month"
            minWidth="min-w-[150px]"
          />

          <CustomSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Category"
            minWidth="min-w-[190px]"
          />

          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
          >
            Apply Filters
          </button>

          {isFilterActive && (
            <button
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:underline ml-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-gray-600 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold w-[25%]">Document Name</th>
                <th className="text-left px-4 py-3 font-semibold w-[20%]">Document Type</th>
                <th className="text-left px-4 py-3 font-semibold w-[20%]">Submitting Department</th>
                <th className="text-left px-4 py-3 font-semibold w-[13%]">Date Archived</th>
                <th className="text-center px-4 py-3 font-semibold w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 text-gray-700 font-medium truncate align-middle">{doc.name}</td>
                  <td className="px-4 py-3 text-gray-500 truncate align-middle">{doc.type}</td>
                  <td className="px-4 py-3 text-gray-500 truncate align-middle">{doc.department}</td>
                  <td className="px-4 py-3 text-gray-500 truncate align-middle">{doc.dateArchived}</td>
                  <td className="px-4 py-3 align-middle text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        onClick={() => setPreviewDoc(doc)}
                        title="Preview document"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        onClick={() => {
                          setDeleteDoc(doc)
                          setDeleteReason('')
                          setOtherReason('')
                          setDeleteError('')
                        }}
                        title="Delete document"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                    No archived documents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{previewDoc.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{previewDoc.type}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body – two columns */}
            <div className="px-10 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column – description */}
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {previewDoc.description || 'No description available.'}
                  </p>
                </div>

                {/* Right column – preview image placeholder */}
                <div className="bg-gray-100 border border-gray-200 rounded-lg h-95 flex items-center justify-center text-gray-400">
                  {previewDoc.imageUrl ? (
                    <img src={previewDoc.imageUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-sm">Preview image not available</span>
                  )}
                </div>
              </div>

              {/* Download & Print buttons – right aligned */}
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
                <button
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
                  onClick={() => alert('Download – replace with actual download logic')}
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
                  onClick={() => alert('Print – replace with actual print logic')}
                >
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal – with reason selection */}
      {deleteDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please select a reason for deleting <span className="font-medium">{deleteDoc.name}</span>:
            </p>

            {/* Reason radio buttons */}
            <div className="space-y-3 mb-4">
              {deleteReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition
                    ${deleteReason === reason
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason}
                    checked={deleteReason === reason}
                    onChange={() => {
                      setDeleteReason(reason)
                      setDeleteError('')
                      if (reason !== 'Others') setOtherReason('')
                    }}
                    className="accent-red-500"
                  />
                  <span className={`text-sm ${deleteReason === reason ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            {/* Other reason textarea */}
            {deleteReason === 'Others' && (
              <textarea
                placeholder="Please specify your reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 resize-none mb-4"
              />
            )}

            {/* Error message */}
            {deleteError && (
              <p className="text-xs text-red-500 mb-4">{deleteError}</p>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Deleted Success Modal */}
      {showDeletedModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setShowDeletedModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-sm text-gray-800 mb-4">Document has been deleted.</p>
            <button
              onClick={() => setShowDeletedModal(false)}
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}