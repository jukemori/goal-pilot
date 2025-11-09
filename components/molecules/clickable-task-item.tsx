'use client'

import { CheckCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/atoms/badge'
import { cn } from '@/lib/utils'
import { useCompleteTask, useUncompleteTask } from '@/features/tasks/hooks/use-tasks'
import { Task } from '@/types/database'

interface ClickableTaskItemProps {
  task: Task
}

export function ClickableTaskItem({ task }: ClickableTaskItemProps) {
  const completeTask = useCompleteTask()
  const uncompleteTask = useUncompleteTask()

  const handleTaskClick = () => {
    if (task.completed === true) {
      uncompleteTask.mutate(task.id)
    } else {
      completeTask.mutate(task.id)
    }
  }

  return (
    <div
      onClick={handleTaskClick}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all duration-300 hover:shadow-md',
        task.completed === true
          ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-100 opacity-75'
          : 'hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100',
      )}
    >
      <div
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors',
          task.completed === true
            ? 'bg-primary border-primary'
            : 'border-gray-300 group-hover:border-blue-500',
        )}
      >
        {task.completed === true && (
          <CheckCircle className="h-3 w-3 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            'font-medium text-gray-900 transition-colors',
            task.completed === true && 'text-gray-600 line-through',
          )}
        >
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            {task.estimated_duration} min
          </div>
          {task.priority && (
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                task.priority <= 2 && 'border-red-200 text-red-600',
                task.priority === 3 && 'border-orange-200 text-orange-600',
                task.priority >= 4 && 'border-green-200 text-green-600',
              )}
            >
              {task.priority <= 2
                ? 'High'
                : task.priority === 3
                  ? 'Medium'
                  : 'Low'}{' '}
              Priority
            </Badge>
          )}
        </div>
      </div>
      {task.completed === true && (
        <div className="text-primary flex items-center gap-1 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Done
        </div>
      )}
    </div>
  )
}

// Loading skeleton component for lazy loading
export function ClickableTaskItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <div className="h-4 w-4 animate-pulse rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
