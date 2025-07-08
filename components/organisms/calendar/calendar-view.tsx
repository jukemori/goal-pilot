'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, Clock } from 'lucide-react'
import { SimpleTaskList } from '@/components/organisms/calendar/simple-task-list'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

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

interface CalendarViewProps {}

export function CalendarView({}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch tasks for current month
  const { data: tasks = [], isLoading, isFetching } = useQuery({
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
      return data || []
    },
    staleTime: 60000, // Cache for 1 minute
    keepPreviousData: true // Keep previous data while fetching new data
  })

  // Fetch today's tasks
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks = [] } = useQuery({
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
      return data || []
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
    return date.toISOString().split('T')[0]
  }

  const getTasksForDate = (date: Date) => {
    return tasksByDate[getDateString(date)] || []
  }

  // Today's stats
  const completedToday = todayTasks.filter(task => task.completed).length
  const totalToday = todayTasks.length
  const todayProgress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {isFetching && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
          <CardContent>
            <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="space-y-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {week.map((date) => {
                      const dateString = getDateString(date)
                      const dateTasks = getTasksForDate(date)
                      const completedCount = dateTasks.filter(task => task.completed).length
                      const isSelected = selectedDate === dateString

                      return (
                        <button
                          key={dateString}
                          onClick={() => setSelectedDate(isSelected ? null : dateString)}
                          className={cn(
                            "p-3 h-[95px] text-left border rounded-lg transition-colors relative",
                            isToday(date) && "border-blue-500 bg-blue-50",
                            !isCurrentMonth(date) && "text-gray-400 bg-gray-50",
                            isSelected && "border-blue-500 bg-blue-100",
                            dateTasks.length > 0 && "hover:bg-gray-50"
                          )}
                        >
                          <div className="text-sm font-medium mb-2">
                            {date.getDate()}
                          </div>
                          
                          {dateTasks.length > 0 && (
                            <div className="space-y-1 pb-8">
                              {dateTasks.slice(0, 2).map((task) => (
                                <div
                                  key={task.id}
                                  className={cn(
                                    "text-xs p-1 rounded truncate",
                                    task.completed 
                                      ? "bg-green-100 text-green-800 line-through" 
                                      : "bg-blue-100 text-blue-800"
                                  )}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dateTasks.length > 2 && (
                                <div className="text-xs text-gray-500">
                                  +{dateTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          )}

                          {dateTasks.length > 0 && (
                            <div className="absolute bottom-1 right-2">
                              <Badge variant="outline" className="text-xs bg-white">
                                {completedCount}/{dateTasks.length}
                              </Badge>
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
      <div className="space-y-6">
        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Progress</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-lg font-bold text-blue-600">{todayProgress}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${todayProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{completedToday}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">{totalToday - completedToday}</div>
                  <div className="text-xs text-gray-500">Remaining</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        {selectedDate ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
              <CardDescription>
                {selectedDateTasks.length} tasks scheduled
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 border rounded-lg",
                        task.completed && "opacity-60 bg-gray-50"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm",
                            task.completed && "line-through text-gray-500"
                          )}>
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.roadmaps.goals.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {task.estimated_duration} min
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No tasks scheduled for this date
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today's Tasks</CardTitle>
              <CardDescription>Your tasks for today</CardDescription>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <SimpleTaskList tasks={todayTasks} goalId="" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'