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

export function TaskGroup({ date, tasks, loadingTaskId, onToggleComplete }: TaskGroupProps) {
  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <h3 className="font-semibold text-gray-800">
            {format(parseISO(date), 'EEEE, MMMM d')}
          </h3>
        </div>
        <Badge variant="outline" className="text-xs bg-gray-50">
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