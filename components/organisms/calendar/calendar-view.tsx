'use client'

import { useCalendarState } from '@/features/calendar/hooks/use-calendar-state'
import { CalendarGrid } from './calendar-grid'
import { CalendarSidebar } from './calendar-sidebar'

interface CalendarViewProps {
  // Empty interface for future props
}

export function CalendarView(_props: CalendarViewProps) {
  const {
    currentDate,
    selectedDate,
    setSelectedDate,
    todayTasks,
    tasksByDate,
    selectedDateTasks,
    weeks,
    isFetching,
    todayProgress,
    completedToday,
    totalToday,
    goToPreviousMonth,
    goToNextMonth,
  } = useCalendarState()

  return (
    <div className="grid h-[600px] grid-cols-1 gap-4 lg:grid-cols-3 lg:items-start">
      <CalendarGrid
        currentDate={currentDate}
        weeks={weeks}
        tasksByDate={tasksByDate}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        isFetching={isFetching}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <CalendarSidebar
        selectedDate={selectedDate}
        selectedDateTasks={selectedDateTasks}
        todayTasks={todayTasks}
        todayProgress={todayProgress}
        completedToday={completedToday}
        totalToday={totalToday}
      />
    </div>
  )
}
