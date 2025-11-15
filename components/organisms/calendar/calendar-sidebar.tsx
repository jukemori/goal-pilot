import { lazy, Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/atoms/card'
import { type TaskWithRoadmap } from '@/features/tasks/hooks/use-tasks'
import { format, parseISO } from 'date-fns'
import { CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const SimpleTaskList = lazy(() =>
  import('@/components/organisms/calendar/simple-task-list').then((module) => ({
    default: module.SimpleTaskList,
  })),
)

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface TodayProgressCardProps {
  todayProgress: number
  completedToday: number
  totalToday: number
}

export function TodayProgressCard({
  todayProgress,
  completedToday,
  totalToday,
}: TodayProgressCardProps) {
  return (
    <Card className="flex-shrink-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Today's Progress</CardTitle>
        <CardDescription className="text-xs">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Completion</span>
            <span className="text-primary text-sm font-bold">
              {todayProgress}%
            </span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${todayProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-primary text-sm font-bold">
                {completedToday}
              </div>
              <div className="text-[10px] text-gray-500">Done</div>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-600">
                {totalToday - completedToday}
              </div>
              <div className="text-[10px] text-gray-500">Left</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SelectedDateTasksCardProps {
  selectedDate: string
  selectedDateTasks: TaskWithRoadmap[]
}

export function SelectedDateTasksCard({
  selectedDate,
  selectedDateTasks,
}: SelectedDateTasksCardProps) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm">
          {format(parseISO(selectedDate), 'EEE, MMM d')}
        </CardTitle>
        <CardDescription className="text-xs">
          {selectedDateTasks.length} task
          {selectedDateTasks.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <div className="h-full overflow-y-auto">
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-2">
              {selectedDateTasks.map((task: TaskWithRoadmap) => (
                <div
                  key={task.id}
                  className={cn(
                    'rounded border p-2 text-xs',
                    task.completed === true && 'bg-gray-50 opacity-60',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {task.completed === true ? (
                      <CheckCircle className="text-primary mt-0.5 h-3 w-3 flex-shrink-0" />
                    ) : (
                      <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded border border-gray-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4
                        className={cn(
                          'text-xs leading-tight font-medium',
                          task.completed === true &&
                            'text-gray-500 line-through',
                        )}
                      >
                        {task.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                        <Clock className="h-2 w-2" />
                        {task.estimated_duration || 0}
                        min
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-gray-500">
              No tasks scheduled
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface TodayTasksCardProps {
  todayTasks: TaskWithRoadmap[]
}

export function TodayTasksCard({ todayTasks }: TodayTasksCardProps) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-sm">Today's Tasks</CardTitle>
        <CardDescription className="text-xs">Current tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <div className="h-full overflow-y-auto">
          <Suspense fallback={<TaskListSkeleton />}>
            <SimpleTaskList tasks={todayTasks} goalId="" />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}

interface CalendarSidebarProps {
  selectedDate: string | null
  selectedDateTasks: TaskWithRoadmap[]
  todayTasks: TaskWithRoadmap[]
  todayProgress: number
  completedToday: number
  totalToday: number
}

export function CalendarSidebar({
  selectedDate,
  selectedDateTasks,
  todayTasks,
  todayProgress,
  completedToday,
  totalToday,
}: CalendarSidebarProps) {
  return (
    <div className="flex h-full flex-col space-y-4">
      <TodayProgressCard
        todayProgress={todayProgress}
        completedToday={completedToday}
        totalToday={totalToday}
      />

      {selectedDate ? (
        <SelectedDateTasksCard
          selectedDate={selectedDate}
          selectedDateTasks={selectedDateTasks}
        />
      ) : (
        <TodayTasksCard todayTasks={todayTasks} />
      )}
    </div>
  )
}
