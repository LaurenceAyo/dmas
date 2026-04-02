'use client'

import { useState, useEffect, useCallback } from 'react'
// Added the missing icons from your frontend UI
import { Search, FileText, ChevronRight, Send, FileCheck, XCircle, ClipboardList, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getStatusBadgeColor, formatStatus } from '@/lib/utils/status'

// ── Types ─────────────────────────────────────────────────────────────────
interface RecentDocument {
  id: string
  title: string
  document_type: string | null
  document_type_detail: string | null
  created_at: string
  status: string
  departments: { name: string } | null
  profiles: { full_name: string } | null
}

interface Stats {
  released: number
  approved: number
  denied: number
  forApproval: number
  pendingApproval: number
}

// ── Helpers ───────────────────────────────────────────────────────────────
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit', day: '2-digit', year: 'numeric'
  })

// ── Main Page ─────────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [recentDocs, setRecentDocs]       = useState<RecentDocument[]>([])
  const [stats, setStats]                 = useState<Stats>({
    released: 0, approved: 0, denied: 0, forApproval: 0, pendingApproval: 0
  })
  const [adminName, setAdminName]         = useState('')
  const [fetchLoading, setFetchLoading]   = useState(true)
  const [search, setSearch]               = useState('')

  // ── Fetch Admin Name ──────────────────────────────────────────────────
  const fetchAdminName = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', authUser.id)
      .single()

    if (profile) setAdminName(profile.full_name?.split(' ')[0] ?? '')
  }, [])

  // ── Fetch Stats ───────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('status')
      .eq('module_type', 'process_routing')

    if (error || !data) return

    setStats({
      released:        data.filter(d => d.status === 'released').length,
      approved:        data.filter(d => d.status === 'approved').length,
      denied:          data.filter(d => d.status === 'denied').length,
      forApproval:     data.filter(d => d.status === 'approved').length,
      pendingApproval: data.filter(d => d.status === 'recommended_approval').length,
    })
  }, [])

  // ── Fetch Recent Documents (latest 10) ────────────────────────────────
  const fetchRecentDocuments = useCallback(async () => {
    setFetchLoading(true)

    const { data, error } = await supabase
      .from('documents')
      .select(`
        id, title, document_type, document_type_detail,
        created_at, status,
        departments!documents_department_id_fkey ( name ),
        profiles!documents_submitted_by_fkey ( full_name )
      `)
      .eq('module_type', 'process_routing')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) setRecentDocs(data as any)
    setFetchLoading(false)
  }, [])

  useEffect(() => {
    fetchAdminName()
    fetchStats()
    fetchRecentDocuments()
  }, [fetchAdminName, fetchStats, fetchRecentDocuments])

  // ── Filter ────────────────────────────────────────────────────────────
  const filtered = recentDocs.filter(d =>
    search === '' ||
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.departments?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── 💡 UI STATS ARRAY (Fed by backend data) ───────────────────────────
  const displayStats = [
    { label: 'Released',         value: stats.released,        bg: 'bg-teal-50',   iconColor: 'text-teal-400',   border: 'border-teal-100',   Icon: Send },
    { label: 'Approved',         value: stats.approved,        bg: 'bg-green-50',  iconColor: 'text-green-500',  border: 'border-green-100',  Icon: FileCheck },
    { label: 'Denied',           value: stats.denied,          bg: 'bg-red-50',    iconColor: 'text-red-400',    border: 'border-red-100',    Icon: XCircle },
    { label: 'Pending Approval', value: stats.pendingApproval, bg: 'bg-orange-50', iconColor: 'text-orange-400', border: 'border-orange-100', Icon: Clock },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header — bell icon removed */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">
          Hi {adminName || '...'}!
        </h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 w-56"
          />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">

        {/* ── Beautiful Frontend Stats Row ── */}
        <div className="flex gap-3 mb-8 shrink-0">
          {displayStats.map((s) => (
            <div
              key={s.label}
              className={`flex-1 bg-white rounded-2xl border ${s.border} shadow-sm px-4 py-4 flex items-center gap-3`}
            >
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                <s.Icon size={18} className={s.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recently Received Documents */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recently Received Documents</h2>
            <button
              onClick={() => router.push('/super-admin/document-progress')}
              className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition cursor-pointer"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100">
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
              ) : filtered.length > 0 ? (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{doc.title}</td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {doc.document_type ?? '—'}
                      {doc.document_type_detail ? ` — ${doc.document_type_detail}` : ''}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{doc.departments?.name ?? '—'}</td>
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(doc.created_at)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider ${getStatusBadgeColor(doc.status)}`}>
                        {formatStatus(doc.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 text-sm">
                    {recentDocs.length === 0 ? 'No documents yet.' : 'No documents match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}