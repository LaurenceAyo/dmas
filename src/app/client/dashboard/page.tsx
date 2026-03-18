'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Bell, FileText, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react'

const mockDocuments = [
  { id: 1, owner: 'Haven Daniels',    name: 'Scholarship Grant Certificate', type: 'Financial Document', date: '03/25/2025', status: 'In Process' },
  { id: 2, owner: 'Xander Strickland',name: 'Scholarship Grant Certificate', type: 'Financial Document', date: '03/25/2025', status: 'Approved'   },
  { id: 3, owner: 'Nia Person',       name: 'Scholarship Grant Certificate', type: 'Financial Document', date: '03/25/2025', status: 'Approved'   },
  { id: 4, owner: 'Moses McKinney',   name: 'Scholarship Grant Certificate', type: 'Financial Document', date: '03/25/2025', status: 'In Process' },
  { id: 5, owner: 'Amara Enriquez',   name: 'Scholarship Grant Certificate', type: 'Financial Document', date: '03/25/2025', status: 'Denied'     },
  { id: 6, owner: 'Jane Doe',         name: 'Clearance Form',                type: 'Academic Document',  date: '03/26/2025', status: 'Pending'    },
  { id: 7, owner: 'John Smith',       name: 'Travel Order',                  type: 'Administrative',     date: '03/27/2025', status: 'In Process' },
]

const stats = [
  { label: 'Total Document', value: 20, bg: 'bg-blue-50',   iconColor: 'text-blue-400',   border: 'border-blue-100',   Icon: FileText },
  { label: 'Pending',        value: 20, bg: 'bg-yellow-50', iconColor: 'text-yellow-500', border: 'border-yellow-100', Icon: Clock },
  { label: 'Approved',       value: 20, bg: 'bg-green-50',  iconColor: 'text-green-500',  border: 'border-green-100',  Icon: CheckCircle },
  { label: 'Denied',         value: 20, bg: 'bg-red-50',    iconColor: 'text-red-400',    border: 'border-red-100',    Icon: XCircle },
]

const initialNotifications = [
  { id: 1, msg: 'Document A has been Approved by A.O', time: '2 min ago', type: 'approve' },
  { id: 2, msg: 'Document B has been Approved by S.O', time: '5 min ago', type: 'approve' },
  { id: 3, msg: 'Document C has been Denied by BAC', time: '12 min ago', type: 'deny' },
  { id: 4, msg: 'New Document submitted by Jane Doe', time: '1 hr ago', type: 'info' },
]

const statusStyles: Record<string, string> = {
  'In Process': 'bg-blue-100 text-blue-600 border-blue-200',
  'Approved':   'bg-green-100 text-green-600 border-green-200',
  'Denied':     'bg-red-100 text-red-500 border-red-200',
  'Pending':    'bg-yellow-100 text-yellow-600 border-yellow-200',
}

export default function ClientDashboardPage() {
  const [search, setSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications] = useState(initialNotifications)
  const notificationRef = useRef<HTMLDivElement>(null)

  // ── Pagination States & Math ──
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filtered = mockDocuments.filter(d =>
    search === '' ||
    d.owner.toLowerCase().includes(search.toLowerCase()) ||
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDocs = filtered.slice(startIndex, endIndex)

  // Click outside for notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [notificationRef])

  return (
    // 1. Root is strictly h-screen and hidden overflow
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden p-8">

      {/* Header */}
      <header className="pb-6 flex items-center justify-between shrink-0 z-30">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi John Doe</h1>
          <p className="text-sm text-gray-500 mt-1">Accounting Office</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-100 outline-none w-64 shadow-sm transition-all"
            />
          </div>

          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl border transition-all relative ${
                showNotifications ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer shadow-sm'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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

      {/* 2. Main Content Wrapper forces Flex Col and prevents overflow here */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Stat Cards (shrink-0 keeps them from compressing) */}
        <div className="grid grid-cols-4 gap-4 mb-6 shrink-0">
          {stats.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl border ${s.border} shadow-sm px-5 py-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
                <s.Icon size={18} className={s.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 leading-none">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide ">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Documents Table Container takes the rest of the space */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          
          {/* 4. This inner div gets the scrollbar! */}
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-sm text-center">
              {/* 5. Sticky header prevents column titles from scrolling out of view */}
              <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4 font-semibold">Document Owner</th>
                  <th className="px-6 py-4 font-semibold">Document Name</th>
                  <th className="px-6 py-4 font-semibold">Document Type</th>
                  <th className="px-6 py-4 font-semibold">Date Submitted</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-3.5 text-gray-700 font-medium text-left">{doc.owner}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-left">{doc.name}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-left">{doc.type}</td>
                      <td className="px-6 py-3.5 text-gray-500 text-left">{doc.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-35 h-7 px-2 rounded-full text-[10px] font-medium whitespace-nowrap leading-5 tracking-wider ${statusStyles[doc.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {doc.status}
                        </span>
                      </td> 
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 6. Footer is outside the scrollable area, so it stays pinned at the bottom! */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 bg-white">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="font-medium text-gray-800">{filtered.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-800">{Math.min(endIndex, filtered.length)}</span> of <span className="font-medium text-gray-800">{filtered.length}</span> documents
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
                      ? 'bg-[#1a2e4a] text-white shadow-md'
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