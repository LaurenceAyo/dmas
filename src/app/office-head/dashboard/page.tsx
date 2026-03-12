'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Bell, ChevronLeft, ChevronRight, Clock, FileCheck, XCircle } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockDocuments = [
  { id: 1, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', date: '03/25/2025', status: 'Received' },
  { id: 2, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Supply Office',     date: '03/25/2025', status: 'Received' },
  { id: 3, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'BAC',               date: '03/25/2025', status: 'Received' },
  { id: 4, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Received' },
  { id: 5, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Received' },
  { id: 6, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', date: '03/25/2025', status: 'Pending Review' },
  { id: 7, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Supply Office',     date: '03/25/2025', status: 'Pending Review' },
  { id: 8, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'BAC',               date: '03/25/2025', status: 'Pending Review' },
  { id: 9, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Pending Review' },
  { id: 10, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',   date: '03/25/2025', status: 'Pending Review' },
  { id: 11, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', date: '03/25/2025', status: 'Approved' },
  { id: 12, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Supply Office',     date: '03/25/2025', status: 'Approved' },
  { id: 13, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'BAC',               date: '03/25/2025', status: 'Approved' },
  { id: 14, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Approved' },
  { id: 15, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Approved' },
  { id: 16, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Accounting Office', date: '03/25/2025', status: 'Denied' },
  { id: 17, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Supply Office',     date: '03/25/2025', status: 'Denied' },
  { id: 18, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'BAC',               date: '03/25/2025', status: 'Denied' },
  { id: 19, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Denied' },
  { id: 20, name: 'Scholarship Grant Certificate', type: 'Financial Document', department: 'Associate Dean',    date: '03/25/2025', status: 'Denied' },
]

const initialNotifications = [
  { id: 1, msg: 'Document A has been Approved by A.O', time: '2 min ago', type: 'approve' },
  { id: 2, msg: 'Document B has been Approved by S.O', time: '5 min ago', type: 'approve' },
  { id: 3, msg: 'Document C has been Denied by BAC', time: '12 min ago', type: 'deny' },
  { id: 4, msg: 'New Document submitted by Jane Doe', time: '1 hr ago', type: 'info' },
]

// ── Helper Function: Status Colors ─────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-50 text-green-600 border-green-200'
    case 'Denied':
      return 'bg-red-50 text-red-600 border-red-200'
    case 'Pending Review':
      return 'bg-orange-50 text-orange-600 border-orange-200'
    case 'Received':
      return 'bg-blue-50 text-blue-600 border-blue-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}
const stats = [
  { label: 'Approved',         value: 20, bg: 'bg-green-50',  iconColor: 'text-green-500',  border: 'border-green-100',  Icon: FileCheck },
  { label: 'Denied',           value: 20, bg: 'bg-red-50',    iconColor: 'text-red-400',    border: 'border-red-100',    Icon: XCircle },
  { label: 'Pending Review', value: 20, bg: 'bg-orange-50', iconColor: 'text-orange-400', border: 'border-orange-100', Icon: Clock },
]

export default function OfficeHeadDashboardPage() {
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState(initialNotifications)
  const notificationRef = useRef<HTMLDivElement>(null)
  const [activeStatusFilter, setActiveStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const stats = [
    { 
      label: 'Pending Review', 
      statusKey: 'Pending Review', 
      value: mockDocuments.filter(d => d.status === 'Pending Review').length, 
      bg: 'bg-orange-50', iconColor: 'text-orange-400', border: 'border-orange-100', activeRing: 'ring-orange-400', Icon: Clock 
    },
    { 
      label: 'Approved Today', 
      statusKey: 'Approved', 
      value: mockDocuments.filter(d => d.status === 'Approved').length, 
      bg: 'bg-green-50', iconColor: 'text-green-500', border: 'border-green-100', activeRing: 'ring-green-500', Icon: FileCheck 
    },
    { 
      label: 'Denied Today', 
      statusKey: 'Denied', 
      value: mockDocuments.filter(d => d.status === 'Denied').length, 
      bg: 'bg-red-50', iconColor: 'text-red-400', border: 'border-red-100', activeRing: 'ring-red-400', Icon: XCircle 
    },
  ]

  const filtered = mockDocuments.filter(d => {
    const matchesSearch = search === '' || 
      d.name.toLowerCase().includes(search.toLowerCase()) || 
      d.department.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = activeStatusFilter === 'All' || d.status === activeStatusFilter

    return matchesSearch && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [search, activeStatusFilter])

  // Calculate Math for Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  const paginatedDocs = filtered.slice(startIndex, endIndex)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notificationRef])

  const handleStatClick = (statusKey) => {
    if (activeStatusFilter === statusKey) {
      setActiveStatusFilter('All')
    } else {
      setActiveStatusFilter(statusKey)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50/50">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi Office Head!</h1>
          <p className="text-sm text-gray-400">Welcome back to DMAS Dashboard</p>
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
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${
                showNotifications ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>

            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <span className="font-bold text-gray-800 text-sm">Notifications</span>
                  <button className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer">Mark all as read</button>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                  {notifications.map((n) => (
                    <div key={n.id} className="px-5 py-4 border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer flex gap-3">
                      <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.type === 'deny' ? 'bg-red-400' : 'bg-green-400'}`} />
                      <div>
                        <p className="text-xs text-gray-600 leading-relaxed">{n.msg}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-8 py-8">

        {/* Stat Cards - UPDATED to be clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((s) => {
            const isActive = activeStatusFilter === s.statusKey;
            
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
                  <p className="text-2xl font-bold text-gray-800 leading-none">{s.value}</p>
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
              {activeStatusFilter === 'All' ? 'Recent Received Documents' : `${activeStatusFilter} Documents`}
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
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 font-medium">{doc.name}</td>
                      <td className="px-6 py-3.5 text-gray-500">{doc.type}</td>
                      <td className="px-6 py-3.5 text-gray-500">{doc.department}</td>
                      <td className="px-6 py-3.5 text-gray-500">{doc.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No documents found for this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
{/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 bg-gray-50/30">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="font-regular">{filtered.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-regular">{Math.min(endIndex, filtered.length)}</span> of <span className="font-">{filtered.length}</span> documents
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
  )
}