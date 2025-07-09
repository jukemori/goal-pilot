'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Clock, Calendar, MoreHorizontal, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { completeTask, uncompleteTask, rescheduleTask } from '@/app/actions/tasks'
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

export function TaskList({ tasks, goalId: _goalId, pageSize = 20 }: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all')

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => 
        statusFilter === 'completed' ? task.completed : !task.completed
      )
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === parseInt(priorityFilter))
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      filtered = filtered.filter(task => {
        switch (dateFilter) {
          case 'today':
            return task.scheduled_date === today
          case 'week':
            return task.scheduled_date >= today && task.scheduled_date <= weekFromNow
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
    return filteredTasks.reduce((acc, task) => {
      const date = task.scheduled_date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(task)
      return acc
    }, {} as Record<string, Task[]>)
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
      case 5: return 'bg-red-100 text-red-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-primary/10 text-primary'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 5: return 'Critical'
      case 4: return 'High'
      case 3: return 'Medium'
      case 2: return 'Low'
      default: return 'Lowest'
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">No tasks yet</p>
        <p className="text-sm text-gray-400">Tasks will appear here once your roadmap is generated</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">{tasks.length}</div>
          <div className="text-xs text-gray-600">Total Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">{tasks.filter(t => t.completed).length}</div>
          <div className="text-xs text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">{tasks.filter(t => !t.completed && t.scheduled_date < new Date().toISOString().split('T')[0]).length}</div>
          <div className="text-xs text-gray-600">Overdue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">{filteredTasks.length}</div>
          <div className="text-xs text-gray-600">Filtered</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value: typeof statusFilter) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={(value: typeof priorityFilter) => setPriorityFilter(value)}>
            <SelectTrigger className="w-[140px]">
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

          <Select value={dateFilter} onValueChange={(value: typeof dateFilter) => setDateFilter(value)}>
            <SelectTrigger className="w-[140px]">
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
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setPriorityFilter('all')
              setDateFilter('all')
            }}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {paginatedDates.map((date) => {
        const dateTasks = groupedTasks[date]
        
        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-medium">
                {format(parseISO(date), 'EEEE, MMMM d')}
              </h3>
              <Badge variant="outline" className="text-xs">
                {dateTasks.filter(t => t.completed).length}/{dateTasks.length}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {dateTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg transition-colors",
                    task.completed && "opacity-60 bg-gray-50"
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleToggleComplete(task)}
                    disabled={loadingTaskId === task.id}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={cn(
                        "font-medium text-sm",
                        task.completed && "line-through text-gray-500"
                      )}>
                        {task.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getPriorityColor(task.priority || 3))}
                      >
                        {getPriorityLabel(task.priority || 3)}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_duration} min
                      </div>
                      {task.completed_at && (
                        <div className="flex items-center gap-1 text-primary">
                          <CheckCircle className="h-3 w-3" />
                          Completed {format(parseISO(task.completed_at), 'h:mm a')}
                        </div>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
                          handleReschedule(task.id, tomorrow.toISOString().split('T')[0])
                        }}
                      >
                        Reschedule to Tomorrow
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const nextWeek = new Date()
                          nextWeek.setDate(nextWeek.getDate() + 7)
                          handleReschedule(task.id, nextWeek.toISOString().split('T')[0])
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
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No tasks found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedDates.length)} of {sortedDates.length} date groups
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = currentPage <= 3 
                  ? i + 1 
                  : currentPage + i - 2 <= totalPages 
                    ? currentPage + i - 2 
                    : totalPages - 4 + i
                    
                if (pageNumber > totalPages) return null
                
                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
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