/**
 * Adds N working days to a start date (skips Sat & Sun)
 */
export function addWorkingDays(startDate: Date, days: number): Date {
  const result = new Date(startDate)
  let added = 0

  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      added++
    }
  }

  return result
}

/**
 * Counts working days between two dates (skips Sat & Sun)
 */
export function countWorkingDays(from: Date, to: Date): number {
  let count = 0
  
  // 💡 FIX: Zero out the times to midnight so same-day tests don't add an extra day!
  const current = new Date(from)
  current.setHours(0, 0, 0, 0)
  
  const target = new Date(to)
  target.setHours(0, 0, 0, 0)

  while (current < target) {
    current.setDate(current.getDate() + 1)
    const day = current.getDay()
    if (day !== 0 && day !== 6) count++
  }

  return count
}

/**
 * Returns how many working days are left until due date
 */
export function workingDaysLeft(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  if (due <= today) return 0
  return countWorkingDays(today, due)
}