'use client'

import { useState, useMemo, lazy, Suspense, memo, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
} from 'lucide-react'
import {
  useOptimizedCalendarTasks,
  type TaskWithRoadmap,
} from '@/lib/hooks/use-tasks'
import { format, parseISO } from 'date-fns'

// Lazy load heavy components
const SimpleTaskList = lazy(() =>
  import('@/components/organisms/calendar/simple-task-list').then((module) => ({
    default: module.SimpleTaskList,
  })),
)

// Loading skeleton component
function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Memoized Task Item component for better performance
const CalendarTaskItem = memo(function CalendarTaskItem({
  task,
  className = '',
}: {
  task: TaskWithRoadmap
  className?: string
}) {
  return (
    <div
      key={task.id}
      className={cn(
        'bg-primary/10 text-primary w-full overflow-hidden rounded px-0.5 py-0.5 text-[7px] break-words md:px-1 md:text-[10px]',
        task.completed === true && 'line-through opacity-60',
        className,
      )}
      title={task.title}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <div className="w-full truncate leading-tight">{task.title}</div>
    </div>
  )
})

// Memoized Task Item for desktop view
const CalendarTaskItemDesktop = memo(function CalendarTaskItemDesktop({
  task,
}: {
  task: TaskWithRoadmap
}) {
  return (
    <div
      key={task.id}
      className={cn(
        'bg-primary/10 text-primary w-full overflow-hidden rounded px-1 py-0.5 text-[10px] break-words',
        task.completed === true && 'line-through opacity-60',
      )}
      title={task.title}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <div className="w-full truncate">{task.title}</div>
    </div>
  )
})

// Memoized Tasks Container
const CalendarTasksContainer = memo(function CalendarTasksContainer({
  tasks,
}: {
  tasks: TaskWithRoadmap[]
}) {
  const firstTask = tasks[0]
  const secondTask = tasks[1]
  const hasMoreTasks = tasks.length > 1
  const desktopMoreCount = tasks.length > 2 ? tasks.length - 2 : 0

  if (tasks.length === 0) return null

  return (
    <div className="min-h-0 w-full flex-1 space-y-0.5 overflow-hidden md:space-y-1">
      {/* Show only first task on mobile, first 2 on desktop */}
      <CalendarTaskItem task={firstTask} />

      {/* Show second task only on medium screens and up */}
      {secondTask && (
        <div className="hidden w-full md:block">
          <CalendarTaskItemDesktop task={secondTask} />
        </div>
      )}

      {/* More indicator - different count for mobile vs desktop */}
      {hasMoreTasks && (
        <div className="overflow-hidden px-0.5 text-[7px] text-gray-500 md:px-1 md:text-[9px]">
          <span className="truncate md:hidden">+{tasks.length - 1}</span>
          <span className="hidden md:inline">
            {desktopMoreCount > 0 ? `+${desktopMoreCount} more` : ''}
          </span>
        </div>
      )}
    </div>
  )
})

// Memoized Calendar Cell component for optimal performance
const CalendarCell = memo(function CalendarCell({
  date,
  tasks,
  isSelected,
  isToday,
  isCurrentMonth,
  onSelect,
}: {
  date: Date
  tasks: TaskWithRoadmap[]
  isSelected: boolean
  isToday: boolean
  isCurrentMonth: boolean
  onSelect: (date: string) => void
}) {
  const dateString = useMemo(() => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }, [date])

  const handleClick = useCallback(() => {
    onSelect(isSelected ? '' : dateString)
  }, [dateString, isSelected, onSelect])

  return (
    <button
      key={dateString}
      onClick={handleClick}
      className={cn(
        'relative flex h-full w-full min-w-0 cursor-pointer flex-col rounded-lg border p-0.5 text-left transition-colors md:p-2',
        isToday && 'border-primary bg-primary/5',
        !isCurrentMonth && 'bg-gray-50 text-gray-400',
        isSelected && 'border-primary bg-primary/10',
        tasks.length > 0 && 'hover:bg-gray-50',
      )}
    >
      <div className="mb-0.5 flex-shrink-0 text-[10px] font-medium md:mb-1 md:text-sm">
        {date.getDate()}
      </div>

      <CalendarTasksContainer tasks={tasks} />
    </button>
  )
})

