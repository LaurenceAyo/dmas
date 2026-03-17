'use client'

import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import NotificationBell from '@/components/NotificationBell'

// Mock notifications data matching the design
const mockNotifications = [
  { id: 1, status: 'In Process', documentName: 'Scholarship Grant Certificate', message: 'Your document is now Pending Review.', date: 'March 5, 2026', time: '10:30 A.M', read: false },
  { id: 2, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 3, status: 'Released', documentName: 'Scholarship Grant Certificate', message: 'Your document is ready for Release.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 4, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 5, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 6, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 7, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 8, status: 'Approved', documentName: 'Scholarship Grant Certificate', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
  { id: 9, status: 'In Process', documentName: 'Budget Report', message: 'Your document is now Pending Review.', date: 'March 5, 2026', time: '10:30 A.M', read: false },
  { id: 10, status: 'Approved', documentName: 'Procurement Request', message: 'Your document has been Approved.', date: 'March 5, 2026', time: '10:30 A.M', read: true },
]

// Generate more notifications to reach 20
for (let i = 11; i <= 20; i++) {
  mockNotifications.push({
    id: i,
    status: i % 3 === 0 ? 'In Process' : 'Approved',
    documentName: 'Scholarship Grant Certificate',
    message: i % 3 === 0 ? 'Your document is now Pending Review.' : 'Your document has been Approved.',
    date: 'March 5, 2026',
    time: '10:30 A.M',
    read: i % 3 !== 0,
  })
}

export default function InboxPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // User info (mock data - replace with real data from Supabase later)
  const userName = 'Jane Doe'
  const userDepartment = 'Accounting Office'

  // Count unread
  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length

  // Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = 
      notif.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'unread' && !notif.read) ||
      (activeFilter === 'read' && notif.read)
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
  }

  // Status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'In Process':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Released':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'Denied':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hi, {userName}!</h1>
          <p className="text-sm text-gray-500">{userDepartment}</p>
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
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
        {/* Filter Tabs */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => {
              setActiveFilter('all')
              setCurrentPage(1)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
              activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {notifications.length}
            </span>
            All
          </button>

          <button
            onClick={() => {
              setActiveFilter('unread')
              setCurrentPage(1)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
              activeFilter === 'unread' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {unreadCount}
            </span>
            Unread
          </button>

          <button
            onClick={() => {
              setActiveFilter('read')
              setCurrentPage(1)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeFilter === 'read'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${
              activeFilter === 'read' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {readCount}
            </span>
            Read
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700 text-sm">Status</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700 text-sm">Document Name</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700 text-sm">Message</th>
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-700 text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedNotifications.map((notif) => (
                  <tr
                    key={notif.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(notif.status)}`}>
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{notif.documentName}</td>
                    <td className="px-6 py-4 text-gray-600">{notif.message}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{notif.date}</div>
                      <div className="text-xs text-gray-400">{notif.time}</div>
                    </td>
                  </tr>
                ))}
                {paginatedNotifications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No Relevant Notifications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredNotifications.length)}</span> of{' '}
              <span className="font-medium">{filteredNotifications.length}</span> documents
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    currentPage === page
                      ? 'bg-gray-800 text-white'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}