import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  formatDate,
  formatRelativeTime,
  getWeekDays,
  getMonthDays,
  isToday,
  isSameDay,
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from '@/lib/utils/date'

describe('Date Utils', () => {
  beforeEach(() => {
    // Mock the current date to 2024-01-15 (Monday) for consistent testing
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toBe('1/15/2024')
    })

    it('formats string date correctly', () => {
      const result = formatDate('2024-01-15')
      expect(result).toBe('1/15/2024')
    })

    it('accepts custom options', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      expect(result).toContain('Monday')
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns "Today" for current date', () => {
      const today = new Date('2024-01-15')
      expect(formatRelativeTime(today)).toBe('Today')
    })

    it('returns "Yesterday" for previous day', () => {
      const yesterday = new Date('2024-01-14')
      expect(formatRelativeTime(yesterday)).toBe('Yesterday')
    })

    it('returns "Tomorrow" for next day', () => {
      const tomorrow = new Date('2024-01-16')
      expect(formatRelativeTime(tomorrow)).toBe('Tomorrow')
    })

    it('returns days ago for past dates', () => {
      const pastDate = new Date('2024-01-10') // 5 days ago
      expect(formatRelativeTime(pastDate)).toBe('5 days ago')
    })

    it('returns "In X days" for future dates', () => {
      const futureDate = new Date('2024-01-20') // 5 days in future
      expect(formatRelativeTime(futureDate)).toBe('In 5 days')
    })

    it('handles string dates', () => {
      expect(formatRelativeTime('2024-01-14')).toBe('Yesterday')
    })
  })

  describe('getWeekDays', () => {
    it('returns 7 days starting from Sunday', () => {
      const date = new Date('2024-01-15') // Monday
      const weekDays = getWeekDays(date)

      expect(weekDays).toHaveLength(7)
      expect(weekDays[0].getDay()).toBe(0) // Sunday
      expect(weekDays[6].getDay()).toBe(6) // Saturday
    })

    it('includes the correct dates for the week', () => {
      const date = new Date('2024-01-15') // Monday, Jan 15
      const weekDays = getWeekDays(date)

      // Should start from Sunday Jan 14
      expect(weekDays[0].getDate()).toBe(14)
      expect(weekDays[1].getDate()).toBe(15) // Monday (input date)
      expect(weekDays[6].getDate()).toBe(20) // Saturday
    })
  })

  describe('getMonthDays', () => {
    it('returns all days in the month', () => {
      const date = new Date('2024-01-15')
      const monthDays = getMonthDays(date)

      expect(monthDays).toHaveLength(31) // January has 31 days
      expect(monthDays[0].getDate()).toBe(1)
      expect(monthDays[30].getDate()).toBe(31)
    })

    it('handles February correctly', () => {
      const date = new Date('2024-02-15') // 2024 is a leap year
      const monthDays = getMonthDays(date)

      expect(monthDays).toHaveLength(29) // Leap year February
    })

    it('handles different months', () => {
      const april = new Date('2024-04-15')
      const aprilDays = getMonthDays(april)

      expect(aprilDays).toHaveLength(30) // April has 30 days
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      const today = new Date('2024-01-15')
      expect(isToday(today)).toBe(true)
    })

    it('returns false for other dates', () => {
      const yesterday = new Date('2024-01-14')
      const tomorrow = new Date('2024-01-16')

      expect(isToday(yesterday)).toBe(false)
      expect(isToday(tomorrow)).toBe(false)
    })

    it('ignores time when comparing', () => {
      const todayMorning = new Date('2024-01-15T08:00:00')
      const todayEvening = new Date('2024-01-15T20:00:00')

      expect(isToday(todayMorning)).toBe(true)
      expect(isToday(todayEvening)).toBe(true)
    })
  })

  describe('isSameDay', () => {
    it('returns true for same dates', () => {
      const date1 = new Date('2024-01-15T08:00:00')
      const date2 = new Date('2024-01-15T20:00:00')

      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('returns false for different dates', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-16')

      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('addDays', () => {
    it('adds positive days correctly', () => {
      const date = new Date('2024-01-15')
      const result = addDays(date, 5)

      expect(result.getDate()).toBe(20)
      expect(result.getMonth()).toBe(0) // January
    })

    it('adds negative days correctly', () => {
      const date = new Date('2024-01-15')
      const result = addDays(date, -5)

      expect(result.getDate()).toBe(10)
      expect(result.getMonth()).toBe(0) // January
    })

    it('handles month boundaries', () => {
      const date = new Date('2024-01-30')
      const result = addDays(date, 5)

      expect(result.getDate()).toBe(4)
      expect(result.getMonth()).toBe(1) // February
    })

    it('does not mutate original date', () => {
      const originalDate = new Date('2024-01-15')
      const originalTime = originalDate.getTime()

      addDays(originalDate, 5)

      expect(originalDate.getTime()).toBe(originalTime)
    })
  })

  describe('startOfWeek', () => {
    it('returns Sunday of the current week', () => {
      const monday = new Date('2024-01-15') // Monday
      const result = startOfWeek(monday)

      expect(result.getDay()).toBe(0) // Sunday
      expect(result.getDate()).toBe(14) // Jan 14
      expect(result.getHours()).toBe(0)
      expect(result.getMinutes()).toBe(0)
    })
  })

  describe('endOfWeek', () => {
    it('returns Saturday of the current week', () => {
      const monday = new Date('2024-01-15') // Monday
      const result = endOfWeek(monday)

      expect(result.getDay()).toBe(6) // Saturday
      expect(result.getDate()).toBe(20) // Jan 20
      expect(result.getHours()).toBe(23)
      expect(result.getMinutes()).toBe(59)
    })
  })

  describe('startOfMonth', () => {
    it('returns first day of the month', () => {
      const date = new Date('2024-01-15')
      const result = startOfMonth(date)

      expect(result.getDate()).toBe(1)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getFullYear()).toBe(2024)
    })
  })

  describe('endOfMonth', () => {
    it('returns last day of the month', () => {
      const date = new Date('2024-01-15')
      const result = endOfMonth(date)

      expect(result.getDate()).toBe(31) // January has 31 days
      expect(result.getMonth()).toBe(0) // January
    })

    it('handles February correctly', () => {
      const date = new Date('2024-02-15')
      const result = endOfMonth(date)

      expect(result.getDate()).toBe(29) // 2024 is leap year
    })
  })
})
