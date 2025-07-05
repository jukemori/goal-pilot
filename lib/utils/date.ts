export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', options)
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = now.getTime() - d.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays === -1) return 'Tomorrow'
  if (diffInDays > 0) return `${diffInDays} days ago`
  return `In ${Math.abs(diffInDays)} days`
}

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay()) // Start from Sunday
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(day)
  }
  return days
}

export function getMonthDays(date: Date): Date[] {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  
  const days = []
  for (let i = start.getDate(); i <= end.getDate(); i++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), i))
  }
  return days
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString()
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  result.setDate(date.getDate() - date.getDay())
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfWeek(date: Date): Date {
  const result = new Date(date)
  result.setDate(date.getDate() - date.getDay() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}