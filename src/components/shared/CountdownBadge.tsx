'use client'

import { useEffect, useState } from 'react'
import { workingDaysLeft } from '@/lib/utils/workingDays'

interface CountdownBadgeProps {
  dueDate: string | null
  isPaused: boolean
  isCompleted: boolean
}

export default function CountdownBadge({
  dueDate, isPaused, isCompleted
}: CountdownBadgeProps) {

  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!dueDate || isCompleted || isPaused) return
    setDaysLeft(workingDaysLeft(new Date(dueDate)))
  }, [dueDate, isPaused, isCompleted])

  // ── Completed ─────────────────────────────────────────────────────
  if (isCompleted) return null

  // ── Paused ────────────────────────────────────────────────────────
  if (isPaused) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
        ⏸️ Timer Paused
      </span>
    )
  }

  // ── No due date ───────────────────────────────────────────────────
  if (!dueDate || daysLeft === null) return null

  // ── Overdue ───────────────────────────────────────────────────────
  if (daysLeft === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200 animate-pulse">
        🚨 OVERDUE
      </span>
    )
  }

  // ── 1 day left ────────────────────────────────────────────────────
  if (daysLeft === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600 border border-red-200">
        ⚠️ Due Tomorrow
      </span>
    )
  }

  // ── 2–3 days left ─────────────────────────────────────────────────
  if (daysLeft <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        ⚠️ {daysLeft} Days Left
      </span>
    )
  }

  // ── Plenty of time ────────────────────────────────────────────────
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      ✅ {daysLeft} Days Left
    </span>
  )
}