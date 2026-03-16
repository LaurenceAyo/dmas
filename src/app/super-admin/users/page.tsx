'use client'

import { useState, useEffect } from 'react'
import { Search, Trash2, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockUsers = [
  { id: 1, full_name: 'Fernan Dematera',   email: 'fernandimaano.dematera@bicol-u.edu.ph', department: 'Associate Dean Office', contact: '09123456789' },
  { id: 2, full_name: 'Liera C. Borromeo', email: 'liera.borromeo@bicol-u.edu.ph',          department: "Dean's Office",          contact: '09123456789' },
  { id: 3, full_name: 'Jane Doe',          email: 'jane.doe@bicol-u.edu.ph',                department: 'Accounting Office',       contact: '09187654321' },
  { id: 4, full_name: 'John Smith',        email: 'john.smith@gmail.com',                   department: null,                      contact: null          },
  { id: 5, full_name: 'Maria Santos',      email: 'maria.santos@bicol-u.edu.ph',            department: 'Supply Office',           contact: '09112345678' },
  { id: 6, full_name: 'Alex Johnson',      email: 'alex.j@bicol-u.edu.ph',                  department: 'IT Department',           contact: '09198765432' },
]

const departments = [
  'All Departments',
  'Associate Dean Office',
  "Dean's Office",
  'Accounting Office',
  'Supply Office',
  'BAC',
  'IT Department',
  'Human Resources',
  'No Department Assigned',
]

const deleteReasons = [
  'Account no longer needed',
  'Duplicate account',
  'User requested deletion',
  'Policy violation',
  'Unauthorized account',
  'Others',
]

interface User {
  id: number
  full_name: string
  email: string
  department: string | null
  contact: string | null
}

export default function UserManagementPage() {
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [showDropdown, setShowDropdown] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [users, setUsers] = useState(mockUsers)

  // ── Pagination States ──
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // ── Filter Logic ──────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchSearch =
      search === '' ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const matchDept =
      selectedDepartment === 'All Departments' ||
      (selectedDepartment === 'No Department Assigned' && !u.department) ||
      u.department === selectedDepartment

    return matchSearch && matchDept
  })

  // Reset pagination to page 1 if the user changes filters
  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedDepartment])

  // ── Pagination Math ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUsers = filtered.slice(startIndex, endIndex)

  // ── Delete Handler ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    setDeleteError('')

    if (!selectedReason) {
      setDeleteError('Please select a reason for deletion.')
      return
    }

    if (selectedReason === 'Others' && otherReason.trim() === '') {
      setDeleteError('Please specify the reason.')
      return
    }

    // Remove user from list
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget?.id))
    setDeleteTarget(null)
    setSelectedReason('')
    setOtherReason('')
    setDeleteError('')
    
    // Safety check: if deleting the last user on a page, drop back one page
    if (paginatedUsers.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleCloseModal = () => {
    setDeleteTarget(null)
    setSelectedReason('')
    setOtherReason('')
    setDeleteError('')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 shrink-0 flex items-center justify-between z-30">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Users</h1>
          <p className="text-xs text-gray-400 mt-0.5">Total: {users.length}</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search User..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 w-56 transition-all"
          />
        </div>
      </header>

      {/* ── Body ── (Changed to flex-col and overflow-hidden) */}
      <div className="flex-1 flex flex-col overflow-hidden px-8 py-6 bg-gray-50">
        
        {/* Main Card Wrapper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
          
          {/* Toolbar (shrink-0 keeps it from squishing) */}
          <div className="flex items-center px-6 py-4 border-b border-gray-100 gap-4 shrink-0 relative z-20">
            <p className="text-sm font-medium text-gray-500">Filter:</p>
            
            {/* Department Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition min-w-[200px] justify-between cursor-pointer"
              >
                <span>{selectedDepartment}</span>
                <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setShowDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-50 cursor-pointer    
                          ${selectedDepartment === dept ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Table Container with inner scrollbar ── */}
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-200">
            <table className="w-full text-sm">
              {/* Sticky Header */}
              <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Full Name</th>
                  <th className="text-left px-6 py-4 font-semibold">Email Address</th>
                  <th className="text-left px-6 py-4 font-semibold">Department</th>
                  <th className="text-left px-6 py-4 font-semibold">Contact Number</th>
                  <th className="text-left px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 text-gray-800 font-medium">{user.full_name}</td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.department ? (
                          <span className="text-gray-600">{user.department}</span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.contact ? (
                          <span className="text-gray-600">{user.contact}</span>
                        ) : (
                          <span className="text-gray-300 italic text-xs">Not provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-300 text-sm">
                      No users match your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer (shrink-0 keeps it fixed at bottom) ── */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 bg-gray-50/30">
            <p className="text-xs font-medium text-gray-500">
              Showing <span className="font-medium text-gray-800">{filtered.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium text-gray-800">{Math.min(endIndex, filtered.length)}</span> of <span className="font-medium text-gray-800">{filtered.length}</span> users
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

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div onClick={handleCloseModal} className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-800">Delete User</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  You are about to delete{' '}
                  <span className="font-semibold text-gray-600">{deleteTarget.full_name}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-4">
                Please select a reason for deletion:
              </p>
              {deleteError && (
                <p className="text-red-500 text-xs mb-3 -mt-2">{deleteError}</p>
              )}  
              <div className="flex flex-col gap-3">
                {deleteReasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition
                      ${selectedReason === reason
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="deleteReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => {
                        setSelectedReason(reason)
                        setDeleteError('')
                        if (reason !== 'Others') setOtherReason('')
                      }}
                      className="accent-red-500 cursor-pointer"
                    />
                    <span className={`text-sm ${selectedReason === reason ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {reason}
                    </span>
                  </label>
                ))}
              </div>

              {/* Other Reason Text Area */}
              {selectedReason === 'Others' && (
                <textarea
                  placeholder="Please specify your reason..."
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={3}
                  className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}