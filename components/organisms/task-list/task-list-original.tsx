'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle,
  Clock,
  Calendar,
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  completeTask,
  uncompleteTask,
  rescheduleTask,
} from '@/app/actions/tasks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tables } from '@/types/database'
import { format, parseISO } from 'date-fns'

type Task = Tables<'tasks'>

interface TaskListProps {
  tasks: Task[]
  goalId: string
  pageSize?: number
}

export function TaskList({
  tasks,
  goalId: _goalId,
  pageSize = 20,
}: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'completed' | 'pending'
  >('all')
  const [priorityFilter, setPriorityFilter] = useState<
    'all' | '5' | '4' | '3' | '2' | '1'
  >('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<
    'all' | 'today' | 'week' | 'overdue'
  >('all')

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((task) =>
        statusFilter === 'completed' ? task.completed : !task.completed,
      )
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(
        (task) => task.priority === parseInt(priorityFilter),
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

      filtered = filtered.filter((task) => {
        switch (dateFilter) {
          case 'today':
            return task.scheduled_date === today
          case 'week':
            return (
              task.scheduled_date >= today && task.scheduled_date <= weekFromNow
            )
          case 'overdue':
            return task.scheduled_date < today && !task.completed
          default:
            return true
        }
      })
    }

    return filtered
  }, [tasks, searchQuery, statusFilter, priorityFilter, dateFilter])

  // Group filtered tasks by date
  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce(
      (acc, task) => {
        const date = task.scheduled_date
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(task)
        return acc
      },
      {} as Record<string, Task[]>,
    )
  }, [filteredTasks])

  // Sort dates and paginate
  const sortedDates = Object.keys(groupedTasks).sort()

  // Calculate pagination for dates (not individual tasks)
  const totalPages = Math.ceil(sortedDates.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedDates = sortedDates.slice(startIndex, endIndex)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter, dateFilter])

  async function handleToggleComplete(task: Task) {
    setLoadingTaskId(task.id)
    try {
      if (task.completed) {
        await uncompleteTask(task.id)
        toast.success('Task marked as incomplete')
      } else {
        await completeTask(task.id)
        toast.success('Task completed!')
      }
    } catch {
      toast.error('Failed to update task')
    } finally {
      setLoadingTaskId(null)
    }
  }

  async function handleReschedule(taskId: string, newDate: string) {
    try {
      await rescheduleTask(taskId, newDate)
      toast.success('Task rescheduled')
    } catch {
      toast.error('Failed to reschedule task')
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5:
        return 'bg-red-100 text-red-800'
      case 4:
        return 'bg-orange-100 text-orange-800'
      case 3:
        return 'bg-yellow-100 text-yellow-800'
      case 2:
        return 'bg-primary/10 text-primary'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5:
        return 'Critical'
      case 4:
        return 'High'
      case 3:
        return 'Medium'
      case 2:
        return 'Low'
      default:
        return 'Lowest'
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center">
        <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-2 text-gray-500">No tasks yet</p>
        <p className="text-sm text-gray-400">
          Tasks will appear here once your roadmap is generated
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
          <div className="text-xs text-gray-600">Total Tasks</div>
        </div>
        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {tasks.filter((t) => t.completed).length}
          </div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {
              tasks.filter(
                (t) =>
                  !t.completed &&
                  t.scheduled_date < new Date().toISOString().split('T')[0],
              ).length
            }
          </div>
          <div className="text-xs text-gray-600">Overdue</div>
        </div>
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
            <Filter className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {filteredTasks.length}
          </div>
          <div className="text-xs text-gray-600">Filtered</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:border-primary focus:ring-primary/20 h-12 rounded-xl border-gray-200 bg-white pl-12 text-base shadow-sm focus:ring-2"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value: typeof statusFilter) =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter}
            onValueChange={(value: typeof priorityFilter) =>
              setPriorityFilter(value)
            }
          >
            <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="5">Critical</SelectItem>
              <SelectItem value="4">High</SelectItem>
              <SelectItem value="3">Medium</SelectItem>
              <SelectItem value="2">Low</SelectItem>
              <SelectItem value="1">Lowest</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dateFilter}
            onValueChange={(value: typeof dateFilter) => setDateFilter(value)}
          >
            <SelectTrigger className="focus:border-primary focus:ring-primary/20 h-10 w-[140px] rounded-xl border-gray-200 bg-white shadow-sm focus:ring-2">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setPriorityFilter('all')
              setDateFilter('all')
            }}
            className="focus:border-primary focus:ring-primary/20 h-9 gap-2 rounded-xl border-gray-200 bg-white px-4 shadow-sm focus:ring-2"
          >
            <Filter className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-8">
        {paginatedDates.map((date) => {
          const dateTasks = groupedTasks[date]

          return (
            <div key={date}>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary h-2 w-2 rounded-full"></div>
                  <h3 className="font-semibold text-gray-800">
                    {format(parseISO(date), 'EEEE, MMMM d')}
                  </h3>
                </div>
                <Badge variant="outline" className="bg-gray-50 text-xs">
                  {dateTasks.filter((t) => t.completed).length}/
                  {dateTasks.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {dateTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md',
                      task.completed && 'bg-gray-50/80 opacity-60',
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-primary/10 h-8 w-8 p-0"
                      onClick={() => handleToggleComplete(task)}
                      disabled={loadingTaskId === task.id}
                    >
                      {task.completed ? (
                        <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      ) : (
                        <div className="hover:border-primary h-5 w-5 rounded-full border-2 border-gray-300 transition-colors" />
                      )}
                    </Button>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4
                          className={cn(
                            'text-sm font-medium',
                            task.completed && 'text-gray-500 line-through',
                          )}
                        >
                          {task.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            getPriorityColor(task.priority || 3),
                          )}
                        >
                          {getPriorityLabel(task.priority || 3)}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="mb-1 text-sm text-gray-600">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration} min
                        </div>
                        {task.completed_at && (
                          <div className="text-primary flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Completed{' '}
                            {format(parseISO(task.completed_at), 'h:mm a')}
                          </div>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleComplete(task)}
                        >
                          {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const tomorrow = new Date()
                            tomorrow.setDate(tomorrow.getDate() + 1)
                            handleReschedule(
                              task.id,
                              tomorrow.toISOString().split('T')[0],
                            )
                          }}
                        >
                          Reschedule to Tomorrow
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const nextWeek = new Date()
                            nextWeek.setDate(nextWeek.getDate() + 7)
                            handleReschedule(
                              task.id,
                              nextWeek.toISOString().split('T')[0],
                            )
                          }}
                        >
                          Reschedule to Next Week
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* No results message */}
      {filteredTasks.length === 0 && (
        <div className="py-8 text-center">
          <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-2 text-gray-500">No tasks found</p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedDates.length)} of{' '}
            {sortedDates.length} date groups
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber =
                  currentPage <= 3
                    ? i + 1
                    : currentPage + i - 2 <= totalPages
                      ? currentPage + i - 2
                      : totalPages - 4 + i

                if (pageNumber > totalPages) return null

                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="h-8 w-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
