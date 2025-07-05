'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Calendar, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { completeTask, uncompleteTask, rescheduleTask } from '@/app/actions/tasks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string | null
  scheduled_date: string
  estimated_duration: number
  completed: boolean
  completed_at: string | null
  priority: number
}

interface TaskListProps {
  tasks: Task[]
  goalId: string
}

export function TaskList({ tasks, goalId }: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.scheduled_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort()

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
    } catch (error) {
      toast.error('Failed to update task')
    } finally {
      setLoadingTaskId(null)
    }
  }

  async function handleReschedule(taskId: string, newDate: string) {
    try {
      await rescheduleTask(taskId, newDate)
      toast.success('Task rescheduled')
    } catch (error) {
      toast.error('Failed to reschedule task')
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 5: return 'bg-red-100 text-red-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 2: return 'bg-blue-100 text-blue-800'
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
    <div className="space-y-6">
      {sortedDates.map((date) => {
        const dateTasks = groupedTasks[date]
        
        return (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-medium">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
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
                      <CheckCircle className="h-4 w-4 text-green-600" />
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
                        className={cn("text-xs", getPriorityColor(task.priority))}
                      >
                        {getPriorityLabel(task.priority)}
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
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Completed {new Date(task.completed_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
  )
}