// Memoized Calendar Week component
const CalendarWeek = memo(function CalendarWeek({
  week,
  tasksByDate,
  selectedDate,
  onDateSelect,
  currentDate,
}: {
  week: Date[]
  tasksByDate: Record<string, TaskWithRoadmap[]>
  selectedDate: string | null
  onDateSelect: (date: string) => void
  currentDate: Date
}) {
  const today = useMemo(() => new Date(), [])

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
})

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CalendarViewProps {
  // Empty interface for future props
}

export function CalendarView(_props: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Use optimized unified hook
  const { data: calendarData, isFetching } =
    useOptimizedCalendarTasks(currentDate)
  const { todayTasks = [], tasksByDate = {} } = calendarData || {}

  const selectedDateTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

  // Memoize calendar date calculations
  const { weeks } = useMemo(() => {
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

    const dateRange = []
    const currentDateIterator = new Date(startDate)
    while (currentDateIterator <= endDate) {
      dateRange.push(new Date(currentDateIterator))
      currentDateIterator.setDate(currentDateIterator.getDate() + 1)
    }

    const weeks = []
    for (let i = 0; i < dateRange.length; i += 7) {
      weeks.push(dateRange.slice(i, i + 7))
    }

    return { weeks }
  }, [currentDate])

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

  // Memoize today's stats
  const { completedToday, totalToday, todayProgress } = useMemo(() => {
    const completed = todayTasks.filter(
      (task) => task.completed === true,
    ).length
    const total = todayTasks.length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
    return {
      completedToday: completed,
      totalToday: total,
      todayProgress: progress,
    }
  }, [todayTasks])

  return (
    <div className="grid h-[600px] grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
                {isFetching && (
                  <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousMonth}
                  disabled={isFetching}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextMonth}
                  disabled={isFetching}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <div
              className={`flex flex-1 flex-col transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}
            >
              {/* Day headers */}
              <div className="mb-2 grid flex-shrink-0 grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-gray-500"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid min-w-0 flex-1 grid-rows-6 gap-0.5 md:gap-1">
                {weeks.map((week, weekIndex) => (
                  <CalendarWeek
                    key={weekIndex}
                    week={week}
                    tasksByDate={tasksByDate}
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    currentDate={currentDate}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="flex h-full flex-col space-y-4">
        {/* Today's Progress */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Today's Progress</CardTitle>
            <CardDescription className="text-xs">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Completion</span>
                <span className="text-primary text-sm font-bold">
                  {todayProgress}%
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-gray-200">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-primary text-sm font-bold">
                    {completedToday}
                  </div>
                  <div className="text-[10px] text-gray-500">Done</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-600">
                    {totalToday - completedToday}
                  </div>
                  <div className="text-[10px] text-gray-500">Left</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        {selectedDate ? (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="text-sm">
                {format(parseISO(selectedDate), 'EEE, MMM d')}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedDateTasks.length} task
                {selectedDateTasks.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">
              <div className="h-full overflow-y-auto">
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task: TaskWithRoadmap) => (
                      <div
                        key={task.id}
                        className={cn(
                          'rounded border p-2 text-xs',
                          task.completed === true && 'bg-gray-50 opacity-60',
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {task.completed === true ? (
                            <CheckCircle className="text-primary mt-0.5 h-3 w-3 flex-shrink-0" />
                          ) : (
                            <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded border border-gray-300" />
                          )}
                          <div className="min-w-0 flex-1">
                            <h4
                              className={cn(
                                'text-xs leading-tight font-medium',
                                task.completed === true &&
                                  'text-gray-500 line-through',
                              )}
                            >
                              {task.title}
                            </h4>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                              <Clock className="h-2 w-2" />
                              {task.estimated_duration || 0}
                              min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-gray-500">
                    No tasks scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="text-sm">Today's Tasks</CardTitle>
              <CardDescription className="text-xs">
                Current tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden pt-0">
              <div className="h-full overflow-y-auto">
                <Suspense fallback={<TaskListSkeleton />}>
                  <SimpleTaskList tasks={todayTasks} goalId="" />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'
