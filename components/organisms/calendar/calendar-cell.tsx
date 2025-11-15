import { cn } from '@/lib/utils'
import { type TaskWithRoadmap } from '@/features/tasks/hooks/use-tasks'

interface CalendarTaskItemProps {
  task: TaskWithRoadmap
  className?: string
}

export function CalendarTaskItem({
  task,
  className = '',
}: CalendarTaskItemProps) {
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
}

export function CalendarTaskItemDesktop({ task }: { task: TaskWithRoadmap }) {
  return (
    <div
      className="bg-primary/10 text-primary w-full overflow-hidden rounded px-1 py-0.5 text-[10px]"
      title={task.title}
      style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      <div className="w-full truncate leading-tight">{task.title}</div>
    </div>
  )
}

interface CalendarTasksContainerProps {
  tasks: TaskWithRoadmap[]
}

export function CalendarTasksContainer({ tasks }: CalendarTasksContainerProps) {
  const firstTask = tasks[0]
  const secondTask = tasks[1]
  const hasMoreTasks = tasks.length > 1
  const desktopMoreCount = tasks.length > 2 ? tasks.length - 2 : 0

  if (tasks.length === 0) return null

  return (
    <div className="min-h-0 w-full flex-1 space-y-0.5 overflow-hidden md:space-y-1">
      <CalendarTaskItem task={firstTask} />

      {secondTask && (
        <div className="hidden w-full md:block">
          <CalendarTaskItemDesktop task={secondTask} />
        </div>
      )}

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
}

interface CalendarCellProps {
  date: Date
  tasks: TaskWithRoadmap[]
  isSelected: boolean
  isToday: boolean
  isCurrentMonth: boolean
  onSelect: (date: string) => void
}

export function CalendarCell({
  date,
  tasks,
  isSelected,
  isToday,
  isCurrentMonth,
  onSelect,
}: CalendarCellProps) {
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const handleClick = () => {
    onSelect(isSelected ? '' : dateString)
  }

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
}
