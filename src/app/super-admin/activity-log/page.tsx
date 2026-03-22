'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStatusBadgeColor, formatStatus, getStepperCircleColor } from '@/lib/utils/status'

// ── Animation Style ───────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .animate-slide-in { animation: slide-in 0.3s ease-out; }
  `
  document.head.appendChild(style)
}

// ── Types ─────────────────────────────────────────────────────────────────
interface DocumentLog {
  id: string
  document_id: string
  action: string
  previous_status: string | null
  new_status: string | null
  remarks: string | null
  created_at: string
  performed_by: string | null
  office_id: string | null
  profiles: { full_name: string } | null
  departments: { name: string } | null
}

interface DocumentWithLogs {
  id: string
  title: string
  document_type: string | null
  document_type_detail: string | null
  status: string
  created_at: string
  submitted_by: string | null
  department_id: string | null
  departments: { name: string } | null
  profiles: { full_name: string } | null
  document_logs: DocumentLog[]
}

// ── Custom Select ─────────────────────────────────────────────────────────
function CustomSelect({ options, value, onChange, placeholder }: {
  options: { label: string; value: string }[]
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

  const selectedLabel = options.find(o => o.value === value)?.label || ''

  return (
    <div className="relative min-w-[180px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          <button
            onClick={() => { onChange(''); setIsOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition hover:bg-blue-50 cursor-pointer
                ${value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

const formatDateShort = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  })



// ── Main Page ─────────────────────────────────────────────────────────────
export default function ActivityLogPage() {
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────────────────
  const [documents, setDocuments]       = useState<DocumentWithLogs[]>([])
  const [departments, setDepartments]   = useState<{ id: string; name: string }[]>([])
  const [fetchLoading, setFetchLoading] = useState(true)
  const [fetchError, setFetchError]     = useState('')

  const [selectedDept, setSelectedDept]     = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [searchQuery, setSearchQuery]       = useState('')
  const [currentPage, setCurrentPage]       = useState(1)
  const itemsPerPage = 10

  const [selectedDoc, setSelectedDoc] = useState<DocumentWithLogs | null>(null)
  const [deniedTooltip, setDeniedTooltip] = useState<{
    show: boolean; message: string; docId: string | null
  }>({ show: false, message: '', docId: null })

  // ── Fetch Documents with Logs ─────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    setFetchLoading(true)
    setFetchError('')

    const { data, error } = await supabase
      .from('documents')
      .select(`
        id,
        title,
        document_type,
        document_type_detail,
        status,
        created_at,
        submitted_by,
        department_id,
        departments!documents_department_id_fkey ( name ),
        profiles!documents_submitted_by_fkey ( full_name ),
        document_logs (
          id,
          document_id,
          action,
          previous_status,
          new_status,
          remarks,
          created_at,
          performed_by,
          office_id,
          profiles!document_logs_performed_by_fkey ( full_name ),
          departments!document_logs_office_id_fkey ( name )
        )
      `)
      .eq('module_type', 'process_routing')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error.message)
      setFetchError('Failed to load activity logs. Please refresh.')
    } else {
      // Sort logs inside each document by created_at ascending
      const sorted = (data as any[]).map(doc => ({
        ...doc,
        document_logs: (doc.document_logs || []).sort(
          (a: DocumentLog, b: DocumentLog) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }))
      setDocuments(sorted)
    }

    setFetchLoading(false)
  }, [])

  const fetchDepartments = useCallback(async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name')
      .order('name')
    if (data) setDepartments(data)
  }, [])

  useEffect(() => {
    fetchDocuments()
    fetchDepartments()
  }, [fetchDocuments, fetchDepartments])

  // ── Filter ────────────────────────────────────────────────────────────
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept   = !selectedDept   || doc.departments?.name === selectedDept
    const matchesStatus = !selectedStatus || doc.status === selectedStatus
    return matchesSearch && matchesDept && matchesStatus
  })

  const totalPages    = Math.ceil(filteredDocs.length / itemsPerPage)
  const startIndex    = (currentPage - 1) * itemsPerPage
  const paginatedDocs = filteredDocs.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) =>
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))

  // ── Options ───────────────────────────────────────────────────────────
  const deptOptions = departments.map(d => ({ label: d.name, value: d.name }))
const statusOptions = [
  { label: 'Pending',         value: 'pending'              },
  { label: 'Received',        value: 'in_process'           },
  { label: 'Approved',        value: 'approved'             },
  { label: 'Pending Approval',value: 'recommended_approval' },
  { label: 'Denied',          value: 'denied'               },
  { label: 'Released',        value: 'released'             },
]

  // ── Row Click Handler ─────────────────────────────────────────────────
  const handleRowClick = (doc: DocumentWithLogs) => {
    if (doc.status === 'denied') {
      const lastLog = doc.document_logs[doc.document_logs.length - 1]
      setDeniedTooltip({
        show: true,
        message: lastLog?.remarks || 'Document was denied by the office.',
        docId: doc.id,
      })
      setTimeout(() => setDeniedTooltip({ show: false, message: '', docId: null }), 5000)
    } else {
      setSelectedDoc(doc)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
          <p className="text-sm text-gray-400">Total: {filteredDocs.length} documents</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Document..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <CustomSelect
            options={deptOptions}
            value={selectedDept}
            onChange={(val) => { setSelectedDept(val); setCurrentPage(1) }}
            placeholder="Submitting Department"
          />
          <CustomSelect
            options={statusOptions}
            value={selectedStatus}
            onChange={(val) => { setSelectedStatus(val); setCurrentPage(1) }}
            placeholder="Status"
          />
          {(selectedDept || selectedStatus || searchQuery) && (
            <button
              onClick={() => { setSelectedDept(''); setSelectedStatus(''); setSearchQuery(''); setCurrentPage(1) }}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {fetchError}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
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
              {fetchLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedDocs.length > 0 ? (
                paginatedDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => handleRowClick(doc)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer
                      ${doc.status === 'denied' ? 'bg-red-50/60' : ''}`}
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">{doc.title}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {doc.document_type
                        ? `${doc.document_type}${doc.document_type_detail ? ` — ${doc.document_type_detail}` : ''}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.departments?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDateShort(doc.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(doc.status)}`}>
                        {formatStatus(doc.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!fetchLoading && filteredDocs.length > 0 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredDocs.length)} of {filteredDocs.length} documents
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40"
              >
                <ChevronLeft size={14} className="text-gray-500" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition cursor-pointer
                    ${currentPage === page ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-40"
              >
                <ChevronRight size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Denied Tooltip ── */}
      {deniedTooltip.show && (
        <div className="fixed top-20 right-8 z-50 animate-slide-in">
          <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-start gap-3 min-w-[300px] max-w-[400px]">
            <div className="flex-1">
              <p className="font-bold text-sm mb-1">Document Denied</p>
              <p className="text-xs opacity-90">{deniedTooltip.message}</p>
            </div>
            <button
              onClick={() => setDeniedTooltip({ show: false, message: '', docId: null })}
              className="text-white hover:bg-red-600 rounded p-1 transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Document Detail Modal ── */}
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
              <div>
                <h2 className="text-lg font-bold text-gray-800">Document Tracking Details</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selectedDoc.title}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress Stepper */}
            {/* Dynamic Progress Stepper — based on actual document logs */}
            <div className="px-6 py-6 border-b border-gray-100 overflow-x-auto">
              <div className="relative flex items-start justify-start gap-0 min-w-max mx-auto">
                {selectedDoc.document_logs.length === 0 ? (

                  // No logs yet — show just "Submitted"
                  <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                    <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.2)] z-10" />
                    <p className="text-[10px] font-bold mt-3 text-center uppercase tracking-wider text-gray-800 leading-tight" style={{ maxWidth: '70px' }}>
                      Submitted
                    </p>
                  </div>

                ) : (
                  // Build steps from actual document_logs
                  (() => {
                    // Build step list: Submitted first, then each log entry
                    const steps = [
                      {
                        label: 'Submitted',
                        sublabel: selectedDoc.departments?.name ?? '',
                        status: 'submitted',
                        completed: true,
                      },
                      ...selectedDoc.document_logs.map((log) => ({
                        label: log.departments?.name ?? log.action,
                        sublabel: formatStatus(log.new_status ?? ''),
                        status: log.new_status ?? '',
                        completed: true,
                      }))
                    ]

                    return steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start relative"
                        style={{ minWidth: '90px', flex: 1 }}
                      >
                        {/* Connector line between steps */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-3.5 left-1/2 w-full h-[3px] bg-green-400 z-0" />
                        )}

                        {/* Step content */}
                        <div className="flex flex-col items-center w-full relative z-10">
                          {/* Circle */}
                          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0
  ${getStepperCircleColor(step.status)}`}
/>

                          {/* Office/Step Name */}
                          <p className="text-[10px] font-bold mt-2 text-center uppercase tracking-wide text-gray-700 leading-tight px-1"
                            style={{ maxWidth: '85px' }}
                          >
                            {step.label}
                          </p>

                          {/* Status sublabel */}
                          {step.sublabel && step.status !== 'submitted' && (
                            <span className={`mt-1 inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold
                              ${getStatusBadgeColor(step.status)}`}
                            >
                              {step.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  })()
                )}
              </div>
            </div>

            {/* Document Details */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Document Name</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Document Type</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedDoc.document_type ?? '—'}
                  {selectedDoc.document_type_detail ? ` — ${selectedDoc.document_type_detail}` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Submitted By</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.profiles?.full_name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Submitting Department</p>
                <p className="text-sm font-medium text-gray-800">{selectedDoc.departments?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Date Submitted</p>
                <p className="text-sm font-medium text-gray-800">{formatDateShort(selectedDoc.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Current Status</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedDoc.status)}`}>
                  {formatStatus(selectedDoc.status)}
                </span>
              </div>
            </div>

            {/* Document Journey / Logs */}
            <div className="px-6 py-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Document Journey</h3>

              {selectedDoc.document_logs.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No activity recorded yet.</p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100" />

                  <div className="space-y-4">
                    {selectedDoc.document_logs.map((log, index) => (
                      <div key={log.id} className="flex gap-4 relative">
                        {/* Dot */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 mt-0.5
  ${getStepperCircleColor(log.new_status ?? '')}`}
/>

                        {/* Content */}
                        <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="text-xs font-semibold text-gray-800">{log.action}</p>
                              {log.new_status && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  {log.previous_status && (
                                    <>
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeColor(log.previous_status)}`}>
                                        {formatStatus(log.previous_status)}
                                      </span>
                                      <span className="text-gray-300 text-xs">→</span>
                                    </>
                                  )}
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeColor(log.new_status)}`}>
                                    {formatStatus(log.new_status)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {formatDate(log.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {log.profiles?.full_name && (
                              <span>👤 {log.profiles.full_name}</span>
                            )}
                            {log.departments?.name && (
                              <span>🏢 {log.departments.name}</span>
                            )}
                          </div>

                          {log.remarks && (
                            <div className="mt-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                              <p className="text-xs text-gray-600 leading-relaxed">
                                💬 {log.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}