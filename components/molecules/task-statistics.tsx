import { Calendar, CheckCircle, Clock, Filter } from 'lucide-react'
import { Tables } from '@/types/database'

type Task = Tables<'tasks'>

interface TaskStatisticsProps {
  tasks: Task[]
  filteredTasksCount: number
}

export function TaskStatistics({
  tasks,
  filteredTasksCount,
}: TaskStatisticsProps) {
  const completedCount = tasks.filter((t) => t.completed).length
  const overdueCount = tasks.filter(
    (t) =>
      !t.completed && t.scheduled_date < new Date().toISOString().split('T')[0],
  ).length

  return (
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
          {completedCount}
        </div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>

      <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Clock className="h-5 w-5 text-orange-600" />
        </div>
        <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
        <div className="text-xs text-gray-600">Overdue</div>
      </div>

      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
          <Filter className="h-5 w-5 text-purple-600" />
        </div>
        <div className="text-2xl font-bold text-purple-600">
          {filteredTasksCount}
        </div>
        <div className="text-xs text-gray-600">Filtered</div>
      </div>
    </div>
  )
}
