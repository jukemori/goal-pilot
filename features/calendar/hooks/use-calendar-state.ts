import { useState } from 'react'
import {
  useOptimizedCalendarTasks,
  type TaskWithRoadmap,
} from '@/features/tasks/hooks/use-tasks'

/**
 * Generates date range for calendar month view
 */
function getCalendarDates(currentDate: Date) {
  const monthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  const startDate = new Date(monthStart)
  startDate.setDate(startDate.getDate() - startDate.getDay()) // Start from Sunday

  const endDate = new Date(monthEnd)
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay())) // End on Saturday

  const dateRange: Date[] = []
  const currentDateIterator = new Date(startDate)

  while (currentDateIterator <= endDate) {
    dateRange.push(new Date(currentDateIterator))
    currentDateIterator.setDate(currentDateIterator.getDate() + 1)
  }

  return dateRange
}

/**
 * Groups dates into weeks for calendar grid
 */
function groupIntoWeeks(dates: Date[]): Date[][] {
  const weeks: Date[][] = []
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }
  return weeks
}

/**
 * Calculates today's task statistics
 */
function calculateTodayStats(todayTasks: TaskWithRoadmap[]) {
  const completedToday = todayTasks.filter(
    (task) => task.completed === true,
  ).length
  const totalToday = todayTasks.length
  const todayProgress =
    totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return {
    completedToday,
    totalToday,
    todayProgress,
  }
}

/**
 * Custom hook for managing calendar state and date navigation
 */
export function useCalendarState() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Fetch calendar data
  const { data: calendarData, isFetching } =
    useOptimizedCalendarTasks(currentDate)
  const { todayTasks = [], tasksByDate = {} } = calendarData || {}

  // Get tasks for selected date
  const selectedDateTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

  // Calculate calendar weeks
  const dateRange = getCalendarDates(currentDate)
  const weeks = groupIntoWeeks(dateRange)

  // Calculate today's stats
  const stats = calculateTodayStats(todayTasks)

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    )
  }

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    )
  }

  return {
    // State
    currentDate,
    selectedDate,
    setSelectedDate,

    // Data
    todayTasks,
    tasksByDate,
    selectedDateTasks,
    weeks,
    isFetching,

    // Stats
    ...stats,

    // Navigation
    goToPreviousMonth,
    goToNextMonth,
  }
}
