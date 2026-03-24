"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronRight, Home, ChevronDown, FileText, X } from "lucide-react"
import Link from "next/link"

// ── Custom Select Component ───────────────────────────────────────────────
function CustomSelect({ 
  options, value, onChange, placeholder, error = false, disabled = false 
}: {
  options: string[] | { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
  placeholder: string
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

  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || ''

  return (
    <div className="relative w-full" ref={dropdownRef}>
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
        <ChevronDown size={14} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''} ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
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

// ── Document Type Config ──────────────────────────────────────────────────
const documentTypeOptions = [
  { label: "Communication Letters", value: "Communication Letters" },
  { label: "Proposal",              value: "Proposal"              },
  { label: "Vouchers",              value: "Vouchers"              },
  { label: "Others (Specify)",      value: "others"                },
]

const DETAIL_PLACEHOLDERS: Record<string, string> = {
  "Communication Letters": "e.g. Memorandum, Endorsement Letter...",
  "Proposal":              "e.g. Budget Proposal, Project Proposal...",
  "Vouchers":              "e.g. Disbursement Voucher, Journal Voucher...",
  "others":                "Please specify the document type...",
}

// ── Main Export ───────────────────────────────────────────────────────────
export default function AddNewArchivePage() {
  return <ArchiveDocumentForm />
}

// ── Archive Document Form ─────────────────────────────────────────────────
function ArchiveDocumentForm() {
  const supabase = createClient()

  // ── State ──────────────────────────────────────────────────────────────
  const [showConfirm, setShowConfirm]   = useState(false)
  const [showSuccess, setShowSuccess]   = useState(false)
  const [error, setError]               = useState("")
  const [loading, setLoading]           = useState(false)
  const [validationError, setValidationError] = useState("")
  const [invalidFields, setInvalidFields]     = useState<string[]>([])
  const [file, setFile]                 = useState<File | null>(null)
  const [isDragging, setIsDragging]     = useState(false)

  const [formData, setFormData] = useState({
    documentName:       "",
    documentType:       "",
    documentTypeDetail: "",
    documentDescription: "",
  })

  // ── Helpers ───────────────────────────────────────────────────────────
  const getInputClass = (fieldName: string) => {
    const base = "w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors"
    return invalidFields.includes(fieldName)
      ? `${base} border-red-500 focus:ring-red-200 bg-red-50/30`
      : `${base} border-gray-300 focus:ring-blue-500`
  }

  const clearFieldError = (fieldName: string) => {
    if (invalidFields.includes(fieldName)) {
      setInvalidFields(prev => prev.filter(f => f !== fieldName))
    }
    if (validationError) setValidationError("")
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Clear ──────────────────────────────────────────────────────────────
  const handleClear = () => {
    setFormData({
      documentName: "", documentType: "",
      documentTypeDetail: "", documentDescription: "",
    })
    setFile(null)
    setValidationError("")
    setInvalidFields([])
    setError("")
  }

  // ── Validation ─────────────────────────────────────────────────────────
  const handleSave = () => {
    const newInvalidFields: string[] = []

    if (!formData.documentName.trim())       newInvalidFields.push("documentName")
    if (!formData.documentType)              newInvalidFields.push("documentType")
    if (!formData.documentTypeDetail.trim()) newInvalidFields.push("documentTypeDetail")
    if (!formData.documentDescription.trim()) newInvalidFields.push("documentDescription")

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

  // ── Submit to Supabase ─────────────────────────────────────────────────
  const handleConfirmYes = async () => {
    setShowConfirm(false)
    setLoading(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setError("Not authenticated. Please log in again.")
        setLoading(false)
        return
      }

      let fileUrl = null
      let fileName = null
      let fileSize = null

      if (file) {
        const filePath = `${authUser.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          setError("File upload failed. Please try again.")
          setLoading(false)
          return
        }

        fileUrl = filePath
        fileName = file.name
        fileSize = file.size
      }

      const finalDocumentType = formData.documentType === "others"
        ? "Others"
        : formData.documentType

      // Insert into Supabase with archived_at
      const { error: insertError } = await supabase
        .from("documents")
        .insert([{
          title:                formData.documentName,
          document_type:        finalDocumentType,
          document_type_detail: formData.documentTypeDetail.trim(),
          description:          formData.documentDescription.trim(),
          module_type:          'digital_archive',
          status:               'released',
          submitted_by:         authUser.id,
          is_archived:          true,
          archived_at:          new Date().toISOString(),   // 👈 ADDED
          file_url:             fileUrl,
          file_name:            fileName,
          file_size:            fileSize,
        }])

      if (insertError) {
        console.error("Insert error:", insertError.message)
        setError("Failed to archive document. Please try again.")
        setLoading(false)
        return
      }

      setShowSuccess(true)

    } catch (err) {
      console.error("Unexpected error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // ── JSX ────────────────────────────────────────────────────────────────
  return (
    <div className="overflow-y-auto flex-1 p-8">

      {/* Confirm Modal */}
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
              Are you sure you want to archive this document?
            </p>
            {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleConfirmYes}
                disabled={loading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Archiving...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-80 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-gray-800 font-semibold mb-2">Document Archived!</p>
            <p className="text-gray-400 text-xs mb-6">
              Successfully added to the Digital Archive.
            </p>
            <button
              onClick={() => { setShowSuccess(false); handleClear() }}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-6">
        <Link href="/super-admin/dashboard" className="flex items-center hover:text-gray-900 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <Link href="/super-admin/add-new" className="hover:text-gray-900 transition-colors">
          Add New
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
        <span className="text-gray-900 font-medium">Archive Document</span>
      </nav>

      {/* Form Card */}
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
            className={getInputClass("documentName")}
          />
          {invalidFields.includes("documentName") && (
            <p className="text-red-500 text-xs mt-1">Document name is required.</p>
          )}
        </div>

        {/* Document Type Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            options={documentTypeOptions}
            value={formData.documentType}
            onChange={(val) => {
              setFormData(prev => ({ ...prev, documentType: val, documentTypeDetail: '' }))
              clearFieldError("documentType")
              clearFieldError("documentTypeDetail")
            }}
            placeholder="Select the type of the document..."
            error={invalidFields.includes("documentType")}
          />
          {invalidFields.includes("documentType") && (
            <p className="text-red-500 text-xs mt-1">Please select a document type.</p>
          )}
        </div>

        {/* Document Type Detail */}
        {formData.documentType && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specify{formData.documentType !== "others" ? ` ${formData.documentType}` : ""}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={DETAIL_PLACEHOLDERS[formData.documentType]}
              value={formData.documentTypeDetail}
              onChange={(e) => {
                setFormData({ ...formData, documentTypeDetail: e.target.value })
                clearFieldError("documentTypeDetail")
              }}
              className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors
                ${invalidFields.includes("documentTypeDetail")
                  ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                  : 'border-blue-300 bg-blue-50/50 focus:ring-blue-500'}`}
            />
            {invalidFields.includes("documentTypeDetail") && (
              <p className="text-red-500 text-xs mt-1">Please specify the document type.</p>
            )}
          </div>
        )}

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Enter a short description or details about the document..."
            value={formData.documentDescription}
            onChange={(e) => {
              setFormData({ ...formData, documentDescription: e.target.value })
              clearFieldError("documentDescription")
            }}
            className={`w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-colors resize-none
              ${invalidFields.includes("documentDescription")
                ? 'border-red-500 focus:ring-red-200 bg-red-50/30'
                : 'border-gray-300 focus:ring-blue-500'}`}
          />
          {invalidFields.includes("documentDescription") && (
            <p className="text-red-500 text-xs mt-1">Description is required.</p>
          )}
        </div>

        {/* File Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach File <span className="text-gray-400 font-normal">(optional)</span>
          </label>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const dropped = e.dataTransfer.files[0]
                if (dropped) setFile(dropped)
              }}
              onClick={() => document.getElementById("archiveFileInput")?.click()}
              className={`border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition
                ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}
            >
              <div className="text-sm text-gray-400">
                <p className="font-medium text-gray-500">Drag & Drop Document here</p>
                <p className="text-xs mt-1">or click here to Browse</p>
                <p className="text-xs mt-1 text-gray-300">PDF, DOCX, JPG</p>
              </div>
            </div>
          ) : (
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1.5 rounded-lg hover:bg-blue-100 transition text-gray-400 hover:text-red-400"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <input
            id="archiveFileInput"
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
            <button
              onClick={handleClear}
              className="cursor-pointer px-6 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="cursor-pointer px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-md transition disabled:opacity-60"
            >
              {loading ? 'Archiving...' : 'Archive'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}