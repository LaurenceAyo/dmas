"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { ChevronRight, Home, ChevronDown } from "lucide-react"
import Link from "next/link"

// ── Custom Select Component ───────────────────────────────────────────────
function CustomSelect({ 
  options, value, onChange, placeholder, minWidth = "w-full", error = false, disabled = false 
}: {
  options: string[] | { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
  placeholder: string
  minWidth?: string
  error?: boolean
  disabled?: boolean
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

  // Normalize options to always be objects with label and value
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || ''

  return (
    <div className={`relative ${minWidth}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2 border rounded-lg text-sm transition-colors text-left
          ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white cursor-pointer hover:bg-gray-50'}
          ${error && !disabled ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:ring-blue-500'}
          focus:outline-none focus:ring-2`}
      >
        <span className={`truncate ${!selectedLabel ? 'text-gray-500' : 'text-gray-800'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-blue-50 cursor-pointer ${
                  value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No options available</div>
          )}
        </div>
      )}
    </div>
  )
}

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
    customDocumentType: "",                // for "others"
    customDocumentDetail: "",               // required detail for specific types
    submittingDepartment: "",
    customDepartment: "", 
    submittedById: "",
    customSubmittedBy: "", 
    documentDescription:""
  })

  // Clear specific field error when user starts typing/selecting
  const clearFieldError = (fieldName: string) => {
    if (invalidFields.includes(fieldName)) {
      setInvalidFields(prev => prev.filter(f => f !== fieldName))
    }
    if (validationError) setValidationError("")
  }

  const handleClear = () => {
    setFormData({ 
      documentName: "", documentType: "", customDocumentType: "", customDocumentDetail: "",
      submittingDepartment: "", customDepartment: "",
      submittedById: "", customSubmittedBy: "", 
      documentDescription:"" 
    })
    setFile(null)
    setAvailableUsers([])
    setValidationError("") 
    setInvalidFields([])
  }

  const handleSave = () => {
    const newInvalidFields: string[] = []

    // Document Name
    if (!formData.documentName) newInvalidFields.push("documentName")

    // Document Type validation – both the type and its detail are required
    if (!formData.documentType) {
      newInvalidFields.push("documentType")
    } else if (formData.documentType === "others") {
      if (!formData.customDocumentType) newInvalidFields.push("customDocumentType")
    } else {
      // For named types, the detail is required
      if (!formData.customDocumentDetail) newInvalidFields.push("customDocumentDetail")
    }

    // Description
    if (!formData.documentDescription) newInvalidFields.push("documentDescription")

    // Department and Submitted By
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
    
    setInvalidFields([])
    setValidationError("")
    setError("")
    setShowConfirm(true)
  }

  const handleConfirmYes = async () => {
    setShowConfirm(false)
    const supabase = createClient()

    // Construct final document type
    let finalDocumentType = formData.documentType
    if (formData.documentType === "others") {
      finalDocumentType = formData.customDocumentType
    } else {
      // Detail is required, so it will always be appended
      finalDocumentType = `${formData.documentType}: ${formData.customDocumentDetail}`
    }

    const finalDepartment = formData.submittingDepartment === "others" ? formData.customDepartment : formData.submittingDepartment
    const finalSubmittedBy = formData.submittingDepartment === "others" ? formData.customSubmittedBy : formData.submittedById

    const { error } = await supabase
      .from("documents")
      .insert([
        {
          title: formData.documentName,
          type: finalDocumentType,
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

  // Document type options
  const documentTypeOptions = [
    { label: "Communication letters", value: "Communication letters" },
    { label: "Proposal", value: "Proposal" },
    { label: "Vouchers", value: "Vouchers" },
    { label: "Others (Specify)", value: "others" }
  ]

  const departmentOptions = [
    ...departments.map(dept => ({ label: dept.name, value: dept.id })),
    { label: "Others (Specify)", value: "others" }
  ]

  const userOptions = availableUsers.map(user => ({ label: user.name, value: user.id }))

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
        <Link href="/super-admin/dashboard" className="flex items-center hover:text-gray-900 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <div className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <button onClick={onBack} className="hover:text-gray-900 transition-colors cursor-pointer">
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

        {/* Document Name */}
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
            className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
              ${invalidFields.includes("documentName") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:ring-blue-500'}`}
          />
        </div>

        {/* Document Type with required detail input */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <CustomSelect
              options={documentTypeOptions}
              value={formData.documentType}
              onChange={(val) => {
                setFormData(prev => ({ 
                  ...prev, 
                  documentType: val,
                  customDocumentType: "",
                  customDocumentDetail: ""
                }))
                clearFieldError("documentType")
              }}
              placeholder="Select the type of the document..."
              error={invalidFields.includes("documentType")}
            />

            {/* Custom input for "others" – required */}
            {formData.documentType === "others" && (
              <input
                type="text"
                placeholder="Please specify the document type... *"
                value={formData.customDocumentType}
                onChange={(e) => {
                  setFormData({ ...formData, customDocumentType: e.target.value })
                  clearFieldError("customDocumentType")
                }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 animate-in fade-in zoom-in-95 transition-colors
                  ${invalidFields.includes("customDocumentType") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-blue-300 bg-blue-50/50 focus:ring-blue-500'}`}
              />
            )}

            {/* Required detail input for specific types */}
            {formData.documentType && formData.documentType !== "others" && (
              <input
                type="text"
                placeholder={`Enter detail for ${formData.documentType} *`}
                value={formData.customDocumentDetail}
                onChange={(e) => {
                  setFormData({ ...formData, customDocumentDetail: e.target.value })
                  clearFieldError("customDocumentDetail")
                }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 animate-in fade-in zoom-in-95 transition-colors
                  ${invalidFields.includes("customDocumentDetail") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-blue-300 bg-blue-50/50 focus:ring-blue-500'}`}
              />
            )}
          </div>
        </div>

        {/* Submitting Department (Custom Select & Others Input) */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitting Department <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-2">
            <CustomSelect
              options={departmentOptions}
              value={formData.submittingDepartment}
              onChange={(val) => {
                setFormData(prev => ({ 
                  ...prev, 
                  submittingDepartment: val,
                  customDepartment: "", 
                  submittedById: "",    
                  customSubmittedBy: "" 
                }))
                clearFieldError("submittingDepartment")

                if (val && val !== "others") {
                  const filteredUsers = DUMMY_USERS.filter(u => u.deptId === val)
                  setAvailableUsers(filteredUsers)
                } else {
                  setAvailableUsers([])
                }
              }}
              placeholder="Select submitting department..."
              error={invalidFields.includes("submittingDepartment")}
            />

            {formData.submittingDepartment === "others" && (
              <input
                type="text"
                placeholder="Please type the department name... *"
                value={formData.customDepartment}
                onChange={(e) => {
                  setFormData({ ...formData, customDepartment: e.target.value })
                  clearFieldError("customDepartment")
                }}
                className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 animate-in fade-in zoom-in-95 transition-colors
                  ${invalidFields.includes("customDepartment") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-blue-300 bg-blue-50/50 focus:ring-blue-500'}`}
              />
            )}
          </div>
        </div>

        {/* Submitted By (Custom Select & Others Input) */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Submitted By <span className="text-red-500">*</span>
          </label>
          
          {formData.submittingDepartment === "others" ? (
            <input
              type="text"
              placeholder="Enter the submitter's full name... *"
              value={formData.customSubmittedBy}
              onChange={(e) => {
                setFormData({ ...formData, customSubmittedBy: e.target.value })
                clearFieldError("customSubmittedBy")
              }}
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 animate-in fade-in transition-colors
                ${invalidFields.includes("customSubmittedBy") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-blue-300 bg-blue-50/50 focus:ring-blue-500'}`}
            />
          ) : (
            <CustomSelect
              options={userOptions}
              value={formData.submittedById}
              onChange={(val) => {
                setFormData({ ...formData, submittedById: val })
                clearFieldError("submittedById")
              }}
              placeholder={formData.submittingDepartment ? "Select a user..." : "Please select a department first"}
              disabled={!formData.submittingDepartment}
              error={invalidFields.includes("submittedById")}
            />
          )}
        </div>

        {/* Description */}
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
            className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
              ${invalidFields.includes("documentDescription") ? 'border-red-500 focus:ring-red-200 bg-red-50/30' : 'border-gray-300 focus:ring-blue-500'}`}
          />
        </div>

        {/* File Drag & Drop */}
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
            ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
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