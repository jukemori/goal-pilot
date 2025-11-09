'use client'

import { useState } from 'react'
import { Button } from '@/components/atoms/button'
import { Badge } from '@/components/atoms/badge'
import { CheckCircle, Clock, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/atoms/dropdown-menu'
import { completeTask, uncompleteTask } from '@/app/actions/tasks'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import type { TaskWithRoadmap } from '@/features/tasks/hooks/use-tasks'

interface SimpleTaskListProps {
  tasks: TaskWithRoadmap[]
  goalId: string
}

export function SimpleTaskList({
  tasks,
  goalId: _goalId,
}: SimpleTaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleToggleComplete = async (task: TaskWithRoadmap) => {
    setLoadingTaskId(task.id)
    try {
      if (task.completed) {
        await uncompleteTask(task.id)
        toast.success('Task marked as incomplete')
      } else {
        await completeTask(task.id)
        toast.success('Task completed!')
      }

      // Invalidate calendar queries to refresh the data
      const currentDate = new Date()
      queryClient.invalidateQueries({
        queryKey: [
          'calendar-optimized',
          currentDate.getFullYear(),
          currentDate.getMonth(),
        ],
      })
      // Also invalidate any other task-related queries
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    } catch {
      toast.error('Failed to update task')
    } finally {
      setLoadingTaskId(null)
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
        <div className="relative mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-50 to-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div className="absolute top-0 left-1/2 -z-10 h-16 w-16 -translate-x-1/2 transform rounded-full bg-green-50"></div>
        </div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900">
          No tasks for today
        </h3>
        <p className="text-xs text-gray-500">Enjoy your free time!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Task Statistics */}
      <TaskStatistics tasks={tasks} />

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-colors',
              task.completed && 'bg-gray-50 opacity-60',
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
                <CheckCircle className="text-primary h-4 w-4" />
              ) : (
                <div className="h-4 w-4 rounded border-2 border-gray-300" />
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
                    getPriorityColor(task.priority || 1),
                  )}
                >
                  {getPriorityLabel(task.priority || 1)}
                </Badge>
              </div>

              {task.description && (
                <p className="mb-1 text-sm text-gray-600">{task.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimated_duration || 0} min
                </div>
                {task.completed_at && (
                  <div className="text-primary flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed{' '}
                    {new Date(task.completed_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
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
                <DropdownMenuItem onClick={() => handleToggleComplete(task)}>
                  {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}

// TaskStatistics component - Optimized by React Compiler
function TaskStatistics({ tasks }: { tasks: TaskWithRoadmap[] }) {
  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed === true).length,
    overdue: tasks.filter(
      (t) => t.completed !== true && t.scheduled_date < today,
    ).length,
  }

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-4">
      <div className="text-center">
        <div className="text-primary text-lg font-semibold">{stats.total}</div>
        <div className="text-xs text-gray-600">Total Tasks</div>
      </div>
      <div className="text-center">
        <div className="text-primary text-lg font-semibold">
          {stats.completed}
        </div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-orange-600">
          {stats.overdue}
        </div>
        <div className="text-xs text-gray-600">Overdue</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold text-purple-600">
          {stats.total}
        </div>
        <div className="text-xs text-gray-600">Total</div>
      </div>
    </div>
  )
}
