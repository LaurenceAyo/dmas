"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AddNewPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<null | "new" | "archive">(null)

  // If "New" is selected, show the form
  if (selected === "new") {
    return <NewDocumentForm onBack={() => setSelected(null)} />
  }

  // Default: show the two option buttons
  return (
    <div className="flex-1 p-8">
      <h1 className="text-2xl font-bold text-gray-800">Add New</h1>

      <div className="mt-16 flex flex-col items-center gap-6">
        <p className="text-sm text-gray-500">Please select action you want to do:</p>


        <div className="flex gap-8">

          {/* New Button */}
          <button
            onClick={() => setSelected("new")}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "4px 4px 12px rgba(0,0,0,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            className="flex flex-col items-center justify-center w-36 h-36 rounded-xl bg-[#367588] text-white cursor-pointer"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9" y1="14" x2="15" y2="14"/>
            </svg>
            <span className="mt-2 text-sm font-medium">New</span>
          </button>

          {/* Archive Document Button */}
          <button
            onClick={() => router.push("/super-admin/archive")}
            className="flex flex-col items-center justify-center w-36 h-36 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition cursor-pointer"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <span className="mt-2 text-sm font-medium">Archive Document</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Form component shown after clicking "New"
function NewDocumentForm({ onBack }: { onBack: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "",
    submittingDepartment: "",
    submittedBy: "",
  })

  const handleClear = () => {
    setFormData({ documentName: "", documentType: "", submittingDepartment: "", submittedBy: "" })
  }
  const [error, setError] = useState("")

  const handleSave = () => {
    if (
    !formData.documentName ||
    !formData.documentType ||
    !formData.submittingDepartment ||
    !formData.submittedBy
  ) {
    alert("Please complete all required fields.")
    return  // stop here, don't show modal
  }
  setError("")
  setShowConfirm(true)
  }
  const handleConfirmYes = () => {
    setShowConfirm(false)
    setShowSuccess(true)  // show success modal
    // Supabase insert goes here later
  } 
  const handleSuccessOk = () => {
    setShowSuccess(false)
    handleClear()         // clear form after success
  }

  return (
    <div className="flex-1 p-8">

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-96 relative">
            
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-xl cursor-pointer"
            >
              ×
            </button>

            <p className="text-gray-800 font-medium text-center mb-6">
              Are you sure you want to save this document in archive?
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-3 text-right">{error}</p>
            )}
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="ml-auto px-6 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">
                No
              </button>
              <button
                onClick={handleConfirmYes}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-96 text-center">
            
            <p className="text-gray-800 font-medium mb-6">
              The document save successfully.
            </p>

            <button
              onClick={handleSuccessOk}
              className="px-8 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Document</h1>
        <button onClick={onBack} className="cursor-pointer ml-auto text-gray-500 hover:text-gray-800 text-5xl">
          ⬅
        </button>
        
      </div>
      

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter the name of the document..."
            value={formData.documentName}
            onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select the type of the document...</option>
            <option value="Financial Document">Financial Document</option>
            <option value="Legal Document">Legal Document</option>
            <option value="HR Document">HR Document</option>
            <option value="Supply Document">Supply Document</option>
            <option value="Academic Document">Academic Document</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitting Department <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.submittingDepartment}
            onChange={(e) => setFormData({ ...formData, submittingDepartment: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select submitting department name...</option>
            <option value="Accounting Office">Accounting Office</option>
            <option value="Supply Office">Supply Office</option>
            <option value="BAC">BAC</option>
            <option value="Associate Dean">Associate Dean</option>
          </select>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitted By <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter full name..."
            value={formData.submittedBy}
            onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleClear}
            className="cursor-pointer px-6 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            className="cursor-pointer px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
