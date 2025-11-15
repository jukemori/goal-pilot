import { type TaskWithRoadmap } from '@/features/tasks/hooks/use-tasks'
import { CalendarCell } from './calendar-cell'

interface CalendarWeekProps {
  week: Date[]
  tasksByDate: Record<string, TaskWithRoadmap[]>
  selectedDate: string | null
  onDateSelect: (date: string) => void
  currentDate: Date
}

export function CalendarWeek({
  week,
  tasksByDate,
  selectedDate,
  onDateSelect,
  currentDate,
}: CalendarWeekProps) {
  const today = new Date()

  return (
    <div className="grid min-w-0 grid-cols-7 gap-0.5 md:gap-1">
      {week.map((date) => {
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const dateTasks = tasksByDate[dateString] || []
        const isSelected = selectedDate === dateString
        const isToday = date.toDateString() === today.toDateString()
        const isCurrentMonth = date.getMonth() === currentDate.getMonth()

        return (
          <CalendarCell
            key={dateString}
            date={date}
            tasks={dateTasks}
            isSelected={isSelected}
            isToday={isToday}
            isCurrentMonth={isCurrentMonth}
            onSelect={onDateSelect}
          />
        )
      })}
    </div>
  )
}
