import { Badge } from '@/components/ui/badge'
import { TaskItem } from './task-item'
import { Tables } from '@/types/database'
import { format, parseISO } from 'date-fns'

type Task = Tables<'tasks'>

interface TaskGroupProps {
  date: string
  tasks: Task[]
  loadingTaskId?: string | null
  onToggleComplete?: (task: Task) => void
}

export function TaskGroup({
  date,
  tasks,
  loadingTaskId,
  onToggleComplete,
}: TaskGroupProps) {
  const completedCount = tasks.filter((t) => t.completed).length

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-2 w-2 rounded-full"></div>
          <h3 className="font-semibold text-gray-800">
            {format(parseISO(date), 'EEEE, MMMM d')}
          </h3>
        </div>
        <Badge variant="outline" className="bg-gray-50 text-xs">
          {completedCount}/{tasks.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isLoading={loadingTaskId === task.id}
            onToggleComplete={onToggleComplete}
          />
        ))}
      </div>
    </div>
  )
}
