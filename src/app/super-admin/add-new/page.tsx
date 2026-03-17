"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

// ── Dummy Data for Departments & Users ─────────────────────────────────────
const DUMMY_DEPARTMENTS = [
  { id: "dept-1", name: "Accounting Office" },
  { id: "dept-2", name: "Supply Office" },
  { id: "dept-3", name: "BAC" },
  { id: "dept-4", name: "Associate Dean" }
]

const DUMMY_USERS = [
  { id: "user-1", name: "Jane Doe", deptId: "dept-1" },
  { id: "user-2", name: "Mark Accountant", deptId: "dept-1" },
  { id: "user-3", name: "Maria Santos", deptId: "dept-2" },
  { id: "user-4", name: "Liera Borromeo", deptId: "dept-4" },
  { id: "user-5", name: "Fernan Dematera", deptId: "dept-4" },
]

export default function AddNewPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<null | "new" | "archive">(null)

  if (selected === "new") {
    return <NewDocumentForm onBack={() => setSelected(null)} />
  }

  return (
    <div className="flex-1 p-8">
      <Breadcrumb items={[{ label: "Add New" }]} />

      <div className="mt-16 flex flex-col items-center gap-6">
        <p className="text-sm text-gray-500">Please select action you want to do:</p>

        <div className="flex gap-8">
          {/* New Button */}
          <button
            onClick={() => setSelected("new")}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "4px 4px 4px rgba(0,0,0,0.5)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            className="flex flex-col items-center justify-center w-36 h-36 rounded-xl bg-[#367588] text-white cursor-pointer transition-all"
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
            onClick={() => router.push("/super-admin/add-new-archive")}
            className="flex flex-col items-center justify-center w-40 h-36 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition cursor-pointer"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <span className="px-4 mt-2 text-sm font-medium text-center">Archive Document</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Form Component ─────────────────────────────────────────────────────────
function NewDocumentForm({ onBack }: { onBack: () => void }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState("")
  
  // Validation States
  const [validationError, setValidationError] = useState("") 
  const [invalidFields, setInvalidFields] = useState<string[]>([]) 

  const [departments, setDepartments] = useState(DUMMY_DEPARTMENTS)
  const [availableUsers, setAvailableUsers] = useState<{id: string, name: string}[]>([])

  // For File Drops  
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "",
    submittingDepartment: "",
    customDepartment: "", 
    submittedById: "",
    customSubmittedBy: "", 
    documentDescription:""
  })

  // Helper to dynamically apply red border if a field is invalid
  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors cursor-pointer"
    if (invalidFields.includes(fieldName)) {
      return `${baseClass} border-red-500 focus:ring-red-200 bg-red-50/30`
    }
    return `${baseClass} border-gray-300 focus:ring-blue-500`
  }

  // Clear specific field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (invalidFields.includes(fieldName)) {
      setInvalidFields(prev => prev.filter(f => f !== fieldName))
    }
    if (validationError) setValidationError("")
  }

  const handleClear = () => {
    setFormData({ 
      documentName: "", documentType: "", 
      submittingDepartment: "", customDepartment: "",
      submittedById: "", customSubmittedBy: "", 
      documentDescription:"" 
    })
    setFile(null)
    setAvailableUsers([])
    setValidationError("") 
    setInvalidFields([]) // Clear red borders
  }

  const handleSave = () => {
    const newInvalidFields: string[] = []

    // Advanced validation: check which fields are empty
    if (!formData.documentName) newInvalidFields.push("documentName")
    if (!formData.documentType) newInvalidFields.push("documentType")
    if (!formData.documentDescription) newInvalidFields.push("documentDescription")

    if (formData.submittingDepartment === "others") {
      if (!formData.customDepartment) newInvalidFields.push("customDepartment")
      if (!formData.customSubmittedBy) newInvalidFields.push("customSubmittedBy")
    } else {
      if (!formData.submittingDepartment) newInvalidFields.push("submittingDepartment")
      if (!formData.submittedById) newInvalidFields.push("submittedById")
    }

    if (newInvalidFields.length > 0) {
      setInvalidFields(newInvalidFields)
      setValidationError("Please fill up all the required fields.")
      return
    }
    
    // Clear the error if everything is filled out correctly
    setInvalidFields([])
    setValidationError("")
    setError("")
    setShowConfirm(true)
  }

  const handleConfirmYes = async () => {
    setShowConfirm(false)
    const supabase = createClient()

    const finalDepartment = formData.submittingDepartment === "others" ? formData.customDepartment : formData.submittingDepartment
    const finalSubmittedBy = formData.submittingDepartment === "others" ? formData.customSubmittedBy : formData.submittedById

    const { error } = await supabase
      .from("documents")
      .insert([
        {
          title: formData.documentName,
          type: formData.documentType,
          department_id: finalDepartment, 
          submitted_by: finalSubmittedBy,
          description: formData.documentDescription,
          status: "pending",                            
          is_archived: false,                            
        }
      ])

    if (error) {
      console.error("Error saving:", error.message)
      setError("Failed to save document. Please try again.")
      return
    }

    setShowSuccess(true)
  } 

  const handleSuccessOk = () => {
    setShowSuccess(false)
    handleClear()
  }

  return (
    <div className="overflow-y-auto flex-1 p-8">

      {/* ── Modals ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-96 relative">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-1 right-3 text-gray-400 hover:text-gray-600 text-3xl cursor-pointer"
            >
              ×
            </button>
            <p className="mt-5 text-gray-800 font-medium text-center mb-5">
              Are you sure you want to save this document to process?
            </p>
            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="ml-auto px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer">
                No
              </button>
              <button
                onClick={handleConfirmYes}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-80 text-center">
            <p className="text-gray-800 font-medium mb-8">
              Document saved successfully.
            </p>
            <button
              onClick={handleSuccessOk}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
        <Link
          href="/super-admin/dashboard"
          className="flex items-center hover:text-gray-900 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
        <div className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button
            onClick={onBack}
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Add New
          </button>
        </div>
        <div className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="text-gray-900 font-medium">New Document</span>
        </div>
      </nav>

      {/* ── Form UI ── */}
      <div className="mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter the name of the document..."
            value={formData.documentName}
            onChange={(e) => {
              setFormData({ ...formData, documentName: e.target.value })
              clearFieldError("documentName")
            }}
            className={getInputClass("documentName")}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => {
              setFormData({ ...formData, documentType: e.target.value })
              clearFieldError("documentType")
            }}
            className={getInputClass("documentType")}
          >
            <option value="">Select the type of the document...</option> 
            <option value="Financial Document">Financial Document</option>
            <option value="Legal Document">Legal Document</option>
            <option value="HR Document">HR Document</option>
            <option value="Supply Document">Supply Document</option>
            <option value="Academic Document">Academic Document</option>
          </select>
        </div>

        {/* ── Submitting Department (With "Others" Logic) ── */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitting Department <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <select
              value={formData.submittingDepartment}
              onChange={(e) => {
                const selectedDeptId = e.target.value
                setFormData(prev => ({ 
                  ...prev, 
                  submittingDepartment: selectedDeptId,
                  customDepartment: "", 
                  submittedById: "",    
                  customSubmittedBy: "" 
                }))
                clearFieldError("submittingDepartment")

                if (selectedDeptId && selectedDeptId !== "others") {
                  const filteredUsers = DUMMY_USERS.filter(u => u.deptId === selectedDeptId)
                  setAvailableUsers(filteredUsers)
                } else {
                  setAvailableUsers([])
                }
              }}
              className={getInputClass("submittingDepartment")}
            >
              <option value="">Select submitting department...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
              <option value="others" className="font-semibold text-blue-600">Others (Specify)</option>
            </select>

            {formData.submittingDepartment === "others" && (
              <input
                type="text"
                placeholder="Please type the department name..."
                value={formData.customDepartment}
                onChange={(e) => {
                  setFormData({ ...formData, customDepartment: e.target.value })
                  clearFieldError("customDepartment")
                }}
                className={`${getInputClass("customDepartment")} bg-blue-50/50 animate-in fade-in zoom-in-95`}
              />
            )}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitted By <span className="text-red-500">*</span>
          </label>
          
          {formData.submittingDepartment === "others" ? (
            <input
              type="text"
              placeholder="Enter the submitter's full name..."
              value={formData.customSubmittedBy}
              onChange={(e) => {
                setFormData({ ...formData, customSubmittedBy: e.target.value })
                clearFieldError("customSubmittedBy")
              }}
              className={`${getInputClass("customSubmittedBy")} bg-blue-50/50 animate-in fade-in`}
            />
          ) : (
            <select
              value={formData.submittedById}
              onChange={(e) => {
                setFormData({ ...formData, submittedById: e.target.value })
                clearFieldError("submittedById")
              }}
              disabled={!formData.submittingDepartment}
              className={`${getInputClass("submittedById")} disabled:bg-gray-100 disabled:border-gray-200 disabled:cursor-not-allowed`}
            >
              <option value="">
                {formData.submittingDepartment ? "Select a user..." : "Please select a department first"}
              </option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter a short description or details about the document..."
            value={formData.documentDescription}
            onChange={(e) => {
              setFormData({ ...formData, documentDescription: e.target.value })
              clearFieldError("documentDescription")
            }}
            className={getInputClass("documentDescription")}
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach File (optional)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              const dropped = e.dataTransfer.files[0]
              if (dropped) setFile(dropped)
            }}
            onClick={() => document.getElementById("fileInput")?.click()}
            className={`border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition
            ${isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-white"
            }`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <span>📄</span>
                <span className="font-semibold">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-2 text-red-400 hover:text-red-600 text-xs cursor-pointer bg-red-50 px-2 py-1 rounded"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-400">
                <p className="font-medium text-gray-500">Drag & Drop Document here</p>
                <p className="text-xs mt-1">or click here to Browse</p>
                <p className="text-xs mt-1 text-gray-300">PDF, DOCX, JPG</p>
              </div>
            )}
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              const selected = e.target.files?.[0]
              if (selected) setFile(selected)
            }}
          />
        </div>

        {/* ── Action Buttons with Inline Validation Error ── */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            {/* The error message appears here on the left side */}
            {validationError && (
              <p className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-left-2">
                {validationError}
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            <button onClick={handleClear}
              className="cursor-pointer px-6 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="cursor-pointer px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-md transition"
            >
              Save Document
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}