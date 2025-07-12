'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react'
import { SimpleTaskList } from '@/components/organisms/calendar/simple-task-list'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'

interface Task {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  estimated_duration: number
  completed: boolean
  completed_at: string | null
  priority: number
  roadmaps: {
    goal_id: string
    goals: {
      title: string
      status: string
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CalendarViewProps {
  // Empty interface for future props
}

export function CalendarView(_props: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch tasks for current month
  const { data: tasks = [], isFetching } = useQuery<Task[]>({
    queryKey: ['calendar-tasks', currentDate.getFullYear(), currentDate.getMonth()],
    queryFn: async () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          roadmaps!inner(
            goal_id,
            goals!inner(
              title,
              status
            )
          )
        `)
        .gte('scheduled_date', startOfMonth.toISOString().split('T')[0])
        .lte('scheduled_date', endOfMonth.toISOString().split('T')[0])
        .order('scheduled_date')

      if (error) throw error
      return (data as Task[]) || []
    },
    staleTime: 60000, // Cache for 1 minute
    placeholderData: [] // Use placeholderData instead of keepPreviousData
  })

  // Fetch today's tasks
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks = [] } = useQuery<Task[]>({
    queryKey: ['today-tasks', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          roadmaps!inner(
            goal_id,
            goals!inner(
              title,
              status
            )
          )
        `)
        .eq('scheduled_date', today)
        .order('priority', { ascending: false })

      if (error) throw error
      return (data as Task[]) || []
    }
  })

  // Group tasks by date
  const tasksByDate = tasks.reduce((acc, task) => {
    const date = task.scheduled_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const selectedDateTasks = selectedDate ? tasksByDate[selectedDate] || [] : []

  // Calendar helpers
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
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

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getDateString = (date: Date) => {
    return format(date, 'yyyy-MM-dd')
  }

  const getTasksForDate = (date: Date) => {
    return tasksByDate[getDateString(date)] || []
  }

  // Today's stats
  const completedToday = todayTasks.filter(task => task.completed).length
  const totalToday = todayTasks.length
  const todayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {isFetching && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPreviousMonth} disabled={isFetching}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextMonth} disabled={isFetching}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className={`flex-1 flex flex-col transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-rows-6 gap-0.5 md:gap-1 flex-1 min-w-0">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-0.5 md:gap-1 min-w-0">
                    {week.map((date) => {
                      const dateString = getDateString(date)
                      const dateTasks = getTasksForDate(date)
                      const isSelected = selectedDate === dateString

                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedDate(isSelected ? null : dateString)}
                          className={cn(
                            "p-0.5 md:p-2 text-left border rounded-lg transition-colors relative cursor-pointer flex flex-col h-full min-w-0 w-full",
                            isToday(date) && "border-primary bg-primary/5",
                            !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                            isSelected && "border-primary bg-primary/10",
                            dateTasks.length > 0 && "hover:bg-gray-50"
                          )}
                        >
                          <div className="text-[10px] md:text-sm font-medium mb-0.5 md:mb-1 flex-shrink-0">
                            {date.getDate()}
                          </div>
                          
                          {dateTasks.length > 0 && (
                            <div className="flex-1 space-y-0.5 md:space-y-1 min-h-0 overflow-hidden w-full">
                              {/* Show only first task on mobile, first 2 on desktop */}
                              {dateTasks.slice(0, 1).map((task) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "text-[7px] md:text-[10px] px-0.5 md:px-1 py-0.5 rounded bg-primary/10 text-primary overflow-hidden w-full break-words",
                                    task.completed && "line-through opacity-60"
                                  )}
                                  title={task.title}
                                  style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                >
                                  <div className="truncate w-full leading-tight">{task.title}</div>
                                </div>
                              ))}
                              
                              {/* Show second task only on medium screens and up */}
                              <div className="hidden md:block w-full">
                                {dateTasks.slice(1, 2).map((task) => (
                                  <div
                                    key={task.id}
                                    className={cn(
                                      "text-[10px] px-1 py-0.5 rounded bg-primary/10 text-primary overflow-hidden w-full break-words",
                                      task.completed && "line-through opacity-60"
                                    )}
                                    title={task.title}
                                    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                  >
                                    <div className="truncate w-full">{task.title}</div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* More indicator - different count for mobile vs desktop */}
                              {dateTasks.length > 1 && (
                                <div className="text-[7px] md:text-[9px] text-gray-500 px-0.5 md:px-1 overflow-hidden">
                                  <span className="md:hidden truncate">+{dateTasks.length - 1}</span>
                                  <span className="hidden md:inline">{dateTasks.length > 2 ? `+${dateTasks.length - 2} more` : ''}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col space-y-4 h-full">
        {/* Today's Progress */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Today's Progress</CardTitle>
            <CardDescription className="text-xs">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Completion</span>
                <span className="text-sm font-bold text-primary">{todayProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="text-sm font-bold text-primary">{completedToday}</div>
                  <div className="text-[10px] text-gray-500">Done</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-600">{totalToday - completedToday}</div>
                  <div className="text-[10px] text-gray-500">Left</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        {selectedDate ? (
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm">
                {format(parseISO(selectedDate), 'EEE, MMM d')}
              </CardTitle>
              <CardDescription className="text-xs">
                {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "p-2 border rounded text-xs",
                          task.completed && "opacity-60 bg-gray-50"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {task.completed ? (
                            <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="h-3 w-3 border border-gray-300 rounded mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "font-medium text-xs leading-tight",
                              task.completed && "line-through text-gray-500"
                            )}>
                              {task.title}
                            </h4>
                            <p className="text-[10px] text-gray-500 mt-1 truncate">
                              {task.roadmaps.goals.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                              <Clock className="h-2 w-2" />
                              {task.estimated_duration}min
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No tasks scheduled
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-sm">Today's Tasks</CardTitle>
              <CardDescription className="text-xs">Current tasks</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pt-0 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <SimpleTaskList tasks={todayTasks} goalId="" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'