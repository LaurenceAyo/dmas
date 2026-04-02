'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Filter, Search, ChevronLeft, ChevronRight, ChevronDown, 
  Eye, Trash2, X, Download, Printer, ZoomIn, ZoomOut 
} from 'lucide-react'

// Custom dropdown component
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

// Helper to get month name from a timestamp
const getMonthFromDate = (date: Date | null) => {
  if (!date) return ''
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return monthNames[date.getMonth()]
}

// Filter options (static)
const yearOptions = (() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear; i >= 2020; i--) years.push(i.toString())
  return years
})()
const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const categoryOptions = ['Financial Document', 'Historical Document', 'Requisition', 'Form', 'Minutes', 'Legal', 'Order', 'Report', 'Certificate', 'Memo']

const deleteReasons = [
  'Outdated document',
  'Incorrect information',
  'Duplicate document',
  'Others'
]

export default function DigitalArchivePage() {
  const supabase = createClient()

  // Data state
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modal states
  const [previewDoc, setPreviewDoc] = useState<any>(null)
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [loadingUrl, setLoadingUrl] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [deleteDoc, setDeleteDoc] = useState<any>(null)
  const [showDeletedModal, setShowDeletedModal] = useState(false)

  // Delete reason states
  const [deleteReason, setDeleteReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // Print loading state
  const [isPrinting, setIsPrinting] = useState(false)

  // Fetch archived documents
  const fetchArchivedDocs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        department:department_id (name),
        submitter:submitted_by (full_name)
      `)
      .eq('is_archived', true)
      .order('archived_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching archived documents:', error)
      setError('Failed to load archived documents.')
    } else {
      setDocuments(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchArchivedDocs()
  }, [])

  // Filtering
  const filteredDocs = documents.filter(doc => {
    const departmentName = doc.department?.name || doc.department_id || 'N/A'
    const matchesSearch = searchQuery === '' || 
      doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      departmentName.toLowerCase().includes(searchQuery.toLowerCase())

    const archiveDate = doc.archived_at ? new Date(doc.archived_at) : null
    const docYear = archiveDate ? archiveDate.getFullYear().toString() : ''
    const docMonth = getMonthFromDate(archiveDate)
    const matchesYear = !selectedYear || docYear === selectedYear
    const matchesMonth = !selectedMonth || docMonth === selectedMonth
    const matchesCategory = !selectedCategory || doc.document_type === selectedCategory

    return matchesSearch && matchesYear && matchesMonth && matchesCategory
  })

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedYear, selectedMonth, selectedCategory, searchQuery])

  const clearFilters = () => {
    setSelectedYear('')
    setSelectedMonth('')
    setSelectedCategory('')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const isFilterActive = selectedYear || selectedMonth || selectedCategory || searchQuery

  // Handle preview with signed URL
  const handlePreview = async (doc: any) => {
    setPreviewDoc(doc)
    setZoomLevel(1)
    if (doc.file_url) {
      setLoadingUrl(true)
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_url, 60 * 60) // valid for 1 hour
      if (!error && data) {
        setFileUrl(data.signedUrl)
      } else {
        console.error('Signed URL error:', error)
        setFileUrl(null)
      }
      setLoadingUrl(false)
    } else {
      setFileUrl(null)
    }
  }

  // Zoom handlers
  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  const resetZoom = () => setZoomLevel(1)

  // Download: fetch as Blob and trigger download
  const handleDownload = async () => {
    if (!fileUrl) {
      alert('No file to download.')
      return
    }
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = previewDoc.file_name || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download the file.')
    }
  }

  // Print: fetch as Blob and print in hidden iframe (no new tab)
  const handlePrint = async () => {
    if (!fileUrl) {
      alert('No file to print.')
      return
    }
    setIsPrinting(true)
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Failed to fetch file')
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)

      const iframe = document.createElement('iframe')
      iframe.style.position = 'absolute'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      iframe.src = blobUrl
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print()
        } catch (err) {
          console.error('Print failed:', err)
          alert('Unable to print the file.')
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(blobUrl)
            setIsPrinting(false)
          }, 1000)
        }
      }
      iframe.onerror = () => {
        alert('Failed to load the file for printing.')
        document.body.removeChild(iframe)
        URL.revokeObjectURL(blobUrl)
        setIsPrinting(false)
      }
    } catch (err) {
      console.error('Print error:', err)
      alert('Failed to load the file for printing.')
      setIsPrinting(false)
    }
  }

  // Delete handlers
  const handleDeleteConfirm = async () => {
    if (!deleteReason) {
      setDeleteError('Please select a reason for deletion.')
      return
    }
    if (deleteReason === 'Others' && !otherReason.trim()) {
      setDeleteError('Please specify the reason.')
      return
    }

    const finalReason = deleteReason === 'Others' ? otherReason : deleteReason

    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('deletion_logs').insert({
      document_id: deleteDoc.id,
      deleted_by: user?.id,
      reason: finalReason,
    })

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', deleteDoc.id)

    if (error) {
      console.error('Delete error:', error)
      setDeleteError('Failed to delete document.')
      return
    }

    setDeleteDoc(null)
    setShowDeletedModal(true)
    setDeleteReason('')
    setOtherReason('')
    setDeleteError('')
    fetchArchivedDocs()
  }

  const handleCancelDelete = () => {
    setDeleteDoc(null)
    setDeleteReason('')
    setOtherReason('')
    setDeleteError('')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Digital Archive</h1>
          <span className="text-xs text-gray-400 font-medium">Total Archived:</span>{' '}
          <span className="text-sm text-gray-700">{filteredDocs.length}</span>
        </div>
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
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading archived documents...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
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
                    <th className="text-left px-4 py-3 font-semibold w-[20%]">Department</th>
                    <th className="text-left px-4 py-3 font-semibold w-[13%]">Date Archived</th>
                    <th className="text-center px-4 py-3 font-semibold w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-gray-700 font-medium truncate align-middle">{doc.title} </td>
                      <td className="px-4 py-3 text-gray-500 truncate align-middle">{doc.document_type}</td>
                      <td className="px-4 py-3 text-gray-500 truncate align-middle">
                        {doc.department?.name || doc.department_id || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate align-middle">
                        {doc.archived_at ? new Date(doc.archived_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            onClick={() => handlePreview(doc)}
                            title="Preview document"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition"
                            onClick={() => {
                              setDeleteDoc(doc)
                              setDeleteReason('')
                              setOtherReason('')
                              setDeleteError('')
                            }}
                            title="Delete permanently"
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
                  Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredDocs.length)} of {filteredDocs.length} archived documents
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
          </>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[99vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-9 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{previewDoc.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{previewDoc.document_type}</p>
                {previewDoc.submitter && (
                  <p className="text-xs text-gray-400 mt-1">Submitted by: {previewDoc.submitter.full_name}</p>
                )}
                {previewDoc.department && (
                  <p className="text-xs text-gray-400">Department: {previewDoc.department.name}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-400 cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-9 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {previewDoc.description || 'No description available.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-100 border border-gray-200 rounded-lg h-64 flex items-center justify-center text-gray-400 overflow-hidden">
                    {loadingUrl ? (
                      <span className="text-sm">Loading image...</span>
                    ) : fileUrl ? (
                      <div className="w-full h-full flex items-center justify-center overflow-auto">
                        <img
                          src={fileUrl}
                          alt="Preview"
                          style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease' }}
                          className="max-h-full max-w-full object-contain"
                          onError={() => {
                            setFileUrl(null);
                            console.error('Image failed to load');
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-sm">No file attached</span>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={zoomOut}
                      disabled={zoomLevel <= 0.5}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      title="Zoom out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <span className="text-xs text-gray-500 self-center min-w-[50px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={zoomIn}
                      disabled={zoomLevel >= 3}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                      title="Zoom in"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      onClick={resetZoom}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                      title="Reset zoom"
                    >
                      <span className="text-xs">Reset</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-3 border-t border-gray-100">
                <button
                  onClick={handleDownload}
                  className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Printer size={16} />
                  {isPrinting ? 'Preparing...' : 'Print'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
              Please select a reason for deleting <span className="font-medium">{deleteDoc.title}</span>:
            </p>

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

            {deleteReason === 'Others' && (
              <textarea
                placeholder="Please specify your reason..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 resize-none mb-4"
              />
            )}

            {deleteError && (
              <p className="text-xs text-red-500 mb-4">{deleteError}</p>
            )}

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

      {/* Success Modal */}
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