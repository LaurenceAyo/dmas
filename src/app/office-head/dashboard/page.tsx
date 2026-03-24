'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Bell, ChevronLeft, ChevronRight, Clock, FileCheck, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Types ──────────────────────────────────────────────────────────────────
interface DashboardDocument {
  id: string
  title: string
  document_type: string | null
  document_type_detail: string | null
  status: string
  created_at: string
  departments: { name: string } | null
}

interface DashboardNotification {
  id: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

// ── Helper: Status Colors ──────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':           return 'bg-green-100 text-green-700'
    case 'denied':             return 'bg-red-50 text-red-600 border-red-200'
    case 'in_process':         return 'bg-blue-50 text-blue-600 border-blue-200'
    case 'recommended_approval': return 'bg-orange-50 text-orange-600 border-orange-200'
    case 'pending':            return 'bg-yellow-50 text-yellow-600 border-yellow-200'
    case 'released':           return 'bg-teal-100 text-teal-700'
    default:                   return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'in_process':           return 'Received'
    case 'recommended_approval': return 'Pending Review'
    case 'pending':              return 'Pending'
    case 'approved':             return 'Approved'
    case 'denied':               return 'Denied'
    case 'released':             return 'Released'
    default:                     return status
  }
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric',
  })

const timeAgo = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)} day ago`
}

// ── Dashboard Status Filter Keys ───────────────────────────────────────────
const STATUS_FILTERS: Record<string, string[]> = {
  'Received': ['in_process'],
  'Approved': ['approved'],
  'Denied':   ['denied'],
}

export default function OfficeHeadDashboardPage() {
  const supabase = createClient()

  // ── State ───────────────────────────────────────────────────────────────
  const [userName, setUserName]               = useState('Office Head')
  const [deptName, setDeptName]               = useState('')
  const [currentUserId, setCurrentUserId]     = useState<string | null>(null)
  const [deptId, setDeptId]                   = useState<string | null>(null)

  const [documents, setDocuments]             = useState<DashboardDocument[]>([])
  const [fetchLoading, setFetchLoading]       = useState(true)
  const [fetchError, setFetchError]           = useState('')

  const [notifications, setNotifications]     = useState<DashboardNotification[]>([])
  const [unreadCount, setUnreadCount]         = useState(0)
  const [notifLoading, setNotifLoading]       = useState(false)

  const [search, setSearch]                   = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [activeStatusFilter, setActiveStatusFilter] = useState('All')
  const [currentPage, setCurrentPage]         = useState(1)
  const itemsPerPage = 5

  const notificationRef = useRef<HTMLDivElement>(null)

  // ── Fetch current user profile ──────────────────────────────────────────
  const fetchUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, department_id, departments ( name )')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setCurrentUserId(profile.id)
      setUserName((profile as any).full_name || 'Office Head')
      setDeptId((profile as any).department_id || null)
      setDeptName((profile as any).departments?.name || '')
    }
  }, [])

  // ── Fetch documents: current queue + all processed by this user ──────────
  const fetchDocuments = useCallback(async () => {
    if (!deptId || !currentUserId) { setFetchLoading(false); return }
    setFetchLoading(true)
    setFetchError('')

    // Step 1: Get all doc IDs this office head has ever acted on
    const { data: logData } = await supabase
      .from('document_logs')
      .select('document_id')
      .eq('performed_by', currentUserId)

    const processedIds = [
      ...new Set((logData || []).map((l: any) => l.document_id).filter(Boolean))
    ] as string[]

    // Step 2: Fetch docs that are EITHER in the current queue OR processed by this user
    let query = supabase
      .from('documents')
      .select(`
        id,
        title,
        document_type,
        document_type_detail,
        status,
        created_at,
        departments!documents_department_id_fkey ( name )
      `)
      .eq('module_type', 'process_routing')
      .order('created_at', { ascending: false })

    if (processedIds.length > 0) {
      query = query.or(`current_office_id.eq.${deptId},id.in.(${processedIds.join(',')})`)
    } else {
      query = query.eq('current_office_id', deptId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Dashboard fetch error:', error.message)
      setFetchError('Failed to load documents. Please refresh.')
    } else {
      setDocuments((data as any) || [])
    }

    setFetchLoading(false)
  }, [deptId, currentUserId])

  // ── Fetch notifications ─────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!currentUserId) return
    setNotifLoading(true)

    const { data } = await supabase
      .from('notifications')
      .select('id, title, message, is_read, created_at')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false })
      .limit(15)

    if (data) {
      setNotifications(data as DashboardNotification[])
      setUnreadCount(data.filter((n: DashboardNotification) => !n.is_read).length)
    }
    setNotifLoading(false)
  }, [currentUserId])

  // ── Mark all notifications as read ─────────────────────────────────────
  const markAllRead = async () => {
    if (!currentUserId) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  // ── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => { fetchUser() }, [fetchUser])
  useEffect(() => { if (deptId !== null && currentUserId) fetchDocuments() }, [deptId, currentUserId, fetchDocuments])
  useEffect(() => { if (currentUserId) fetchNotifications() }, [currentUserId, fetchNotifications])

  useEffect(() => { setCurrentPage(1) }, [search, activeStatusFilter])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Derived stat counts ─────────────────────────────────────────────────
  const receivedCount = documents.filter(d => d.status === 'in_process').length
  const approvedCount = documents.filter(d => d.status === 'approved').length
  const deniedCount   = documents.filter(d => d.status === 'denied').length

  const stats = [
    {
      label: 'Received',
      statusKey: 'Received',
      value: receivedCount,
      bg: 'bg-blue-50', iconColor: 'text-blue-500', border: 'border-blue-100', activeRing: 'ring-blue-500',
      Icon: Clock,
    },
    {
      label: 'Approved',
      statusKey: 'Approved',
      value: approvedCount,
      bg: 'bg-green-50', iconColor: 'text-green-500', border: 'border-green-100', activeRing: 'ring-green-500',
      Icon: FileCheck,
    },
    {
      label: 'Denied',
      statusKey: 'Denied',
      value: deniedCount,
      bg: 'bg-red-50', iconColor: 'text-red-400', border: 'border-red-100', activeRing: 'ring-red-400',
      Icon: XCircle,
    },
  ]

  // ── Filter & Pagination ─────────────────────────────────────────────────
  const filtered = documents.filter(d => {
    const matchesSearch =
      search === '' ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.departments?.name || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      activeStatusFilter === 'All' ||
      (STATUS_FILTERS[activeStatusFilter] || []).includes(d.status)

    return matchesSearch && matchesStatus
  })

  const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex  = (currentPage - 1) * itemsPerPage
  const endIndex    = startIndex + itemsPerPage
  const paginatedDocs = filtered.slice(startIndex, endIndex)

  const handleStatClick = (statusKey: string) => {
    setActiveStatusFilter(prev => prev === statusKey ? 'All' : statusKey)
  }

  // ── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi, {userName}!</h1>
          <p className="text-sm text-gray-400">{deptName || 'Loading...'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Document..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56 transition-all"
            />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications && currentUserId) fetchNotifications()
              }}
              className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${
                showNotifications ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
              )}
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <span className="font-bold text-gray-800 text-sm">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                  {notifLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="px-5 py-4 border-b border-gray-50 flex gap-3">
                        <div className="mt-1 w-2 h-2 bg-gray-200 rounded-full shrink-0 animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/4" />
                          <div className="h-2 bg-gray-100 rounded animate-pulse w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-5 py-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.is_read ? 'bg-gray-300' : 'bg-blue-400'}`} />
                        <div>
                          {n.title && <p className="text-xs font-semibold text-gray-700 leading-relaxed">{n.title}</p>}
                          <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-10 text-center text-gray-400 text-xs">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-8 py-8">

        {/* Error Banner */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {fetchError}
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((s) => {
            const isActive = activeStatusFilter === s.statusKey

            return (
              <div
                key={s.label}
                onClick={() => handleStatClick(s.statusKey)}
                className={`bg-white rounded-2xl border ${s.border} shadow-sm px-6 py-5 flex items-center gap-4 cursor-pointer transition-all duration-200
                  ${isActive ? `ring-2 ${s.activeRing} shadow-md scale-[1.02] bg-gray-50/50` : 'hover:shadow-md hover:bg-gray-50'}
                `}
              >
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.Icon size={18} className={s.iconColor} />
                </div>
                <div>
                  {fetchLoading ? (
                    <div className="h-6 w-10 bg-gray-100 rounded animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-800 leading-none">{s.value}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent Documents Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">
              {activeStatusFilter === 'All' ? 'Recent Documents' : `${activeStatusFilter} Documents`}
            </h2>
            {activeStatusFilter !== 'All' && (
              <button
                onClick={() => setActiveStatusFilter('All')}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-semibold">Document Name</th>
                  <th className="text-left px-6 py-3 font-semibold">Document Type</th>
                  <th className="text-left px-6 py-3 font-semibold">Submitting Department</th>
                  <th className="text-left px-6 py-3 font-semibold">Date Received</th>
                  <th className="text-left px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fetchLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-3.5">
                          <div className="h-3 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 font-medium">{doc.title}</td>
                      <td className="px-6 py-3.5 text-gray-500">
                        {doc.document_type
                          ? `${doc.document_type}${doc.document_type_detail ? ` — ${doc.document_type_detail}` : ''}`
                          : '—'}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{doc.departments?.name ?? '—'}</td>
                      <td className="px-6 py-3.5 text-gray-500">{formatDate(doc.created_at)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(doc.status)}`}>
                          {formatStatus(doc.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                      {documents.length === 0
                        ? "No documents in your queue."
                        : "No documents found for this filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 bg-gray-50/30">
            <p className="text-xs font-medium text-gray-500">
              Showing{' '}
              <span className="font-regular">{filtered.length === 0 ? 0 : startIndex + 1}</span>
              {' '}to{' '}
              <span className="font-regular">{Math.min(endIndex, filtered.length)}</span>
              {' '}of{' '}
              <span>{filtered.length}</span> documents
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer
                    ${currentPage === page
                      ? 'bg-[#0f172a] text-white shadow-md shadow-slate-300'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}